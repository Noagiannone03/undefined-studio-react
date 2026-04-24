import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { TICKETS, findProject } from '../data'
import { TicketStatusPill } from '../components/StatusPill'
import { EmptyState } from '../components/EmptyState'
import type { TicketStatus } from '../types'

const EXPO = [0.16, 1, 0.3, 1] as const

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

const FILTERS: { id: 'all' | TicketStatus; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts' },
    { id: 'answered', label: 'Répondus' },
    { id: 'resolved', label: 'Résolus' },
]

export default function Tickets() {
    const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
    const [openId, setOpenId] = useState<string | null>(null)

    const filtered = useMemo(() => {
        if (filter === 'all') return TICKETS
        return TICKETS.filter((t) => t.status === filter)
    }, [filter])

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 03 ) — Tickets</span>
                <h1 className="dash-h1">
                    Tes <span className="serif-italic">questions,</span> nos réponses.
                </h1>
                <p className="dash-sub">
                    Pose-nous ce que tu veux — un bug, une demande, une interrogation sur une facture. On répond sous 24h ouvrées.
                </p>
            </header>

            <div className="dash-row-between">
                <div className="dash-row">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className="dash-btn dash-btn--ghost"
                            style={{
                                height: 40,
                                fontSize: 12,
                                padding: '0 18px',
                                boxShadow: filter === f.id ? '4px 4px 0 var(--color-klein)' : 'none',
                                background: filter === f.id ? 'var(--color-paper-2)' : 'transparent',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <Link to="/tickets/new" className="dash-btn">
                    Nouveau ticket
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden>
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </Link>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    title="Aucun ticket dans cette vue"
                    body="Change de filtre ou ouvres-en un nouveau."
                    action={
                        <Link to="/tickets/new" className="dash-btn" style={{ marginTop: 8 }}>
                            Ouvrir un ticket
                        </Link>
                    }
                />
            ) : (
                <div className="dash-stack">
                    {filtered.map((t, i) => {
                        const proj = findProject(t.project)
                        const isOpen = openId === t.id
                        return (
                            <motion.div
                                key={t.id}
                                id={t.id}
                                className="dash-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: EXPO, delay: 0.03 + i * 0.04 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : t.id)}
                                    aria-expanded={isOpen}
                                    style={{
                                        background: 'transparent',
                                        border: 0,
                                        padding: 0,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                        color: 'inherit',
                                        font: 'inherit',
                                        width: '100%',
                                    }}
                                >
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">
                                            {t.id.toUpperCase()} {proj ? `· ${proj.name}` : ''} · {formatDate(t.createdAt)}
                                        </span>
                                        <TicketStatusPill status={t.status} />
                                    </div>
                                    <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>
                                        {t.subject}
                                    </h3>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="thread"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: EXPO }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <hr className="dash-divider" style={{ margin: '16px 0' }} />
                                            <div className="dash-thread">
                                                {t.messages.map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className={`dash-thread__msg dash-thread__msg--${m.from}`}
                                                    >
                                                        <span className="dash-thread__meta">
                                                            {m.from === 'client' ? 'Toi' : 'Undefined'} · {formatDateTime(m.at)}
                                                        </span>
                                                        {m.body}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
