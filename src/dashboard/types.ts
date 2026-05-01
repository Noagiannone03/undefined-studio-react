export type AppRole = 'admin' | 'client'
export type ClientStatus = 'active' | 'lead' | 'archived'

export type UserProfile = {
    uid: string
    email: string
    name: string
    role: AppRole
    // clientId is derived from clientIds[0] — never stored directly anymore
    clientId: string | null
    clientIds: string[]
    mustChangePassword: boolean
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export type Client = {
    id: string
    slug: string
    name: string
    status: ClientStatus
    contactName: string
    contactEmail: string
    billingEmail: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

export type ProjectStatus =
    | 'active'
    | 'done'
    | 'paused'
    | 'waiting'
    // Legacy values kept for existing Firebase documents.
    | 'discovery'
    | 'design'
    | 'build'
    | 'review'
    | 'live'

export type Milestone = {
    id: string
    label: string
    status: 'done' | 'current' | 'upcoming'
    date?: string
    note?: string
}

export type Project = {
    id: string
    clientId: string
    name: string
    tagline: string
    status: ProjectStatus
    progress: number // 0–100
    accent: string
    kickoff: string
    delivery: string
    summary?: string
    milestones: Milestone[]
    createdAt?: string
    updatedAt?: string
}

export type ProjectUpdate = {
    id: string
    projectId: string
    clientId: string
    date: string
    title: string
    body: string
    authorName: string
    milestoneId?: string
    milestoneLabel?: string
}

export type TicketStatus = 'open' | 'answered' | 'resolved'
export type TicketPriority = 'low' | 'normal' | 'high'

export type Ticket = {
    id: string
    clientId: string
    subject: string
    body: string
    status: TicketStatus
    priority: TicketPriority
    createdAt: string
    updatedAt?: string
    projectId?: string
    createdByUid?: string
    createdByName?: string
    messages: TicketMessage[]
}

export type TicketMessage = {
    id: string
    from: 'client' | 'studio'
    authorName?: string
    body: string
    at: string
}

export type InvoiceStatus = 'paid' | 'due' | 'overdue' | 'draft'
export type InvoiceSource = 'generated' | 'uploaded'

export type InvoiceItem = {
    id: string
    description: string
    amount: number // HT in €
}

export type Invoice = {
    id: string
    clientId: string
    number: string
    projectId: string
    title: string
    items: InvoiceItem[]
    terms: string[]
    amount: number // total TTC in € — derived from items for generated, manually set for uploaded
    status: InvoiceStatus
    issued: string
    due: string
    source: InvoiceSource
    pdfUrl?: string
    storagePath?: string
    notes?: string
    sentAt?: string
    createdAt?: string
    updatedAt?: string
}
