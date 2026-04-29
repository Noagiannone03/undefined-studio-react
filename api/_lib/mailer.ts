import nodemailer from 'nodemailer'

let _transport: nodemailer.Transporter | null = null

function getTransport() {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        type: 'LOGIN',
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
      tls: { rejectUnauthorized: false },
    })
  }
  return _transport
}

export type MailAttachment = {
  filename: string
  content: Buffer
  contentType: string
}

export async function sendMail(opts: {
  to: string | string[]
  subject: string
  html: string
  attachments?: MailAttachment[]
}) {
  const from = process.env.MAIL_FROM ?? '"Undefined Studio" <hello@undefinedstudio.fr>'
  await getTransport().sendMail({
    from,
    to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  })
}
