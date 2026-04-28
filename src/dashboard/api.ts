const API_URL = (import.meta.env.VITE_MAIL_API_URL as string | undefined) ?? 'http://37.59.98.16:3001'
const API_KEY = (import.meta.env.VITE_MAIL_API_KEY as string | undefined) ?? ''

async function post(path: string, body: unknown) {
  try {
    await fetch(`${API_URL}/api/mail/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    })
  } catch {
    // Mail failures are non-blocking — log only
    console.warn(`[mail] ${path} failed`)
  }
}

export const mailApi = {
  welcome: (data: {
    to: string
    contactName: string
    clientName: string
    email: string
    temporaryPassword: string
  }) => post('welcome', data),

  ticketCreated: (data: {
    clientName: string
    contactName: string
    ticketSubject: string
    ticketBody: string
    priority: string
    ticketId?: string
  }) => post('ticket-created', data),

  ticketReplied: (data: {
    to: string
    from: 'studio' | 'client'
    authorName: string
    clientName: string
    ticketSubject: string
    replyBody: string
    ticketId?: string
  }) => post('ticket-replied', data),

  projectStatus: (data: {
    to: string
    contactName: string
    clientName: string
    projectName: string
    projectId: string
    newStatus: string
    progress: number
    summary?: string
    isUpdate?: boolean
    updateTitle?: string
    updateBody?: string
  }) => post('project-status', { ...data, isUpdate: String(data.isUpdate ?? false) }),

  invoice: (data: {
    to: string
    contactName: string
    clientName: string
    invoiceNumber: string
    invoiceTitle: string
    amount: number
    dueDate: string
    items: Array<{ description: string; amount: number }>
    pdfBase64?: string
  }) => post('invoice', data),
}
