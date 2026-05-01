import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar, SidebarBody } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { DashboardSkeleton } from '../components/LoadingState'
import { useDashboardData } from '../useDashboardData'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function AppShell() {
    const [sheetOpen, setSheetOpen] = useState(false)
    const { loading } = useDashboardData()

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
                        {loading ? <DashboardSkeleton /> : <Outlet />}
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
        </div>
    )
}
