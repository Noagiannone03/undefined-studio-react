import { baseTemplate, cta } from './base.js'

export type TicketRepliedData = {
  from: 'studio' | 'client'
  authorName: string
  clientName: string
  ticketSubject: string
  replyBody: string
  ticketUrl: string
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function ticketRepliedTemplate(data: TicketRepliedData): string {
  const isStudio = data.from === 'studio'

  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">Support &mdash; R&eacute;ponse</p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:38px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:24px;">
      ${isStudio ? 'Nouvelle r&eacute;ponse<br/>du studio.' : 'R&eacute;ponse<br/>re&ccedil;ue.'}
    </h1>

    <p style="font-family:monospace;font-size:11px;letter-spacing:0.06em;color:rgba(14,14,12,0.4);margin-bottom:28px;">Re&nbsp;: ${escapeHtml(data.ticketSubject)}</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#0E0E0C;padding:12px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <span style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#EFEBDD;">${isStudio ? 'Undefined Studio' : escapeHtml(data.authorName)}</span>
                ${!isStudio ? `<span style="font-family:monospace;font-size:9px;color:rgba(239,235,221,0.45);margin-left:10px;">&middot; ${escapeHtml(data.clientName)}</span>` : ''}
              </td>
              <td valign="middle" align="right">
                <span style="font-family:monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${isStudio ? '#1D1DBF' : '#E84A2A'};background:${isStudio ? 'rgba(29,29,191,0.18)' : 'rgba(232,74,42,0.18)'};padding:3px 9px;font-weight:700;">${isStudio ? 'Studio' : 'Client'}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;border-top:none;padding:24px;">
          <p style="font-size:14px;line-height:1.75;color:#2A2A28;margin:0;white-space:pre-wrap;">${escapeHtml(data.replyBody).substring(0, 600)}${data.replyBody.length > 600 ? '&hellip;' : ''}</p>
        </td>
      </tr>
    </table>

    ${cta('Voir le fil complet', data.ticketUrl)}
  `

  return baseTemplate(
    content,
    isStudio
      ? `R&eacute;ponse du studio : ${data.ticketSubject}`
      : `${data.authorName} a r&eacute;pondu : ${data.ticketSubject}`
  )
}
