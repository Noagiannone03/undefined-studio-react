import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AuthProvider, RequireAuth } from './AuthProvider'
import { useAuth } from './auth'
import { DashboardDataProvider } from './data-context'
import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tickets from './pages/Tickets'
import NewTicket from './pages/NewTicket'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Accounts from './pages/Accounts'
import SetupPassword from './pages/SetupPassword'
import './dashboard.css'

/**
 * Dashboard root. Uses a BrowserRouter with a configurable basename so the
 * same bundle works behind either:
 *   - the "app.*" subdomain  → basename "/"
 *   - the "/app" path prefix → basename "/app"  (for local dev)
 */
export default function Dashboard({ basename = '/' }: { basename?: string }) {
    return (
        <BrowserRouter basename={basename}>
            <AuthProvider>
                <DashboardDataProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/setup-password"
                            element={
                                <RequireAuth>
                                    <SetupPassword />
                                </RequireAuth>
                            }
                        />
                        <Route
                            element={
                                <RequireAuth>
                                    <AppShell />
                                </RequireAuth>
                            }
                        >
                            <Route path="/" element={<Overview />} />
                            <Route path="/clients" element={<AdminOnly><Clients /></AdminOnly>} />
                            <Route path="/clients/:id" element={<AdminOnly><ClientDetail /></AdminOnly>} />
                            <Route path="/accounts" element={<AdminOnly><Accounts /></AdminOnly>} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/projects/:id" element={<ProjectDetail />} />
                            <Route path="/tickets" element={<Tickets />} />
                            <Route path="/tickets/new" element={<NewTicket />} />
                            <Route path="/invoices" element={<ClientOnly><Invoices /></ClientOnly>} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </DashboardDataProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

function AdminOnly({ children }: { children: ReactElement }) {
    const { user } = useAuth()
    if (user?.role !== 'admin') return <Navigate to="/" replace />
    return children
}

function ClientOnly({ children }: { children: ReactElement }) {
    const { user } = useAuth()
    if (user?.role !== 'client') return <Navigate to="/" replace />
    return children
}
