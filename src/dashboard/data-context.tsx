import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { FirestoreError } from 'firebase/firestore'
import { useAuth } from './auth'
import { DashboardDataContext, type DashboardDataContextValue } from './dashboard-data-store'
import {
    subscribeClients,
    subscribeInvoices,
    subscribeProjects,
    subscribeProjectUpdates,
    subscribeTickets,
    subscribeUsers,
} from './firestore'
import type { Client, Invoice, Project, ProjectUpdate, Ticket, UserProfile } from './types'

type ScopedItems<T> = {
    scopeUid: string | null
    items: T[]
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [clientsState, setClientsState] = useState<ScopedItems<Client>>({ scopeUid: null, items: [] })
    const [projectsState, setProjectsState] = useState<ScopedItems<Project>>({ scopeUid: null, items: [] })
    const [projectUpdatesState, setProjectUpdatesState] = useState<ScopedItems<ProjectUpdate>>({ scopeUid: null, items: [] })
    const [ticketsState, setTicketsState] = useState<ScopedItems<Ticket>>({ scopeUid: null, items: [] })
    const [invoicesState, setInvoicesState] = useState<ScopedItems<Invoice>>({ scopeUid: null, items: [] })
    const [usersState, setUsersState] = useState<ScopedItems<UserProfile>>({ scopeUid: null, items: [] })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const scopeUid = user.uid
        setError(null)

        const reportError = (label: string) => (err: FirestoreError) => {
            console.error(`[dashboard-data] ${label} subscription failed`, err)
            setError(`Impossible de charger ${label}. Vérifie tes droits.`)
        }

        const unsubs = [
            subscribeUsers(
                user,
                (items) => setUsersState({ scopeUid, items }),
                reportError('les utilisateurs'),
            ),
            subscribeClients(
                user,
                (items) => setClientsState({ scopeUid, items }),
                reportError('les clients'),
            ),
            subscribeProjects(
                user,
                (items) => setProjectsState({ scopeUid, items }),
                reportError('les projets'),
            ),
            subscribeProjectUpdates(
                user,
                (items) => setProjectUpdatesState({ scopeUid, items }),
                reportError('les nouvelles projet'),
            ),
            subscribeTickets(
                user,
                (items) => setTicketsState({ scopeUid, items }),
                reportError('les tickets'),
            ),
            subscribeInvoices(
                user,
                (items) => setInvoicesState({ scopeUid, items }),
                reportError('les factures'),
            ),
        ]

        return () => {
            unsubs.forEach((unsub) => unsub())
        }
    }, [user])

    const value = useMemo<DashboardDataContextValue>(() => {
        const clients = user && clientsState.scopeUid === user.uid ? clientsState.items : []
        const projects = user && projectsState.scopeUid === user.uid ? projectsState.items : []
        const projectUpdates = user && projectUpdatesState.scopeUid === user.uid ? projectUpdatesState.items : []
        const tickets = user && ticketsState.scopeUid === user.uid ? ticketsState.items : []
        const invoices = user && invoicesState.scopeUid === user.uid ? invoicesState.items : []
        const users = user && usersState.scopeUid === user.uid ? usersState.items : []
        const loading = Boolean(
            user &&
            (
                clientsState.scopeUid !== user.uid ||
                projectsState.scopeUid !== user.uid ||
                projectUpdatesState.scopeUid !== user.uid ||
                ticketsState.scopeUid !== user.uid ||
                invoicesState.scopeUid !== user.uid ||
                usersState.scopeUid !== user.uid
            ),
        )

        const hasClientScope =
            user?.role === 'admin'
                ? true
                : Boolean(user && (user.clientIds.length > 0 || user.clientId))

        return {
            loading,
            clients,
            projects,
            projectUpdates,
            tickets,
            invoices,
            users,
            error,
            hasClientScope,
            findClient: (id) => clients.find((client) => client.id === id),
            findProject: (id) => projects.find((project) => project.id === id),
            invoicesForProject: (projectId) =>
                projectId ? invoices.filter((item) => item.projectId === projectId) : [],
            updatesForProject: (projectId) =>
                projectId ? projectUpdates.filter((item) => item.projectId === projectId) : [],
        }
    }, [clientsState, error, invoicesState, projectUpdatesState, projectsState, ticketsState, user, usersState])

    return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}
