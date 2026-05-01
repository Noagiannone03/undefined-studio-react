import { baseTemplate, cta } from './base.js'

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
        <td style="background:#fff;border:1px solid #0E0E0C;padding:32px;">
          <p style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(14,14,12,0.4);margin:0 0 8px;">Adresse e-mail</p>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#0E0E0C;margin:0 0 24px;">${data.email}</p>
          
          <p style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(14,14,12,0.4);margin:0 0 8px;">Mot de passe temporaire</p>
          <p style="font-family:monospace;font-size:24px;font-weight:900;color:#0E0E0C;letter-spacing:0.04em;margin:0;">${data.temporaryPassword}</p>
        </td>
      </tr>
    </table>

    ${cta('Acc&eacute;der &agrave; mon espace', data.loginUrl)}
  `
  return baseTemplate(content, `Votre espace Undefined Studio est pr&ecirc;t &mdash; ${data.contactName}`)
}
