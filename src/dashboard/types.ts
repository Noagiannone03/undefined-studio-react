export type User = {
    email: string
    name: string
    clientId: string
    company?: string
}

export type ProjectStatus = 'discovery' | 'design' | 'build' | 'review' | 'live' | 'paused'

export type Milestone = {
    id: string
    label: string
    status: 'done' | 'current' | 'upcoming'
    date?: string
    note?: string
}

export type Project = {
    id: string
    name: string
    tagline: string
    status: ProjectStatus
    progress: number // 0–100
    accent: string
    kickoff: string
    delivery: string
    milestones: Milestone[]
    updates: ProjectUpdate[]
}

export type ProjectUpdate = {
    id: string
    date: string
    title: string
    body: string
    author: string
}

export type TicketStatus = 'open' | 'answered' | 'resolved'
export type TicketPriority = 'low' | 'normal' | 'high'

export type Ticket = {
    id: string
    subject: string
    body: string
    status: TicketStatus
    priority: TicketPriority
    createdAt: string
    project?: string // project id
    messages: TicketMessage[]
}

export type TicketMessage = {
    id: string
    from: 'client' | 'studio'
    body: string
    at: string
}

export type InvoiceStatus = 'paid' | 'due' | 'overdue' | 'draft'

export type Invoice = {
    id: string
    number: string
    project: string // project id
    amount: number // in €
    status: InvoiceStatus
    issued: string
    due: string
}
