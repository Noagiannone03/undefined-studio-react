import { lazy, Suspense } from 'react'
import LogoExport from './shared/LogoExport'

const Site = lazy(() => import('./site/Site'))
const Dashboard = lazy(() => import('./dashboard/Dashboard'))

/**
 * Routes the request at the top level by hostname/path.
 *
 *   app.undefinedstudio.fr/*  →  Dashboard (basename "/")
 *   undefinedstudio.fr/app/*  →  Dashboard (basename "/app")   (local dev too)
 *   /logo                     →  LogoExport
 *   /                         →  Site (marketing)
 *
 * Site and Dashboard are lazy-loaded → each gets its own chunk, the marketing
 * bundle isn't weighed down by the dashboard and vice-versa.
 */
function App() {
    if (typeof window === 'undefined') return null

    const pathname = window.location.pathname
    const hostname = window.location.hostname

    if (pathname === '/logo') return <LogoExport />

    const isAppSubdomain = hostname.startsWith('app.')
    const isAppPath = pathname === '/app' || pathname.startsWith('/app/')

    if (isAppSubdomain || isAppPath) {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <Dashboard basename={isAppSubdomain ? '/' : '/app'} />
            </Suspense>
        )
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Site />
        </Suspense>
    )
}

function LoadingScreen() {
    return (
        <div
            style={{
                minHeight: '100svh',
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
            }}
        >
            Chargement…
        </div>
    )
}

export default App
