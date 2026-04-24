import { Component, lazy, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
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
            <AppErrorBoundary>
                <Suspense fallback={<LoadingScreen />}>
                    <Dashboard basename={isAppSubdomain ? '/' : '/app'} />
                </Suspense>
            </AppErrorBoundary>
        )
    }

    return (
        <AppErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
                <Site />
            </Suspense>
        </AppErrorBoundary>
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

type BoundaryState = { error: Error | null }

class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
    state: BoundaryState = { error: null }

    static getDerivedStateFromError(error: Error): BoundaryState {
        return { error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Visible in the Vercel runtime logs + browser console.
        console.error('[undefined] runtime error', error, info.componentStack)
    }

    render() {
        const { error } = this.state
        if (!error) return this.props.children
        return (
            <div
                style={{
                    minHeight: '100svh',
                    padding: '32px 24px',
                    background: 'var(--color-paper, #EFEBDD)',
                    color: 'var(--color-ink, #0E0E0C)',
                    fontFamily: 'JetBrains Mono, monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 16,
                    boxSizing: 'border-box',
                }}
            >
                <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.6 }}>
                    Erreur de chargement
                </span>
                <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 32, margin: 0, lineHeight: 1.1 }}>
                    Quelque chose a lâché.
                </h1>
                <pre
                    style={{
                        margin: 0,
                        padding: 12,
                        background: 'rgba(14,14,12,0.06)',
                        fontSize: 12,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: '1px solid rgba(14,14,12,0.14)',
                    }}
                >
                    {error.message}
                </pre>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        alignSelf: 'flex-start',
                        padding: '12px 18px',
                        border: '2px solid #0E0E0C',
                        background: '#EFEBDD',
                        fontFamily: 'inherit',
                        fontSize: 12,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                    }}
                >
                    Recharger
                </button>
            </div>
        )
    }
}

export default App
