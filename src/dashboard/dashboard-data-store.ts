import { createContext } from 'react'
import type { Client, Invoice, InvoiceProduct, Project, ProjectUpdate, Ticket, UserProfile } from './types'

export type DashboardDataContextValue = {
    loading: boolean
    clients: Client[]
    projects: Project[]
    projectUpdates: ProjectUpdate[]
    tickets: Ticket[]
    invoices: Invoice[]
    invoiceProducts: InvoiceProduct[]
    users: UserProfile[]
    error: string | null
    hasClientScope: boolean
    findClient: (id: string | undefined) => Client | undefined
    findProject: (id: string | undefined) => Project | undefined
    invoicesForProject: (projectId: string | undefined) => Invoice[]
    updatesForProject: (projectId: string | undefined) => ProjectUpdate[]
}

export const DashboardDataContext = createContext<DashboardDataContextValue | null>(null)
