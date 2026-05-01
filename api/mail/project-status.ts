import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMail } from '../_lib/mailer.js'
import { requireApiKey } from '../_lib/auth.js'
import { projectStatusTemplate } from '../_lib/templates/projectStatus.js'
import { dashboardUrl } from '../_lib/dashboard-url.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireApiKey(req, res)) return

  const { to, contactName, clientName, projectName, projectId, newStatus, progress, summary, isUpdate, updateTitle, updateBody } =
    req.body as Record<string, string>

  if (!to || !projectName || !newStatus) {
    return res.status(400).json({ error: 'Champs manquants' })
  }

  const isUpdateBool = isUpdate === 'true' || (isUpdate as unknown) === true

  try {
    await sendMail({
      to,
      subject: isUpdateBool
        ? `Update projet : ${projectName} — ${updateTitle}`
        : `Votre projet ${projectName} change de statut`,
      html: projectStatusTemplate({
        contactName: contactName || clientName || '',
        clientName: clientName || '',
        projectName,
        newStatus,
        progress: parseInt(progress || '0', 10),
        summary: summary || undefined,
        projectUrl: dashboardUrl(`/projects${projectId ? `/${projectId}` : ''}`),
        isUpdate: isUpdateBool,
        updateTitle: updateTitle || undefined,
        updateBody: updateBody || undefined,
      }),
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[mail/project-status]', err)
    return res.status(500).json({ error: 'Échec envoi mail' })
  }
}
