import { baseTemplate, pill, cta } from './base'

export type TicketCreatedData = {
  clientName: string
  contactName: string
  ticketSubject: string
  ticketBody: string
  priority: 'low' | 'normal' | 'high'
  ticketUrl: string
}

const PRIORITY: Record<string, { bg: string; color: string; label: string; border: string }> = {
  high:   { bg: '#E84A2A', color: '#fff',    label: 'Haute',   border: '#E84A2A' },
  normal: { bg: '#1D1DBF', color: '#EFEBDD', label: 'Normale', border: '#1D1DBF' },
  low:    { bg: 'transparent', color: '#0E0E0C', label: 'Basse', border: '#0E0E0C' },
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function ticketCreatedTemplate(data: TicketCreatedData): string {
  const p = PRIORITY[data.priority] ?? PRIORITY.normal

  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">Support</p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:38px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:20px;">
      Nouveau ticket<br/>re&ccedil;u.
    </h1>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td valign="middle" style="padding-right:12px;">
          <span style="font-size:14px;color:#0E0E0C;font-weight:700;">${escapeHtml(data.contactName)}</span>
          <span style="font-size:14px;color:rgba(14,14,12,0.4);margin:0 8px;">&middot;</span>
          <span style="font-size:14px;color:#4A4A48;">${escapeHtml(data.clientName)}</span>
        </td>
        <td valign="middle">
          ${pill(p.label, p.color, p.bg, p.border)}
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#0E0E0C;padding:14px 20px;">
          <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#EFEBDD;">${escapeHtml(data.ticketSubject)}</span>
        </td>
      </tr>
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;border-top:none;padding:24px;">
          <p style="font-size:14px;line-height:1.75;color:#2A2A28;margin:0;white-space:pre-wrap;">${escapeHtml(data.ticketBody).substring(0, 500)}${data.ticketBody.length > 500 ? '&hellip;' : ''}</p>
        </td>
      </tr>
    </table>

    ${cta('Voir le ticket', data.ticketUrl)}
  `

  return baseTemplate(content, `Ticket de ${data.contactName} : ${data.ticketSubject}`)
}
