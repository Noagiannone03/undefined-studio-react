import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { TicketStatusPill } from '../components/StatusPill'
import { formatDate, formatDateTime } from '../utils'
import { replyToTicket, updateTicketStatus } from '../firestore'
import { mailApi } from '../api'
import type { TicketStatus } from '../types'

const EXPO = [0.16, 1, 0.3, 1] as const

const FILTERS: { id: 'all' | TicketStatus; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts' },
    { id: 'answered', label: 'Répondus' },
    { id: 'resolved', label: 'Résolus' },
]

export default function Tickets() {
    const { user } = useAuth()
    const { tickets, findClient, findProject, users } = useDashboardData()
    const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
    const [openId, setOpenId] = useState<string | null>(null)
    const [replyBody, setReplyBody] = useState<Record<string, string>>({})
    const [busyId, setBusyId] = useState<string | null>(null)

    const filtered = filter === 'all' ? tickets : tickets.filter((ticket) => ticket.status === filter)

    const onReply = async (ticketId: string) => {
        const ticket = tickets.find((item) => item.id === ticketId)
        const body = replyBody[ticketId]?.trim()
        if (!ticket || !body) return

        const from = user?.role === 'admin' ? 'studio' : 'client'
        setBusyId(ticketId)
        try {
            await replyToTicket({
                ticket,
                body,
                from,
                authorName: user?.name ?? 'Undefined',
            })

            const client = findClient(ticket.clientId)
            if (from === 'studio') {
                // Notifier le client
                const clientUser = users.find((u) => u.clientIds.includes(ticket.clientId) || u.clientId === ticket.clientId)
                const to = clientUser?.email ?? client?.contactEmail
                if (to) {
                    mailApi.ticketReplied({
                        to,
                        from: 'studio',
                        authorName: user?.name ?? 'Undefined',
                        clientName: client?.name ?? '',
                        ticketSubject: ticket.subject,
                        replyBody: body,
                        ticketId,
                    })
                }
            } else {
                // Notifier l'admin
                mailApi.ticketReplied({
                    to: '',
                    from: 'client',
                    authorName: user?.name ?? '',
                    clientName: client?.name ?? '',
                    ticketSubject: ticket.subject,
                    replyBody: body,
                    ticketId,
                })
            }

            setReplyBody((current) => ({ ...current, [ticketId]: '' }))
        } finally {
            setBusyId(null)
        }
    }

    const onStatusChange = async (ticketId: string, status: TicketStatus) => {
        setBusyId(ticketId)
        try {
            await updateTicketStatus(ticketId, status)
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">{user?.role === 'admin' ? '( ADMIN ) — Tickets' : '( 03 ) — Tickets'}</span>
                <h1 className="dash-h1">
                    {user?.role === 'admin' ? (
                        <>Le flux <span className="serif-italic">support.</span></>
                    ) : (
                        <>Tes <span className="serif-italic">demandes.</span></>
                    )}
                </h1>
                <p className="dash-sub">
                    {user?.role === 'admin'
                        ? 'Le suivi centralisé de toutes les demandes et questions.'
                        : 'Tes questions, nos réponses.'}
                </p>
            </header>

            <div className="dash-row-between">
                <div className="dash-row">
                    {FILTERS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilter(item.id)}
                            className="dash-btn dash-btn--ghost"
                            style={{
                                height: 40,
                                fontSize: 12,
                                padding: '0 18px',
                                boxShadow: filter === item.id ? '4px 4px 0 var(--color-klein)' : 'none',
                                background: filter === item.id ? 'var(--color-paper-2)' : 'transparent',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                {user?.role === 'client' && (
                    <Link to="/tickets/new" className="dash-btn">
                        Nouveau ticket
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden>
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </Link>
                )}
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    title="Aucun ticket dans cette vue"
                    body={user?.role === 'admin' ? 'Rien ici pour ce filtre.' : 'Rien ici pour ce filtre.'}
                    action={
                        user?.role === 'client' ? (
                            <Link to="/tickets/new" className="dash-btn" style={{ marginTop: 8 }}>
                                Ouvrir un ticket
                            </Link>
                        ) : undefined
                    }
                />
            ) : (
                <div className="dash-stack">
                    {filtered.map((ticket) => {
                        const project = findProject(ticket.projectId)
                        const client = findClient(ticket.clientId)
                        const isOpen = openId === ticket.id

                        return (
                            <div key={ticket.id} id={ticket.id} className="dash-card">
                                <button
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : ticket.id)}
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
                                            {user?.role === 'admin'
                                                ? `${client?.name ?? 'Client'}${project ? ` · ${project.name}` : ''} · ${formatDate(ticket.createdAt)}`
                                                : `${ticket.id.toUpperCase()}${project ? ` · ${project.name}` : ''} · ${formatDate(ticket.createdAt)}`}
                                        </span>
                                        <TicketStatusPill status={ticket.status} />
                                    </div>
                                    <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>{ticket.subject}</h3>
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
                                                {ticket.messages.map((message) => (
                                                    <div key={message.id} className={`dash-thread__msg dash-thread__msg--${message.from}`}>
                                                        <span className="dash-thread__meta">
                                                            {message.from === 'client' ? message.authorName || 'Client' : message.authorName || 'Undefined'} · {formatDateTime(message.at)}
                                                        </span>
                                                        {message.body}
                                                    </div>
                                                ))}
                                            </div>

                                            {user?.role === 'admin' && (
                                                <div className="dash-row" style={{ marginTop: 16 }}>
                                                    {(['open', 'answered', 'resolved'] as TicketStatus[]).map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            className="dash-btn dash-btn--ghost"
                                                            style={{ height: 38, fontSize: 12, padding: '0 14px' }}
                                                            disabled={busyId === ticket.id}
                                                            onClick={() => onStatusChange(ticket.id, status)}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="dash-stack" style={{ marginTop: 16 }}>
                                                <label htmlFor={`reply-${ticket.id}`} className="dash-label">
                                                    {user?.role === 'admin' ? 'Réponse studio' : 'Ajouter un message'}
                                                </label>
                                                <textarea
                                                    id={`reply-${ticket.id}`}
                                                    className="dash-input dash-textarea"
                                                    value={replyBody[ticket.id] ?? ''}
                                                    onChange={(event) =>
                                                        setReplyBody((current) => ({
                                                            ...current,
                                                            [ticket.id]: event.target.value,
                                                        }))
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    className="dash-btn"
                                                    disabled={busyId === ticket.id || !(replyBody[ticket.id] ?? '').trim()}
                                                    onClick={() => onReply(ticket.id)}
                                                >
                                                    {busyId === ticket.id ? 'Envoi...' : user?.role === 'admin' ? 'Répondre' : 'Envoyer'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
