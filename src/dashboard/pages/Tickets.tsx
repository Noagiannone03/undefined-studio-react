import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { LoadingButton } from '../components/LoadingState'
import { useToast } from '../components/Toast'
import { TicketStatusPill } from '../components/StatusPill'
import { formatDate, formatDateTime } from '../utils'
import { replyToTicket, updateTicketStatus } from '../firestore'
import { mailApi } from '../api'
import type { TicketStatus } from '../types'

const FILTERS: { id: 'all' | TicketStatus; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts' },
    { id: 'answered', label: 'Répondus' },
    { id: 'resolved', label: 'Résolus' },
]

export default function Tickets() {
    const { user } = useAuth()
    const { tickets, findClient, findProject, users } = useDashboardData()
    const { showSuccess, showError } = useToast()
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
                    try {
                        await mailApi.ticketReplied({
                            to,
                            from: 'studio',
                            authorName: user?.name ?? 'Undefined',
                            clientName: client?.name ?? '',
                            ticketSubject: ticket.subject,
                            replyBody: body,
                            ticketId,
                        })
                        showSuccess('Réponse envoyée', `Email confirmé par Vercel pour ${to}.`)
                    } catch (err) {
                        showError('Réponse enregistrée, email non envoyé', err instanceof Error ? err.message : 'La fonction Vercel a échoué.')
                    }
                } else {
                    showError('Réponse enregistrée, email non envoyé', 'Aucun email client trouvé.')
                }
            } else {
                // Notifier l'admin
                try {
                    await mailApi.ticketReplied({
                        to: '',
                        from: 'client',
                        authorName: user?.name ?? '',
                        clientName: client?.name ?? '',
                        ticketSubject: ticket.subject,
                        replyBody: body,
                        ticketId,
                    })
                    showSuccess('Message envoyé', 'Email admin confirmé par Vercel.')
                } catch (err) {
                    showError('Message enregistré, email non envoyé', err instanceof Error ? err.message : 'La fonction Vercel a échoué.')
                }
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

    const activeTicket = tickets.find(t => t.id === openId)

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
                            onClick={() => {
                                setFilter(item.id)
                                setOpenId(null)
                            }}
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
                    body="Rien ici pour ce filtre."
                    action={
                        user?.role === 'client' ? (
                            <Link to="/tickets/new" className="dash-btn" style={{ marginTop: 8 }}>
                                Ouvrir un ticket
                            </Link>
                        ) : undefined
                    }
                />
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
                    {/* MASTER LIST */}
                    <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-hair)' }}>
                        {filtered.map((ticket) => {
                            const project = findProject(ticket.projectId)
                            const client = findClient(ticket.clientId)
                            const isOpen = openId === ticket.id

                            return (
                                <button
                                    key={ticket.id}
                                    type="button"
                                    onClick={() => setOpenId(ticket.id)}
                                    aria-expanded={isOpen}
                                    style={{
                                        background: isOpen ? 'var(--color-paper-2)' : 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid var(--color-hair)',
                                        padding: '24px 20px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12,
                                        color: 'inherit',
                                        font: 'inherit',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'rgba(239,235,221,0.03)' }}
                                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div className="dash-row-between">
                                        <span className="dash-kicker" style={{ color: isOpen ? 'var(--color-paper)' : 'rgba(239,235,221,0.6)' }}>
                                            {user?.role === 'admin'
                                                ? `${client?.name ?? 'Client'}${project ? ` · ${project.name}` : ''}`
                                                : `${ticket.id.toUpperCase()}${project ? ` · ${project.name}` : ''}`}
                                        </span>
                                        <TicketStatusPill status={ticket.status} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 18, lineHeight: 1.1, margin: '0 0 6px', color: 'var(--color-paper)' }}>
                                            {ticket.subject}
                                        </h3>
                                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(239,235,221,0.5)', margin: 0 }}>
                                            Dernière maj. {formatDate(ticket.messages[ticket.messages.length - 1]?.at || ticket.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* DETAIL PANE */}
                    <div style={{ flex: '2 1 480px', position: 'sticky', top: 32 }}>
                        <AnimatePresence mode="wait">
                            {activeTicket ? (
                                <motion.div
                                    key={activeTicket.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="dash-card"
                                    style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}
                                >
                                    <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--color-hair)' }}>
                                        <div className="dash-row-between" style={{ marginBottom: 16 }}>
                                            <span className="dash-kicker">Ticket {activeTicket.id.toUpperCase()}</span>
                                            <TicketStatusPill status={activeTicket.status} />
                                        </div>
                                        <h2 className="dash-h2" style={{ margin: 0, fontSize: 24 }}>{activeTicket.subject}</h2>
                                    </div>

                                    <div className="dash-thread" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 12 }}>
                                        {activeTicket.messages.map((message) => (
                                            <div key={message.id} className={`dash-thread__msg dash-thread__msg--${message.from}`}>
                                                <span className="dash-thread__meta">
                                                    {message.from === 'client' ? message.authorName || 'Client' : message.authorName || 'Undefined'} · {formatDateTime(message.at)}
                                                </span>
                                                {message.body}
                                            </div>
                                        ))}
                                    </div>

                                    {user?.role === 'admin' && (
                                        <div className="dash-row" style={{ marginTop: 8 }}>
                                            {(['open', 'answered', 'resolved'] as TicketStatus[]).map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    className="dash-btn dash-btn--ghost"
                                                    style={{ height: 32, fontSize: 11, padding: '0 12px' }}
                                                    disabled={busyId === activeTicket.id}
                                                    onClick={() => onStatusChange(activeTicket.id, status)}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="dash-stack" style={{ marginTop: 8 }}>
                                        <label htmlFor={`reply-${activeTicket.id}`} className="dash-label">
                                            {user?.role === 'admin' ? 'Réponse studio' : 'Nouveau message'}
                                        </label>
                                        <textarea
                                            id={`reply-${activeTicket.id}`}
                                            className="dash-input dash-textarea"
                                            style={{ minHeight: 120 }}
                                            value={replyBody[activeTicket.id] ?? ''}
                                            onChange={(event) =>
                                                setReplyBody((current) => ({
                                                    ...current,
                                                    [activeTicket.id]: event.target.value,
                                                }))
                                            }
                                        />
                                        <LoadingButton
                                            type="button"
                                            className="dash-btn"
                                            loading={busyId === activeTicket.id}
                                            loadingLabel="Envoi"
                                            disabled={!(replyBody[activeTicket.id] ?? '').trim()}
                                            onClick={() => onReply(activeTicket.id)}
                                        >
                                            {user?.role === 'admin' ? 'Envoyer la réponse' : 'Envoyer'}
                                        </LoadingButton>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <EmptyState
                                        title="Aucun ticket sélectionné"
                                        body="Sélectionne un ticket dans la liste pour voir la conversation."
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    )
}
