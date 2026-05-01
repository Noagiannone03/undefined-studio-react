import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar, SidebarBody } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { DashboardSkeleton } from '../components/LoadingState'
import { useDashboardData } from '../useDashboardData'
import { useAuth } from '../auth'

const EXPO = [0.16, 1, 0.3, 1] as const
const ENTRY_INTRO_MIN_MS = 2000

export default function AppShell() {
    const [sheetOpen, setSheetOpen] = useState(false)
    const [showEntryIntro, setShowEntryIntro] = useState(() => window.sessionStorage.getItem('dash-entry-intro') === '1')
    const [entryIntroStartedAt] = useState(() => Date.now())
    const { loading } = useDashboardData()
    const { user } = useAuth()
    const location = useLocation()

    useEffect(() => {
        if (loading || !showEntryIntro) return
        window.sessionStorage.removeItem('dash-entry-intro')
        const elapsed = Date.now() - entryIntroStartedAt
        const remaining = Math.max(0, ENTRY_INTRO_MIN_MS - elapsed)
        const timer = window.setTimeout(() => setShowEntryIntro(false), remaining)
        return () => window.clearTimeout(timer)
    }, [entryIntroStartedAt, loading, showEntryIntro])

    // While the sheet is open: subscribe to Escape + browser back/forward,
    // and lock page scroll so only the sheet can scroll.
    useEffect(() => {
        if (!sheetOpen) return
        const close = () => setSheetOpen(false)
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close()
        }
        window.addEventListener('keydown', onKey)
        window.addEventListener('popstate', close)

        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('popstate', close)
            document.body.style.overflow = prev
        }
    }, [sheetOpen])

    return (
        <div className="dash-root">
            <div className="dash-shell">
                <Sidebar />
                <div className="dash-main">
                    <Topbar onMenu={() => setSheetOpen(true)} />
                    <main className="dash-content">
                        <AnimatePresence initial={false}>
                            {loading ? (
                                <motion.div
                                    key="dashboard-loading"
                                    className="dash-page-motion"
                                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, ease: EXPO }}
                                >
                                    <DashboardSkeleton />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={location.pathname}
                                    className="dash-page-motion"
                                    initial={{ opacity: 0, y: 16, scale: 0.99 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, ease: EXPO }}
                                >
                                    <Outlet />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            <AnimatePresence>
                {sheetOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="dash-sheet-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setSheetOpen(false)}
                        />
                        <motion.aside
                            key="sheet"
                            className="dash-sheet"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.35, ease: EXPO }}
                        >
                            <SidebarBody onNavigate={() => setSheetOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!loading && showEntryIntro && (
                    <motion.div
                        className="dash-entry-intro"
                        initial={{ y: '0%' }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        aria-live="polite"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ink)', zIndex: 9999, position: 'fixed', inset: 0 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.7, ease: EXPO }}
                            style={{ textAlign: 'center', color: 'var(--color-paper)' }}
                        >
                            <span className="dash-kicker" style={{ color: 'rgba(239,235,221,0.4)', display: 'block', marginBottom: 24 }}>
                                ( APP ) — UNDEFINED STUDIO
                            </span>
                            <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.9, margin: 0, letterSpacing: '-0.04em' }}>
                                Bienvenue{user?.name ? <><br /><span style={{ color: 'var(--color-paper-2)' }}>{user.name.split(' ')[0]}.</span></> : '.'}
                            </h1>
                            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontStyle: 'italic', color: 'var(--color-tomato)', margin: '24px 0 0' }}>
                                L'espace est prêt.
                            </p>
                            
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1.2, ease: EXPO, delay: 0.1 }}
                                style={{ height: 2, background: 'var(--color-paper-2)', width: '80%', margin: '48px auto 0', transformOrigin: 'center' }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
