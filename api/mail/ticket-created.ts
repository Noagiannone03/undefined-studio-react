import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { ticketCreatedTemplate } from '../_lib/templates/ticketCreated.js'
import { dashboardUrl } from '../_lib/dashboard-url.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { clientName, contactName, ticketSubject, ticketBody, priority, ticketId } = req.body as Record<string, string>
  if (!clientName || !ticketSubject || !ticketBody) {
    return res.status(400).json({ error: 'Champs manquants' })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'noa.giannone@gmail.com'

  try {
    await sendMail({
      to: adminEmail,
      subject: `Nouveau ticket — ${clientName} : ${ticketSubject}`,
      html: ticketCreatedTemplate({
        clientName,
        contactName: contactName || clientName,
        ticketSubject,
        ticketBody,
        priority: (priority as 'low' | 'normal' | 'high') || 'normal',
        ticketUrl: dashboardUrl(`/tickets${ticketId ? `#${ticketId}` : ''}`),
      }),
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[mail/ticket-created]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
