import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { formatDate, formatEur } from '../utils'
import type { Project, ProjectStatus } from '../types'

const PHASE_LABEL: Record<ProjectStatus, string> = {
    discovery: 'Cadrage',
    design: 'Design',
    build: 'Dev',
    review: 'Revue',
    live: 'En ligne',
    paused: 'En pause',
}

function daysUntil(iso: string | undefined): number | null {
    if (!iso) return null
    const target = new Date(iso).getTime()
    if (Number.isNaN(target)) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.round((target - today.getTime()) / (1000 * 60 * 60 * 24))
}

function deliveryHint(iso: string | undefined): string {
    const days = daysUntil(iso)
    if (days === null) return '—'
    if (days < 0) return `${formatDate(iso)} (en retard)`
    if (days === 0) return `${formatDate(iso)} (aujourd’hui)`
    if (days === 1) return `${formatDate(iso)} (demain)`
    if (days <= 14) return `${formatDate(iso)} (dans ${days} j)`
    return formatDate(iso)
}

function nextSteps(project: Project) {
    const current = project.milestones.find((m) => m.status === 'current')
    const upcoming = project.milestones.find((m) => m.status === 'upcoming')
    return { current, upcoming }
}

export default function Overview() {
    const { user } = useAuth()
    const { clients, projects, projectUpdates, tickets, invoices, users, findClient, findProject } = useDashboardData()

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

                <div className="dash-overview-layout">
                    {/* MAIN COLUMN (LEFT) */}
                    <div className="dash-overview-main">
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
                                    {activeProjects.slice(0, 6).map((project) => {
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
                    </div>

                    {/* SIDE COLUMN (RIGHT) */}
                    <aside className="dash-overview-side">
                        <div className="dash-card">
                            <div className="dash-row-between" style={{ marginBottom: 12 }}>
                                <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Comptes en attente</h2>
                                <Link to="/clients" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Gérer →
                                </Link>
                            </div>
                            {pendingAccounts.length === 0 ? (
                                <p className="dash-note" style={{ margin: 0 }}>Tous les accès sont activés.</p>
                            ) : (
                                <div className="dash-stack-sm">
                                    {pendingAccounts.slice(0, 6).map((account) => (
                                        <div key={account.uid} className="dash-overview-listing" style={{ alignItems: 'flex-start' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <span className="dash-kicker">{findClient(account.clientId ?? undefined)?.name ?? 'Sans client'}</span>
                                                <p className="dash-overview-listing__title">{account.name}</p>
                                                <p className="dash-note" style={{ fontSize: 11, marginTop: 2 }}>{account.email}</p>
                                            </div>
                                            <span className="dash-pill dash-pill--tomato">Temp</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dash-card" style={{ marginTop: 16 }}>
                            <div className="dash-row-between" style={{ marginBottom: 12 }}>
                                <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Derniers tickets</h2>
                                <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Tous →
                                </Link>
                            </div>
                            {tickets.length === 0 ? (
                                <p className="dash-note" style={{ margin: 0 }}>Aucun ticket ouvert.</p>
                            ) : (
                                <div className="dash-stack-sm">
                                    {tickets.slice(0, 5).map((ticket) => {
                                        const project = findProject(ticket.projectId)
                                        const client = findClient(ticket.clientId)
                                        return (
                                            <Link key={ticket.id} to="/tickets" className="dash-overview-listing">
                                                <div style={{ minWidth: 0 }}>
                                                    <span className="dash-kicker">
                                                        {client?.name ?? '—'}{project ? ` · ${project.name}` : ''}
                                                    </span>
                                                    <p className="dash-overview-listing__title">{ticket.subject}</p>
                                                </div>
                                                <TicketStatusPill status={ticket.status} />
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        )
    }

    const activeProjects = projects.filter((p) => p.status !== 'live' && p.status !== 'paused')
    const visibleProjects = activeProjects.length > 0 ? activeProjects : projects
    const openTickets = tickets.filter((t) => t.status !== 'resolved')
    const outstandingInvoices = invoices.filter((inv) => inv.status === 'due' || inv.status === 'overdue')
    const dueTotal = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const globalProgress = visibleProjects.length > 0
        ? Math.round(visibleProjects.reduce((sum, project) => sum + project.progress, 0) / visibleProjects.length)
        : 0
    const nextDelivery = [...visibleProjects]
        .filter((project) => project.delivery)
        .sort((a, b) => new Date(a.delivery).getTime() - new Date(b.delivery).getTime())[0]
    const priorityProject = nextDelivery ?? visibleProjects[0]
    const prioritySteps = priorityProject ? nextSteps(priorityProject) : null
    const latestUpdates = [...projectUpdates]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    const projectCards = visibleProjects.slice(0, 4)
    const actionCount = outstandingInvoices.length + openTickets.length
    const firstName = user?.name?.split(' ')[0] ?? 'là'

    return (
        <div className="dash-stack-lg">
            {/* Greeting */}
            <header className="dash-page-head">
                <span className="dash-kicker">( 01 ) — Aperçu</span>
                <h1 className="dash-h1">
                    Bonjour, <span className="serif-italic">{firstName}.</span>
                </h1>
                <p className="dash-sub">Une vue courte pour voir où en sont tes projets et ce qui demande une action.</p>
            </header>

            {visibleProjects.length === 0 ? (
                <EmptyState title="Aucun projet actif" body="Tes projets apparaîtront ici dès qu’ils sont lancés." />
            ) : (
                <>
                    <section className="dash-overview-brief">
                        <Link
                            to={`/projects/${priorityProject.id}`}
                            className="dash-overview-brief__project"
                        >
                            <span className="dash-overview-brief__accent" style={{ background: priorityProject.accent }} />
                            <div className="dash-overview-brief__content">
                                <div className="dash-overview-brief__head">
                                    <span className="dash-kicker">À suivre maintenant</span>
                                    <ProjectStatusPill status={priorityProject.status} />
                                </div>
                                <h2 className="dash-overview-brief__title">{priorityProject.name}</h2>
                                <div className="dash-overview-brief__progress">
                                    <ProgressBar value={priorityProject.progress} color={priorityProject.accent} />
                                    <strong>{priorityProject.progress}%</strong>
                                </div>
                            </div>
                        </Link>

                        <div className="dash-overview-brief__facts">
                            <div>
                                <span>Étape</span>
                                <strong>{prioritySteps?.current?.label ?? 'À définir'}</strong>
                            </div>
                            <div>
                                <span>Ensuite</span>
                                <strong>{prioritySteps?.upcoming?.label ?? 'Planning à venir'}</strong>
                            </div>
                            <div>
                                <span>Livraison</span>
                                <strong>{deliveryHint(priorityProject.delivery)}</strong>
                            </div>
                        </div>

                        <div className="dash-overview-brief__metrics">
                            <Link to="/projects">
                                <strong>{String(visibleProjects.length).padStart(2, '0')}</strong>
                                <span>projets</span>
                            </Link>
                            <div>
                                <strong>{globalProgress}%</strong>
                                <span>moyenne</span>
                            </div>
                            <Link to={actionCount > 0 ? '/tickets' : '/projects'}>
                                <strong>{actionCount}</strong>
                                <span>à traiter</span>
                            </Link>
                        </div>
                    </section>

                    <section className="dash-overview-layout">
                        <div className="dash-overview-main">
                            <section className="dash-stack">
                                <div className="dash-row-between">
                                    <h2 className="dash-h2">Projets</h2>
                                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                        Tout voir →
                                    </Link>
                                </div>

                                <div className="dash-overview-project-list">
                                    {projectCards.map((project) => {
                                        const { current } = nextSteps(project)
                                        const latestUpdate = projectUpdates
                                            .filter((update) => update.projectId === project.id)
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                                        const isRecentUpdate = latestUpdate && (new Date().getTime() - new Date(latestUpdate.date).getTime() < 3 * 24 * 60 * 60 * 1000)

                                        return (
                                            <Link key={project.id} to={`/projects/${project.id}`} className="dash-card dash-card--link dash-overview-project-row">
                                                <span className="dash-card__accent" style={{ background: project.accent }} />
                                                <div className="dash-overview-project-row__head">
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="dash-row" style={{ gap: 8, marginBottom: 6 }}>
                                                            <ProjectStatusPill status={project.status} />
                                                            {isRecentUpdate && <span className="dash-pill dash-pill--klein">Nouveau point</span>}
                                                        </div>
                                                        <h3 className="dash-overview-project-row__title">{project.name}</h3>
                                                        <p className="dash-note">Étape actuelle : {current?.label ?? 'À définir'}</p>
                                                    </div>
                                                    <span className="dash-overview-project-row__date">{deliveryHint(project.delivery)}</span>
                                                </div>
                                                <div className="dash-stack-sm">
                                                    <span className="dash-kicker">Avancement · {project.progress}%</span>
                                                    <ProgressBar value={project.progress} color={project.accent} />
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </section>
                        </div>

                        <aside className="dash-overview-side">
                            <div className="dash-card dash-overview-panel">
                                <div className="dash-row-between">
                                    <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Actions</h2>
                                    <span className="dash-kicker">{actionCount} ouverte{actionCount > 1 ? 's' : ''}</span>
                                </div>
                                <div className="dash-overview-action__totals">
                                    <Link to="/invoices" className="dash-overview-action__summary">
                                        <span className="dash-kicker">Factures</span>
                                        <strong>{formatEur(dueTotal)}</strong>
                                    </Link>
                                    <Link to="/tickets" className="dash-overview-action__summary">
                                        <span className="dash-kicker">Questions</span>
                                        <strong>{openTickets.length}</strong>
                                    </Link>
                                </div>
                                <div className="dash-stack-sm">
                                    {outstandingInvoices.slice(0, 2).map((invoice) => {
                                        const proj = findProject(invoice.projectId)
                                        return (
                                            <Link
                                                key={invoice.id}
                                                to={`/invoices/${invoice.id}`}
                                                className="dash-overview-listing"
                                            >
                                                <div>
                                                    <span className="dash-kicker">{proj?.name ?? invoice.number}</span>
                                                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{formatEur(invoice.amount)}</p>
                                                </div>
                                                <InvoiceStatusPill status={invoice.status} />
                                            </Link>
                                        )
                                    })}
                                    {openTickets.slice(0, 2).map((ticket) => {
                                        const proj = findProject(ticket.projectId)
                                        return (
                                            <Link key={ticket.id} to="/tickets" className="dash-overview-listing">
                                                <div style={{ minWidth: 0 }}>
                                                    <span className="dash-kicker">{proj?.name ?? 'Sans projet'}</span>
                                                    <p className="dash-overview-listing__title">{ticket.subject}</p>
                                                </div>
                                                <TicketStatusPill status={ticket.status} />
                                            </Link>
                                        )
                                    })}
                                    {outstandingInvoices.length === 0 && openTickets.length === 0 && (
                                        <p className="dash-note" style={{ margin: 0 }}>Rien en attente pour le moment.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="dash-card dash-overview-panel" style={{ marginTop: 16 }}>
                                <div className="dash-row-between">
                                    <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Derniers points</h2>
                                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                        Projets →
                                    </Link>
                                </div>
                                {latestUpdates.length === 0 ? (
                                    <p className="dash-note">Aucun point partagé pour l’instant.</p>
                                ) : (
                                    latestUpdates.map((update) => {
                                        const project = findProject(update.projectId)
                                        return (
                                            <Link key={update.id} to={`/projects/${update.projectId}`} className="dash-overview-listing">
                                                <div style={{ minWidth: 0 }}>
                                                    <span className="dash-kicker">{project?.name ?? 'Projet'} · {formatDate(update.date)}</span>
                                                    <p className="dash-overview-listing__title">{update.title}</p>
                                                </div>
                                                <span className="dash-kicker">Ouvrir →</span>
                                            </Link>
                                        )
                                    })
                                )}
                            </div>
                        </aside>
                    </section>
                </>
            )}
        </div>
    )
}
