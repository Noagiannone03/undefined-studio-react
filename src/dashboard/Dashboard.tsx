import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './AuthProvider'
import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tickets from './pages/Tickets'
import NewTicket from './pages/NewTicket'
import Invoices from './pages/Invoices'
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
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        element={
                            <RequireAuth>
                                <AppShell />
                            </RequireAuth>
                        }
                    >
                        <Route path="/" element={<Overview />} handle={{ title: 'Aperçu' }} />
                        <Route path="/projects" element={<Projects />} handle={{ title: 'Projets' }} />
                        <Route path="/projects/:id" element={<ProjectDetail />} handle={{ title: 'Projet' }} />
                        <Route path="/tickets" element={<Tickets />} handle={{ title: 'Tickets' }} />
                        <Route path="/tickets/new" element={<NewTicket />} handle={{ title: 'Nouveau ticket' }} />
                        <Route path="/invoices" element={<Invoices />} handle={{ title: 'Factures' }} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
