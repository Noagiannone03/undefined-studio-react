import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer'
import { baseTemplate, cta } from '../_lib/templates/base'

function buildReminderHtml(month: string, year: string, dashboardUrl: string): string {
  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">Rappel mensuel</p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:42px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:24px;">
      D&eacute;but de mois &mdash;<br/>les factures.
    </h1>

    <p style="font-size:14px;line-height:1.7;color:#4A4A48;margin-bottom:32px;">
      C'est le 1<sup>er</sup> <strong style="color:#0E0E0C;">${month} ${year}</strong>. Pense &agrave; v&eacute;rifier les factures en attente et &agrave; envoyer celles du mois en cours depuis le dashboard.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;border:2px solid #1D1DBF;">
      <tr>
        <td style="padding:18px 24px;">
          <p style="font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#1D1DBF;margin:0 0 8px;">Checklist</p>
          <ul style="font-size:14px;line-height:2;color:#2A2A28;margin:0;padding-left:20px;">
            <li>V&eacute;rifier les factures en statut <strong>Due</strong> ou <strong>En retard</strong></li>
            <li>&Eacute;mettre les nouvelles factures du mois</li>
            <li>Marquer les paiements re&ccedil;us comme <strong>Pay&eacute;s</strong></li>
          </ul>
        </td>
      </tr>
    </table>

    ${cta('Ouvrir les factures', dashboardUrl)}
  `
  return baseTemplate(content, `Rappel facturation — ${month} ${year}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel automatically adds Authorization: Bearer <CRON_SECRET> for cron jobs
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  const now = new Date()
  const month = now.toLocaleDateString('fr-FR', { month: 'long' })
  const year = String(now.getFullYear())
  const adminEmail = process.env.ADMIN_EMAIL ?? 'noa.giannone@gmail.com'
  const siteUrl = process.env.SITE_URL ?? 'https://undefined-studio.fr'

  try {
    await sendMail({
      to: adminEmail,
      subject: `Rappel facturation — ${month} ${year}`,
      html: buildReminderHtml(month, year, `${siteUrl}/app/invoices`),
    })
    console.log(`[cron/monthly-reminder] Email envoyé à ${adminEmail}`)
    return res.json({ ok: true, month, year })
  } catch (err) {
    console.error('[cron/monthly-reminder]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
