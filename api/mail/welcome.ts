import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { welcomeTemplate } from '../_lib/templates/welcome.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { to, contactName, clientName, email, temporaryPassword } = req.body as Record<string, string>
  if (!to || !contactName || !clientName || !email || !temporaryPassword) {
    return res.status(400).json({ error: 'Champs manquants' })
  }

  try {
    await sendMail({
      to,
      subject: 'Bienvenue sur votre espace Undefined Studio',
      html: welcomeTemplate({
        contactName,
        clientName,
        email,
        temporaryPassword,
        loginUrl: `${process.env.SITE_URL ?? 'https://undefined-studio.fr'}/app/login`,
      }),
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[mail/welcome]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
