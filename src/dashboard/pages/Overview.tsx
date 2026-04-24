import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { INVOICES, PROJECTS, TICKETS, findProject } from '../data'
import { useAuth } from '../auth'
import { ProjectStatusPill, InvoiceStatusPill, TicketStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'

const EXPO = [0.16, 1, 0.3, 1] as const

function formatEur(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export default function Overview() {
    const { user } = useAuth()
    const activeProjects = PROJECTS.filter((p) => p.status !== 'live' && p.status !== 'paused')
    const openTickets = TICKETS.filter((t) => t.status !== 'resolved')
    const outstandingInvoices = INVOICES.filter((i) => i.status !== 'paid')
    const dueTotal = outstandingInvoices.reduce((sum, i) => sum + i.amount, 0)

    const firstName = user?.name?.split(' ')[0] ?? 'là'

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 01 ) — Aperçu</span>
                <h1 className="dash-h1">
                    Salut, <span className="serif-italic">{firstName}.</span>
                </h1>
                <p className="dash-sub">
                    Voilà où en sont tes projets, ce qui attend une réponse et ce qui reste à régler.
                </p>
            </header>

            <section className="dash-grid dash-grid--3">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EXPO }}
                    className="dash-card"
                >
                    <span className="dash-kicker">Projets actifs</span>
                    <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                        <span className="dash-h1" style={{ fontSize: 'clamp(44px, 6vw, 64px)' }}>
                            {activeProjects.length.toString().padStart(2, '0')}
                        </span>
                        <span className="dash-kicker" style={{ color: 'var(--color-klein)' }}>
                            en cours
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EXPO, delay: 0.05 }}
                    className="dash-card"
                >
                    <span className="dash-kicker">Tickets ouverts</span>
                    <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                        <span className="dash-h1" style={{ fontSize: 'clamp(44px, 6vw, 64px)' }}>
                            {openTickets.length.toString().padStart(2, '0')}
                        </span>
                        <span className="dash-kicker" style={{ color: 'var(--color-tomato)' }}>
                            en attente
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EXPO, delay: 0.1 }}
                    className="dash-card"
                >
                    <span className="dash-kicker">Montant dû</span>
                    <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                        <span
                            className="dash-h1"
                            style={{
                                fontSize: 'clamp(34px, 5vw, 50px)',
                                letterSpacing: '-0.04em',
                            }}
                        >
                            {formatEur(dueTotal)}
                        </span>
                        <span className="dash-kicker">
                            {outstandingInvoices.length} facture{outstandingInvoices.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </motion.div>
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Projets en cours</h2>
                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les projets →
                    </Link>
                </div>
                <div className="dash-grid dash-grid--2">
                    {activeProjects.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EXPO, delay: 0.1 + i * 0.06 }}
                        >
                            <Link to={`/projects/${p.id}`} className="dash-card dash-card--pop dash-card--link">
                                <span className="dash-card__accent" style={{ background: p.accent }} />
                                <div className="dash-row-between">
                                    <ProjectStatusPill status={p.status} />
                                    <span className="dash-kicker">Livraison · {formatDate(p.delivery)}</span>
                                </div>
                                <h3 className="dash-h2" style={{ marginTop: 8 }}>
                                    {p.name}
                                </h3>
                                <p className="dash-sub" style={{ fontSize: 16 }}>
                                    {p.tagline}
                                </p>
                                <div className="dash-stack-sm" style={{ marginTop: 14 }}>
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">Avancement</span>
                                        <span className="dash-progress__value">{p.progress}%</span>
                                    </div>
                                    <ProgressBar value={p.progress} color={p.accent} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Derniers tickets</h2>
                    <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les tickets →
                    </Link>
                </div>
                <div className="dash-stack">
                    {TICKETS.slice(0, 3).map((t) => {
                        const proj = findProject(t.project)
                        return (
                            <Link
                                key={t.id}
                                to={`/tickets#${t.id}`}
                                className="dash-card dash-card--link"
                                style={{ gap: 8 }}
                            >
                                <div className="dash-row-between">
                                    <span className="dash-kicker">
                                        {t.id.toUpperCase()} {proj ? `· ${proj.name}` : ''}
                                    </span>
                                    <TicketStatusPill status={t.status} />
                                </div>
                                <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>
                                    {t.subject}
                                </h3>
                                <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
                                    {t.body}
                                </p>
                            </Link>
                        )
                    })}
                </div>
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">À régler</h2>
                    <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Toutes les factures →
                    </Link>
                </div>
                <div className="dash-stack">
                    {outstandingInvoices.length === 0 ? (
                        <div className="dash-card">
                            <span className="dash-kicker">Rien en attente</span>
                            <p className="dash-sub" style={{ fontSize: 16 }}>Toutes tes factures sont à jour. Propre.</p>
                        </div>
                    ) : (
                        outstandingInvoices.map((inv) => {
                            const proj = findProject(inv.project)
                            return (
                                <div key={inv.id} className="dash-card">
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">
                                            {inv.number} {proj ? `· ${proj.name}` : ''}
                                        </span>
                                        <InvoiceStatusPill status={inv.status} />
                                    </div>
                                    <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                                        <span className="dash-h2" style={{ fontSize: 24 }}>{formatEur(inv.amount)}</span>
                                        <span className="dash-kicker">Échéance · {formatDate(inv.due)}</span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}
