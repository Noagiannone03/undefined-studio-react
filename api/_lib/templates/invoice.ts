import { baseTemplate, cta } from './base.js'

export type InvoiceEmailData = {
  contactName: string
  clientName: string
  invoiceNumber: string
  invoiceTitle: string
  amount: number
  dueDate: string
  items: Array<{ description: string; amount: number }>
  dashboardUrl: string
}

function formatEur(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return iso }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function invoiceTemplate(data: InvoiceEmailData): string {
  const rows = data.items.map((item) => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid rgba(14,14,12,0.08);font-size:14px;color:#2A2A28;">${escapeHtml(item.description)}</td>
      <td style="padding:14px 20px;border-bottom:1px solid rgba(14,14,12,0.08);font-size:14px;font-weight:700;color:#0E0E0C;text-align:right;white-space:nowrap;">${formatEur(item.amount)}</td>
    </tr>
  `).join('')

  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">Facturation</p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:38px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:24px;">
      Votre facture<br/>est disponible.
    </h1>

    <p style="font-size:14px;line-height:1.7;color:#4A4A48;margin-bottom:32px;">
      Bonjour <strong style="color:#0E0E0C;">${escapeHtml(data.contactName)}</strong>, veuillez trouver ci-joint la facture n°&thinsp;<strong>${escapeHtml(data.invoiceNumber)}</strong>. Le PDF est attach&eacute; &agrave; ce message.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td colspan="2" style="background:#0E0E0C;padding:14px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td><span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#EFEBDD;">${escapeHtml(data.invoiceTitle)}</span></td>
              <td align="right"><span style="font-family:monospace;font-size:9px;letter-spacing:0.12em;color:rgba(239,235,221,0.4);">N&deg;&nbsp;${escapeHtml(data.invoiceNumber)}</span></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="background:#fff;border:2px solid #0E0E0C;border-top:none;padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border:2px solid #0E0E0C;border-top:none;padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#0E0E0C;padding:16px 20px;">
                <span style="font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(239,235,221,0.45);">Total TTC</span>
              </td>
              <td style="background:#0E0E0C;padding:16px 20px;" align="right">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:22px;color:#EFEBDD;">${formatEur(data.amount)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;border:2px solid #1D1DBF;">
      <tr>
        <td style="padding:14px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <span style="font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#1D1DBF;">Date d'&eacute;ch&eacute;ance</span>
              </td>
              <td valign="middle" align="right">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1D1DBF;">${formatDate(data.dueDate)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${cta('Acc&eacute;der &agrave; mon espace', data.dashboardUrl)}
  `

  return baseTemplate(
    content,
    `Facture ${data.invoiceNumber} &mdash; ${formatEur(data.amount)} &mdash; &eacute;ch&eacute;ance ${formatDate(data.dueDate)}`
  )
}
