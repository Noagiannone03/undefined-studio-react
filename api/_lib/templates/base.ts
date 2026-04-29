export function baseTemplate(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#EFEBDD;">${preheader}&nbsp;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;&#8204;</div>` : ''}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #EFEBDD; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0E0E0C; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body style="background:#EFEBDD;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFEBDD;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="padding-bottom:28px;border-bottom:2px solid #0E0E0C;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="middle" style="padding-right:10px;">
                        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:24px;line-height:1;letter-spacing:-3px;display:inline-block;vertical-align:middle;"><span style="color:#E84A2A;">&gt;</span><span style="color:#1D1DBF;">&gt;</span></span>
                      </td>
                      <td valign="middle">
                        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:15px;letter-spacing:-0.03em;text-transform:uppercase;color:#0E0E0C;line-height:1;vertical-align:middle;">UNDEFINED&nbsp;STUDIO</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td valign="middle" align="right">
                  <span style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(14,14,12,0.38);">undefined-studio.fr</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SPACER -->
        <tr><td height="36"></td></tr>

        <!-- CONTENT -->
        <tr><td>${content}</td></tr>

        <!-- SPACER -->
        <tr><td height="40"></td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="border-top:1px solid rgba(14,14,12,0.14);padding-top:20px;">
            <p style="font-size:11px;color:rgba(14,14,12,0.38);line-height:1.6;margin:0;">
              Ce message est automatique &mdash; ne pas y r&eacute;pondre directement.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function pill(text: string, color = '#0E0E0C', bg = 'transparent', border = '#0E0E0C'): string {
  return `<span style="display:inline-block;background:${bg};color:${color};border:1.5px solid ${border};font-family:monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:3px 9px;">${text}</span>`
}

export function cta(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#E84A2A;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;padding:14px 32px;text-decoration:none;">${label} &rarr;</a>`
}
