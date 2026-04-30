import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { invoiceTemplate } from '../_lib/templates/invoice.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { to, contactName, clientName, invoiceNumber, invoiceTitle, amount, dueDate, items, pdfBase64 } =
    req.body as Record<string, unknown>

  const parsedAmount =
    typeof amount === 'number'
      ? amount
      : typeof amount === 'string' && amount.trim()
        ? Number(amount)
        : NaN

  const issues: string[] = []
  if (typeof to !== 'string' || !to.trim()) issues.push('email de facturation')
  if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) issues.push('numéro de facture')
  if (!Number.isFinite(parsedAmount)) issues.push('montant')

  if (
    issues.length > 0
  ) {
    console.warn('[mail/invoice] invalid payload', {
      hasTo: typeof to === 'string' && Boolean(to.trim()),
      hasInvoiceNumber: typeof invoiceNumber === 'string' && Boolean(invoiceNumber.trim()),
      amount,
      issues,
    })
    return res.status(400).json({
      error: `Envoi impossible: champ(s) manquant(s) ou invalide(s) (${issues.join(', ')}).`,
    })
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
        amount: parsedAmount,
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
