import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

    useEffect(() => {
        if (!user) return

        const scopeUid = user.uid

        const unsubs = [
            subscribeUsers(
                user,
                (items) => {
                    setUsersState({ scopeUid, items })
                },
                () => {
                    setUsersState({ scopeUid, items: [] })
                },
            ),
            subscribeClients(
                user,
                (items) => {
                    setClientsState({ scopeUid, items })
                },
                () => {
                    setClientsState({ scopeUid, items: [] })
                },
            ),
            subscribeProjects(
                user,
                (items) => {
                    setProjectsState({ scopeUid, items })
                },
                () => {
                    setProjectsState({ scopeUid, items: [] })
                },
            ),
            subscribeProjectUpdates(
                user,
                (items) => {
                    setProjectUpdatesState({ scopeUid, items })
                },
                () => {
                    setProjectUpdatesState({ scopeUid, items: [] })
                },
            ),
            subscribeTickets(
                user,
                (items) => {
                    setTicketsState({ scopeUid, items })
                },
                () => {
                    setTicketsState({ scopeUid, items: [] })
                },
            ),
            subscribeInvoices(
                user,
                (items) => {
                    setInvoicesState({ scopeUid, items })
                },
                () => {
                    setInvoicesState({ scopeUid, items: [] })
                },
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

        return {
            loading,
            clients,
            projects,
            projectUpdates,
            tickets,
            invoices,
            users,
            findClient: (id) => clients.find((client) => client.id === id),
            findProject: (id) => projects.find((project) => project.id === id),
            updatesForProject: (projectId) => projectUpdates.filter((item) => item.projectId === projectId),
        }
    }, [clientsState, invoicesState, projectUpdatesState, projectsState, ticketsState, user, usersState])

    return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}
