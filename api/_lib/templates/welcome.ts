import { baseTemplate, cta } from './base'

export type WelcomeData = {
  contactName: string
  clientName: string
  email: string
  temporaryPassword: string
  loginUrl: string
}

export function welcomeTemplate(data: WelcomeData): string {
  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">Acc&egrave;s client</p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:42px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:24px;">
      Bienvenue,<br/>${data.contactName}.
    </h1>

    <p style="font-size:14px;line-height:1.7;color:#4A4A48;margin-bottom:36px;">
      Votre espace <strong style="color:#0E0E0C;">${data.clientName}</strong> est activ&eacute;. Voici vos identifiants de premi&egrave;re connexion &mdash; un nouveau mot de passe vous sera demand&eacute; ensuite.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;padding:18px 24px;border-bottom:none;">
          <p style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin:0 0 8px;">Adresse e-mail</p>
          <p style="font-family:monospace;font-size:16px;font-weight:700;color:#0E0E0C;margin:0;">${data.email}</p>
        </td>
      </tr>
      <tr>
        <td style="background:#0E0E0C;height:2px;font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;padding:18px 24px;border-top:none;">
          <p style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin:0 0 12px;">Mot de passe temporaire</p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#E84A2A;padding:10px 20px;">
                <span style="font-family:monospace;font-size:20px;font-weight:900;color:#fff;letter-spacing:0.06em;">${data.temporaryPassword}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${cta('Acc&eacute;der &agrave; mon espace', data.loginUrl)}
  `
  return baseTemplate(content, `Votre espace Undefined Studio est pr&ecirc;t &mdash; ${data.contactName}`)
}
