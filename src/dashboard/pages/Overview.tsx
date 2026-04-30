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

    const activeProjects = projects.filter((p) => p.status !== 'live' && p.status !== 'paused')
    const visibleProjects = activeProjects.length > 0 ? activeProjects : projects
    const heroProject: Project | undefined = visibleProjects[0]
    const otherProjects = visibleProjects.slice(1)
    const openTickets = tickets.filter((t) => t.status !== 'resolved')
    const outstandingInvoices = invoices.filter((inv) => inv.status === 'due' || inv.status === 'overdue')
    const dueTotal = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const latestUpdate = heroProject
        ? [...projectUpdates]
              .filter((u) => u.projectId === heroProject.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : undefined
    const firstName = user?.name?.split(' ')[0] ?? 'là'

    return (
        <div className="dash-stack-lg">
            {/* Greeting */}
            <header className="dash-page-head">
                <span className="dash-kicker">( 01 ) — Aperçu</span>
                <h1 className="dash-h1">
                    Bonjour, <span className="serif-italic">{firstName}.</span>
                </h1>
            </header>

            {!heroProject ? (
                <EmptyState title="Aucun projet actif" body="Tes projets apparaîtront ici dès qu’ils sont lancés." />
            ) : (
                <>
                    {/* HERO — projet principal */}
                    {(() => {
                        const { current, upcoming } = nextSteps(heroProject)
                        return (
                            <Link to={`/projects/${heroProject.id}`} className="dash-card dash-card--pop dash-card--link">
                                <span className="dash-card__accent" style={{ background: heroProject.accent }} />
                                <div className="dash-row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                                    <ProjectStatusPill status={heroProject.status} />
                                    <span className="dash-kicker">Livraison · {deliveryHint(heroProject.delivery)}</span>
                                </div>
                                <h2 className="dash-h1" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 48px)' }}>
                                    {heroProject.name}
                                </h2>
                                {heroProject.tagline && (
                                    <p className="dash-sub" style={{ fontSize: 16, marginTop: 4 }}>{heroProject.tagline}</p>
                                )}

                                <div className="dash-stack-sm" style={{ marginTop: 18 }}>
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">Avancement · {PHASE_LABEL[heroProject.status]}</span>
                                        <span className="dash-progress__value">{heroProject.progress}%</span>
                                    </div>
                                    <ProgressBar value={heroProject.progress} color={heroProject.accent} />
                                </div>

                                {(current || upcoming) && (
                                    <div className="dash-grid dash-grid--2" style={{ marginTop: 18, gap: 12 }}>
                                        <div>
                                            <span className="dash-kicker">En cours</span>
                                            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600 }}>
                                                {current?.label ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="dash-kicker">Étape suivante</span>
                                            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600 }}>
                                                {upcoming?.label ?? (current ? '—' : 'À définir')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        )
                    })()}

                    {/* Dernier point projet */}
                    {latestUpdate && (
                        <Link to={`/projects/${heroProject.id}`} className="dash-card dash-card--link">
                            <div className="dash-row-between">
                                <span className="dash-kicker">Dernier point · {formatDate(latestUpdate.date)}</span>
                                <span className="dash-kicker">{latestUpdate.authorName}</span>
                            </div>
                            <h3 className="dash-h2" style={{ marginTop: 6, fontSize: 'clamp(16px, 2vw, 22px)' }}>
                                {latestUpdate.title}
                            </h3>
                            <p className="dash-sub" style={{ fontSize: 15, marginTop: 6, lineHeight: 1.55 }}>
                                {latestUpdate.body.length > 220 ? `${latestUpdate.body.slice(0, 220).trimEnd()}…` : latestUpdate.body}
                            </p>
                        </Link>
                    )}

                    {/* Autres projets */}
                    {otherProjects.length > 0 && (
                        <section className="dash-stack">
                            <div className="dash-row-between">
                                <h2 className="dash-h2">Autres projets</h2>
                                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Tout voir →
                                </Link>
                            </div>
                            <div className="dash-grid dash-grid--2">
                                {otherProjects.map((project) => (
                                    <Link key={project.id} to={`/projects/${project.id}`} className="dash-card dash-card--link">
                                        <span className="dash-card__accent" style={{ background: project.accent }} />
                                        <div className="dash-row-between">
                                            <ProjectStatusPill status={project.status} />
                                            <span className="dash-kicker">{deliveryHint(project.delivery)}</span>
                                        </div>
                                        <h3 className="dash-h2" style={{ marginTop: 6, fontSize: 'clamp(16px, 2vw, 22px)' }}>
                                            {project.name}
                                        </h3>
                                        <div className="dash-stack-sm" style={{ marginTop: 10 }}>
                                            <div className="dash-row-between">
                                                <span className="dash-kicker">Avancement</span>
                                                <span className="dash-progress__value">{project.progress}%</span>
                                            </div>
                                            <ProgressBar value={project.progress} color={project.accent} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Actions à faire */}
            {(openTickets.length > 0 || outstandingInvoices.length > 0) && (
                <div className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    {outstandingInvoices.length > 0 && (
                        <div className="dash-card">
                            <div className="dash-row-between">
                                <div>
                                    <span className="dash-kicker">À régler</span>
                                    <p className="dash-h2" style={{ margin: '4px 0 0', fontSize: 'clamp(20px, 2.4vw, 28px)' }}>
                                        {formatEur(dueTotal)}
                                    </p>
                                </div>
                                <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Voir tout →
                                </Link>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                {outstandingInvoices.slice(0, 3).map((invoice) => {
                                    const proj = findProject(invoice.projectId)
                                    return (
                                        <Link
                                            key={invoice.id}
                                            to={`/invoices/${invoice.id}`}
                                            className="dash-row-between"
                                            style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)', textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <div>
                                                <span className="dash-kicker">{proj?.name ?? invoice.number}</span>
                                                <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600 }}>{formatEur(invoice.amount)}</p>
                                            </div>
                                            <InvoiceStatusPill status={invoice.status} />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {openTickets.length > 0 && (
                        <div className="dash-card">
                            <div className="dash-row-between">
                                <div>
                                    <span className="dash-kicker">Questions</span>
                                    <p className="dash-h2" style={{ margin: '4px 0 0', fontSize: 'clamp(20px, 2.4vw, 28px)' }}>
                                        {openTickets.length} ouverte{openTickets.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <Link to="/tickets/new" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Nouvelle →
                                </Link>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                {openTickets.slice(0, 3).map((ticket) => {
                                    const proj = findProject(ticket.projectId)
                                    return (
                                        <Link key={ticket.id} to="/tickets" className="dash-row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)', textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <span className="dash-kicker">{proj?.name ?? 'Sans projet'}</span>
                                                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {ticket.subject}
                                                </p>
                                            </div>
                                            <TicketStatusPill status={ticket.status} />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
