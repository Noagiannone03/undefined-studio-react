import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { invoiceTemplate } from '../_lib/templates/invoice.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { to, contactName, clientName, invoiceNumber, invoiceTitle, amount, dueDate, items, pdfBase64 } =
    req.body as Record<string, unknown>

  if (!to || !invoiceNumber || !amount) {
    return res.status(400).json({ error: 'Champs manquants' })
  }

  const parsedItems = Array.isArray(items)
    ? (items as Array<{ description: string; amount: number }>)
    : []

  const attachments = pdfBase64
    ? [{
        filename: `Facture-${invoiceNumber}.pdf`,
        content: Buffer.from(pdfBase64 as string, 'base64'),
        contentType: 'application/pdf',
      }]
    : []

  const siteUrl = process.env.SITE_URL ?? 'https://undefined-studio.fr'

  try {
    await sendMail({
      to: to as string,
      subject: `Facture n° ${invoiceNumber} — Undefined Studio`,
      html: invoiceTemplate({
        contactName: (contactName as string) || (clientName as string) || '',
        clientName: (clientName as string) || '',
        invoiceNumber: invoiceNumber as string,
        invoiceTitle: (invoiceTitle as string) || '',
        amount: Number(amount),
        dueDate: (dueDate as string) || '',
        items: parsedItems,
        dashboardUrl: `${siteUrl}/app/invoices`,
      }),
      attachments,
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[mail/invoice]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
