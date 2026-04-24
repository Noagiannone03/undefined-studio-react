import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { INVOICES, TICKETS, findProject } from '../data'
import { ProjectStatusPill, InvoiceStatusPill, TicketStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'

const EXPO = [0.16, 1, 0.3, 1] as const

function formatDate(iso: string | undefined) {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function formatEur(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const project = findProject(id)

    if (!project) {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <span className="dash-kicker">( 02 ) — Projet introuvable</span>
                    <h1 className="dash-h1">Ce projet n'existe pas.</h1>
                    <Link to="/projects" className="dash-btn" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                        ← Retour aux projets
                    </Link>
                </header>
            </div>
        )
    }

    const projectTickets = TICKETS.filter((t) => t.project === project.id)
    const projectInvoices = INVOICES.filter((i) => i.project === project.id)

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Tous les projets
                </Link>
                <div className="dash-row" style={{ marginTop: 8 }}>
                    <ProjectStatusPill status={project.status} />
                    <span className="dash-kicker">Livraison · {formatDate(project.delivery)}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>
                    {project.name}
                </h1>
                <p className="dash-sub">{project.tagline}</p>
            </header>

            <section className="dash-card dash-card--pop" style={{ position: 'relative' }}>
                <span className="dash-card__accent" style={{ background: project.accent }} />
                <div className="dash-row-between">
                    <span className="dash-kicker">Avancement global</span>
                    <span className="dash-progress__value">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} color={project.accent} />
                <div className="dash-row" style={{ marginTop: 14 }}>
                    <span className="dash-kicker">Kickoff · {formatDate(project.kickoff)}</span>
                </div>
            </section>

            <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                <div className="dash-card">
                    <h2 className="dash-h2">Étapes</h2>
                    <ul className="dash-timeline">
                        {project.milestones.map((m, i) => (
                            <motion.li
                                key={m.id}
                                className={`dash-milestone dash-milestone--${m.status}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, ease: EXPO, delay: 0.05 + i * 0.05 }}
                            >
                                <span className="dash-milestone__marker" />
                                <span className="dash-milestone__line" />
                                <div className="dash-row-between" style={{ alignItems: 'baseline' }}>
                                    <p className="dash-milestone__title">{m.label}</p>
                                    {m.status === 'current' && <span className="dash-pill dash-pill--klein">En cours</span>}
                                    {m.status === 'done' && <span className="dash-pill dash-pill--ink">Fait</span>}
                                </div>
                                <p className="dash-milestone__date">{formatDate(m.date)}</p>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <div className="dash-card">
                    <h2 className="dash-h2">Nouvelles du projet</h2>
                    {project.updates.length === 0 ? (
                        <p className="dash-sub">Rien de neuf pour l'instant.</p>
                    ) : (
                        <div>
                            {project.updates.map((u, i) => (
                                <motion.article
                                    key={u.id}
                                    className="dash-update"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: EXPO, delay: 0.06 + i * 0.05 }}
                                >
                                    <div className="dash-update__head">
                                        <h3 className="dash-update__title">{u.title}</h3>
                                        <span className="dash-update__meta">
                                            {formatDate(u.date)} · {u.author}
                                        </span>
                                    </div>
                                    <p className="dash-update__body">{u.body}</p>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Tickets liés</h2>
                    <Link to="/tickets/new" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Nouveau ticket →
                    </Link>
                </div>
                {projectTickets.length === 0 ? (
                    <EmptyState title="Pas de ticket" body="Une question, un bug, une demande — ouvre un ticket, on répond vite." />
                ) : (
                    <div className="dash-stack">
                        {projectTickets.map((t) => (
                            <div key={t.id} className="dash-card">
                                <div className="dash-row-between">
                                    <span className="dash-kicker">{t.id.toUpperCase()}</span>
                                    <TicketStatusPill status={t.status} />
                                </div>
                                <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>
                                    {t.subject}
                                </h3>
                                <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
                                    {t.body}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Factures</h2>
                    <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Toutes →
                    </Link>
                </div>
                {projectInvoices.length === 0 ? (
                    <EmptyState title="Aucune facture" body="Elles apparaîtront ici au fil du projet." />
                ) : (
                    <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Émise</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectInvoices.map((i) => (
                                    <tr key={i.id}>
                                        <td className="dash-table__num">{i.number}</td>
                                        <td>{formatDate(i.issued)}</td>
                                        <td className="dash-table__num">{formatEur(i.amount)}</td>
                                        <td><InvoiceStatusPill status={i.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}
