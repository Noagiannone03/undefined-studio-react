import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { formatDate, formatEur } from '../utils'
import type { ProjectStatus } from '../types'

const PHASE_LABEL: Record<ProjectStatus, string> = {
    discovery: 'Cadrage',
    design: 'Design',
    build: 'Dev',
    review: 'Revue',
    live: 'En ligne',
    paused: 'En pause',
}

export default function Overview() {
    const { user } = useAuth()
    const { clients, projects, tickets, invoices, users, findClient, findProject } = useDashboardData()

    if (user?.role === 'admin') {
        const activeProjects = projects.filter((project) => project.status !== 'live' && project.status !== 'paused')
        const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved')
        const pendingAccounts = users.filter((account) => account.mustChangePassword)
        const dueInvoices = invoices.filter((inv) => inv.status === 'due' || inv.status === 'overdue')
        const dueTotal = dueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <h1 className="dash-h1">
                        Vue <span className="serif-italic">studio.</span>
                    </h1>
                </header>

                <section className="dash-grid dash-grid--4">
                    {[
                        { label: 'Clients', value: clients.length, hint: 'actifs', to: '/clients' },
                        { label: 'Projets', value: activeProjects.length, hint: 'en cours', to: '/projects' },
                        { label: 'Tickets', value: openTickets.length, hint: 'ouverts', to: '/tickets' },
                        { label: 'À encaisser', value: formatEur(dueTotal), hint: `${dueInvoices.length} facture${dueInvoices.length > 1 ? 's' : ''}`, to: '/invoices' },
                    ].map((card) => (
                        <Link key={card.label} to={card.to} className="dash-card" style={{ textDecoration: 'none' }}>
                            <span className="dash-kicker">{card.label}</span>
                            <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                                <span className="dash-h1" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                                    {typeof card.value === 'number' ? card.value.toString().padStart(2, '0') : card.value}
                                </span>
                                <span className="dash-kicker">{card.hint}</span>
                            </div>
                        </Link>
                    ))}
                </section>

                <section className="dash-stack">
                    <div className="dash-row-between">
                        <h2 className="dash-h2">Projets actifs</h2>
                        <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                            Tous les projets →
                        </Link>
                    </div>
                    {activeProjects.length === 0 ? (
                        <EmptyState title="Aucun projet actif" body="Les projets en cours apparaîtront ici." />
                    ) : (
                        <div className="dash-grid dash-grid--2">
                            {activeProjects.slice(0, 4).map((project) => {
                                const client = findClient(project.clientId)
                                return (
                                    <Link key={project.id} to={`/projects/${project.id}`} className="dash-card dash-card--pop dash-card--link">
                                        <span className="dash-card__accent" style={{ background: project.accent }} />
                                        <div className="dash-row-between">
                                            <ProjectStatusPill status={project.status} />
                                            <span className="dash-kicker">{client?.name ?? '—'} · {PHASE_LABEL[project.status]}</span>
                                        </div>
                                        <h3 className="dash-h2" style={{ marginTop: 8 }}>{project.name}</h3>
                                        <div className="dash-stack-sm" style={{ marginTop: 10 }}>
                                            <div className="dash-row-between">
                                                <span className="dash-kicker">Avancement</span>
                                                <span className="dash-progress__value">{project.progress}%</span>
                                            </div>
                                            <ProgressBar value={project.progress} color={project.accent} />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <div className="dash-card">
                        <div className="dash-row-between">
                            <h2 className="dash-h2">Comptes en attente</h2>
                            <Link to="/clients" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                Gérer →
                            </Link>
                        </div>
                        {pendingAccounts.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 16 }}>Tous les accès sont activés.</p>
                        ) : (
                            pendingAccounts.slice(0, 6).map((account) => (
                                <div key={account.uid} className="dash-row-between dash-card" style={{ padding: 14 }}>
                                    <div>
                                        <span className="dash-kicker">{findClient(account.clientId ?? undefined)?.name ?? 'Sans client'}</span>
                                        <p style={{ margin: '4px 0 0' }}>{account.name} · {account.email}</p>
                                    </div>
                                    <span className="dash-pill dash-pill--tomato">Accès temporaire</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="dash-card">
                        <div className="dash-row-between">
                            <h2 className="dash-h2">Derniers tickets</h2>
                            <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                Tous →
                            </Link>
                        </div>
                        {tickets.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 16 }}>Aucun ticket ouvert.</p>
                        ) : (
                            tickets.slice(0, 4).map((ticket) => {
                                const project = findProject(ticket.projectId)
                                const client = findClient(ticket.clientId)
                                return (
                                    <Link key={ticket.id} to="/tickets" className="dash-card dash-card--link" style={{ padding: 14 }}>
                                        <div className="dash-row-between">
                                            <span className="dash-kicker">
                                                {client?.name ?? '—'}{project ? ` · ${project.name}` : ''}
                                            </span>
                                            <TicketStatusPill status={ticket.status} />
                                        </div>
                                        <h3 className="dash-h2" style={{ fontSize: 18, marginTop: 4 }}>{ticket.subject}</h3>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </section>
            </div>
        )
    }

    const activeProjects = projects.filter((project) => project.status !== 'live' && project.status !== 'paused')
    const visibleProjects = activeProjects.length > 0 ? activeProjects : projects
    const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved')
    const outstandingInvoices = invoices.filter((invoice) => invoice.status !== 'paid')
    const dueTotal = outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const firstName = user?.name?.split(' ')[0] ?? 'là'

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 01 ) — Aperçu</span>
                <h1 className="dash-h1">
                    Salut, <span className="serif-italic">{firstName}.</span>
                </h1>
                <p className="dash-sub">
                    Point rapide sur tes projets.
                </p>
            </header>

            <section className="dash-grid dash-grid--3">
                {[
                    {
                        label: 'Projets actifs',
                        value: activeProjects.length.toString().padStart(2, '0'),
                        hint: 'en cours',
                    },
                    {
                        label: 'Tickets ouverts',
                        value: openTickets.length.toString().padStart(2, '0'),
                        hint: 'en attente',
                    },
                    {
                        label: 'Montant dû',
                        value: formatEur(dueTotal),
                        hint: `${outstandingInvoices.length} facture${outstandingInvoices.length > 1 ? 's' : ''}`,
                    },
                ].map((card) => (
                    <div key={card.label} className="dash-card">
                        <span className="dash-kicker">{card.label}</span>
                        <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                            <span className="dash-h1" style={{ fontSize: 'clamp(34px, 6vw, 64px)' }}>{card.value}</span>
                            <span className="dash-kicker">{card.hint}</span>
                        </div>
                    </div>
                ))}
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">{activeProjects.length > 0 ? 'Projets en cours' : 'Tes projets'}</h2>
                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les projets →
                    </Link>
                </div>
                {visibleProjects.length === 0 ? (
                    <EmptyState title="Aucun projet" body="Tes projets apparaîtront ici dès qu’ils seront activés." />
                ) : (
                    <div className="dash-grid dash-grid--2">
                        {visibleProjects.map((project) => (
                            <div key={project.id}>
                                <Link to={`/projects/${project.id}`} className="dash-card dash-card--pop dash-card--link">
                                    <span className="dash-card__accent" style={{ background: project.accent }} />
                                    <div className="dash-row-between">
                                        <ProjectStatusPill status={project.status} />
                                        <span className="dash-kicker">Livraison · {formatDate(project.delivery)}</span>
                                    </div>
                                    <h3 className="dash-h2" style={{ marginTop: 8 }}>{project.name}</h3>
                                    <p className="dash-sub" style={{ fontSize: 16 }}>{project.tagline}</p>
                                    <div className="dash-stack-sm" style={{ marginTop: 14 }}>
                                        <div className="dash-row-between">
                                            <span className="dash-kicker">Avancement</span>
                                            <span className="dash-progress__value">{project.progress}%</span>
                                        </div>
                                        <ProgressBar value={project.progress} color={project.accent} />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Derniers tickets</h2>
                    <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les tickets →
                    </Link>
                </div>
                <div className="dash-stack">
                    {tickets.slice(0, 3).map((ticket) => {
                        const project = findProject(ticket.projectId)
                        return (
                            <Link key={ticket.id} to="/tickets" className="dash-card dash-card--link" style={{ gap: 8 }}>
                                <div className="dash-row-between">
                                    <span className="dash-kicker">
                                        {ticket.id.toUpperCase()} {project ? `· ${project.name}` : ''}
                                    </span>
                                    <TicketStatusPill status={ticket.status} />
                                </div>
                                <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>{ticket.subject}</h3>
                                <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
                                    {ticket.body}
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
                            <p className="dash-sub" style={{ fontSize: 16 }}>Tout est à jour, nickel.</p>
                        </div>
                    ) : (
                        outstandingInvoices.map((invoice) => {
                            const project = findProject(invoice.projectId)
                            return (
                                <div key={invoice.id} className="dash-card">
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">
                                            {invoice.number} {project ? `· ${project.name}` : ''}
                                        </span>
                                        <InvoiceStatusPill status={invoice.status} />
                                    </div>
                                    <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                                        <span className="dash-h2" style={{ fontSize: 24 }}>{formatEur(invoice.amount)}</span>
                                        <span className="dash-kicker">Échéance · {formatDate(invoice.due)}</span>
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
