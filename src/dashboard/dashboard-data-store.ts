import { createContext } from 'react'
import type { Client, Invoice, Project, ProjectUpdate, Ticket, UserProfile } from './types'

export type DashboardDataContextValue = {
    loading: boolean
    clients: Client[]
    projects: Project[]
    projectUpdates: ProjectUpdate[]
    tickets: Ticket[]
    invoices: Invoice[]
    users: UserProfile[]
    findClient: (id: string | undefined) => Client | undefined
    findProject: (id: string | undefined) => Project | undefined
    updatesForProject: (projectId: string | undefined) => ProjectUpdate[]
}

export const DashboardDataContext = createContext<DashboardDataContextValue | null>(null)
