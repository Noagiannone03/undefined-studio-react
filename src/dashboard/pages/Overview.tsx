import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { formatDate, formatEur } from '../utils'

export default function Overview() {
    const { user } = useAuth()
    const { clients, projects, tickets, invoices, users, findClient, findProject } = useDashboardData()

    if (user?.role === 'admin') {
        const activeProjects = projects.filter((project) => project.status !== 'live' && project.status !== 'paused')
        const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved')
        const pendingAccounts = users.filter((account) => account.mustChangePassword)

        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <span className="dash-kicker">( ADMIN ) — Overview</span>
                    <h1 className="dash-h1">
                        Vue <span className="serif-italic">studio.</span>
                    </h1>
                    <p className="dash-sub">
                        Clients, projets, tickets et comptes en attente de setup. Tout est centralisé par client dans Firestore.
                    </p>
                </header>

                <section className="dash-grid dash-grid--3">
                    {[
                        { label: 'Clients actifs', value: clients.length, hint: 'sociétés' },
                        { label: 'Projets en cours', value: activeProjects.length, hint: 'en production' },
                        { label: 'Tickets ouverts', value: openTickets.length, hint: 'à traiter' },
                    ].map((card) => (
                        <div key={card.label} className="dash-card">
                            <span className="dash-kicker">{card.label}</span>
                            <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                                <span className="dash-h1" style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>
                                    {card.value.toString().padStart(2, '0')}
                                </span>
                                <span className="dash-kicker">{card.hint}</span>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <div className="dash-card">
                        <div className="dash-row-between">
                            <h2 className="dash-h2">Comptes à activer</h2>
                            <Link to="/accounts" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                Gérer →
                            </Link>
                        </div>
                        {pendingAccounts.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 16 }}>Tous les comptes ont déjà défini leur mot de passe.</p>
                        ) : (
                            pendingAccounts.slice(0, 6).map((account) => (
                                <div key={account.uid} className="dash-row-between dash-card" style={{ padding: 14 }}>
                                    <div>
                                        <span className="dash-kicker">{findClient(account.clientId ?? undefined)?.name ?? 'Sans client'}</span>
                                        <p style={{ margin: '4px 0 0' }}>{account.name} · {account.email}</p>
                                    </div>
                                    <span className="dash-pill dash-pill--tomato">Temp password</span>
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
                        {tickets.slice(0, 5).map((ticket) => {
                            const project = findProject(ticket.projectId)
                            const client = findClient(ticket.clientId)
                            return (
                                <Link key={ticket.id} to="/tickets" className="dash-card dash-card--link" style={{ padding: 14 }}>
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">
                                            {client?.name ?? 'Client'} {project ? `· ${project.name}` : ''}
                                        </span>
                                        <TicketStatusPill status={ticket.status} />
                                    </div>
                                    <h3 className="dash-h2" style={{ fontSize: 20 }}>{ticket.subject}</h3>
                                    <p style={{ margin: 0, lineHeight: 1.5 }}>{ticket.body}</p>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            </div>
        )
    }

    const activeProjects = projects.filter((project) => project.status !== 'live' && project.status !== 'paused')
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
                    Voilà où en sont tes projets, ce qui attend une réponse et ce qui reste à régler.
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
                    <h2 className="dash-h2">Projets en cours</h2>
                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les projets →
                    </Link>
                </div>
                <div className="dash-grid dash-grid--2">
                    {activeProjects.map((project) => (
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
                            <p className="dash-sub" style={{ fontSize: 16 }}>Toutes tes factures sont à jour. Propre.</p>
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
