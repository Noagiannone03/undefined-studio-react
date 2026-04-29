import { baseTemplate, pill, cta } from './base.js'

export type ProjectStatusData = {
  contactName: string
  clientName: string
  projectName: string
  newStatus: string
  progress: number
  summary?: string
  projectUrl: string
  isUpdate?: boolean
  updateTitle?: string
  updateBody?: string
}

const STATUS_LABELS: Record<string, string> = {
  discovery: 'Cadrage',
  design: 'Design',
  build: 'D&eacute;veloppement',
  review: 'R&eacute;vision',
  live: 'En ligne',
  paused: 'En pause',
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function projectStatusTemplate(data: ProjectStatusData): string {
  const statusLabel = STATUS_LABELS[data.newStatus] ?? data.newStatus
  const isUpdate = data.isUpdate && data.updateTitle && data.updateBody
  const progress = Math.min(100, Math.max(0, data.progress))

  const content = `
    <p style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(14,14,12,0.38);margin-bottom:16px;">
      ${isUpdate ? 'Mise &agrave; jour projet' : 'Avancement'}
    </p>

    <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:38px;letter-spacing:-0.05em;line-height:0.9;color:#0E0E0C;margin-bottom:24px;">
      ${isUpdate ? escapeHtml(data.updateTitle ?? '') : `${escapeHtml(data.projectName)}<br/>avance.`}
    </h1>

    ${!isUpdate && data.summary ? `<p style="font-size:14px;line-height:1.7;color:#4A4A48;margin-bottom:28px;">${escapeHtml(data.summary)}</p>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#0E0E0C;padding:14px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#EFEBDD;">${escapeHtml(data.projectName)}</span>
              </td>
              <td valign="middle" align="right">
                ${pill(statusLabel, '#EFEBDD', 'transparent', 'rgba(239,235,221,0.3)')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0;background:#E8E4D8;border-left:2px solid #0E0E0C;border-right:2px solid #0E0E0C;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="${progress}%" style="background:#1D1DBF;height:4px;font-size:0;line-height:0;">&nbsp;</td>
              <td style="height:4px;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;border-top:none;padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td><span style="font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(14,14,12,0.4);">Avancement global</span></td>
              <td align="right"><span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:18px;color:#1D1DBF;">${progress}%</span></td>
            </tr>
          </table>
        </td>
      </tr>
      ${isUpdate ? `
      <tr>
        <td style="background:#fff;border:2px solid #0E0E0C;border-top:1px solid rgba(14,14,12,0.1);padding:20px 24px;">
          <p style="font-size:14px;line-height:1.75;color:#2A2A28;margin:0;white-space:pre-wrap;">${escapeHtml(data.updateBody ?? '').substring(0, 600)}${(data.updateBody ?? '').length > 600 ? '&hellip;' : ''}</p>
        </td>
      </tr>` : ''}
    </table>

    ${cta('Voir le projet', data.projectUrl)}
  `

  return baseTemplate(
    content,
    isUpdate
      ? `Update sur ${data.projectName} : ${data.updateTitle}`
      : `${data.projectName} &mdash; ${statusLabel} (${progress}%)`
  )
}
