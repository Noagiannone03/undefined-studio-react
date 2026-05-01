import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { ticketRepliedTemplate } from '../_lib/templates/ticketReplied.js'
import { dashboardUrl } from '../_lib/dashboard-url.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { to, from, authorName, clientName, ticketSubject, replyBody, ticketId } = req.body as Record<string, string>
  if (!from || !replyBody || !ticketSubject) {
    return res.status(400).json({ error: 'Champs manquants' })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'noa.giannone@gmail.com'
  const recipient = from === 'client' ? adminEmail : to
  if (!recipient) return res.status(400).json({ error: 'Destinataire manquant' })

  try {
    await sendMail({
      to: recipient,
      subject: `Re: ${ticketSubject}`,
      html: ticketRepliedTemplate({
        from: from as 'studio' | 'client',
        authorName: authorName || 'Undefined',
        clientName: clientName || 'Client',
        ticketSubject,
        replyBody,
        ticketUrl: dashboardUrl(`/tickets${ticketId ? `#${ticketId}` : ''}`),
      }),
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[mail/ticket-replied]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
