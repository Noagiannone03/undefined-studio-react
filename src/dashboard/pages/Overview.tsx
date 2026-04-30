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

const MILESTONE_LABEL = {
    upcoming: 'À faire',
    current: 'En cours',
    done: 'Fait',
} as const

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
    const heroOpenTickets = heroProject ? openTickets.filter((ticket) => ticket.projectId === heroProject.id) : []
    const heroOutstandingInvoices = heroProject ? outstandingInvoices.filter((invoice) => invoice.projectId === heroProject.id) : []
    const latestUpdate = heroProject
        ? [...projectUpdates]
              .filter((u) => u.projectId === heroProject.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : undefined
    const firstName = user?.name?.split(' ')[0] ?? 'là'
    const { current: currentStep, upcoming: upcomingStep } = heroProject ? nextSteps(heroProject) : { current: undefined, upcoming: undefined }
    const previewMilestones = heroProject?.milestones.slice(0, 4) ?? []

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
                    <section className="dash-overview-metrics">
                        <Link to={`/projects/${heroProject.id}`} className="dash-card dash-card--link dash-overview-panel dash-overview-panel--metric">
                            <span className="dash-kicker">Projet actif</span>
                            <h2 className="dash-h2 dash-overview-panel__title">{heroProject.name}</h2>
                            <p className="dash-note">{PHASE_LABEL[heroProject.status]}</p>
                        </Link>

                        <div className="dash-card dash-overview-panel dash-overview-panel--metric">
                            <span className="dash-kicker">Avancement</span>
                            <div className="dash-overview-metric__value">{heroProject.progress}%</div>
                            <ProgressBar value={heroProject.progress} color={heroProject.accent} />
                        </div>

                        <div className="dash-card dash-overview-panel dash-overview-panel--metric">
                            <span className="dash-kicker">Livraison cible</span>
                            <h2 className="dash-h2 dash-overview-panel__title">{deliveryHint(heroProject.delivery)}</h2>
                            <p className="dash-note">{currentStep?.label ? `En cours : ${currentStep.label}` : 'Planning en préparation'}</p>
                        </div>

                        <div className="dash-card dash-overview-panel dash-overview-panel--metric">
                            <span className="dash-kicker">Actions ouvertes</span>
                            <div className="dash-overview-metric__split">
                                <div>
                                    <strong>{heroOutstandingInvoices.length}</strong>
                                    <span> facture{heroOutstandingInvoices.length > 1 ? 's' : ''}</span>
                                </div>
                                <div>
                                    <strong>{heroOpenTickets.length}</strong>
                                    <span> question{heroOpenTickets.length > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dash-overview-layout">
                        <div className="dash-overview-main">
                            <Link to={`/projects/${heroProject.id}`} className="dash-card dash-card--link dash-overview-panel dash-overview-panel--project">
                                <span className="dash-card__accent" style={{ background: heroProject.accent }} />
                                <div className="dash-row-between" style={{ alignItems: 'flex-start' }}>
                                    <div className="dash-stack-sm">
                                        <span className="dash-kicker">Pilotage projet</span>
                                        <h2 className="dash-h2 dash-overview-project__title">{heroProject.name}</h2>
                                        {heroProject.tagline && <p className="dash-sub dash-overview-project__sub">{heroProject.tagline}</p>}
                                    </div>
                                    <ProjectStatusPill status={heroProject.status} />
                                </div>

                                <div className="dash-overview-project__meta">
                                    <div className="dash-overview-meta">
                                        <span className="dash-kicker">Phase</span>
                                        <strong>{PHASE_LABEL[heroProject.status]}</strong>
                                    </div>
                                    <div className="dash-overview-meta">
                                        <span className="dash-kicker">En cours</span>
                                        <strong>{currentStep?.label ?? '—'}</strong>
                                    </div>
                                    <div className="dash-overview-meta">
                                        <span className="dash-kicker">Suivant</span>
                                        <strong>{upcomingStep?.label ?? 'À définir'}</strong>
                                    </div>
                                </div>

                                <div className="dash-stack-sm">
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">Progression</span>
                                        <span className="dash-progress__value">{heroProject.progress}%</span>
                                    </div>
                                    <ProgressBar value={heroProject.progress} color={heroProject.accent} />
                                </div>
                            </Link>

                            <div className="dash-grid dash-grid--2">
                                <div className="dash-card dash-overview-panel">
                                    <div className="dash-row-between">
                                        <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Étapes</h2>
                                        <Link to={`/projects/${heroProject.id}`} className="dash-kicker" style={{ textDecoration: 'none' }}>
                                            Ouvrir →
                                        </Link>
                                    </div>
                                    {previewMilestones.length === 0 ? (
                                        <p className="dash-note">Les étapes apparaîtront ici dès qu’elles sont planifiées.</p>
                                    ) : (
                                        <div className="dash-overview-steps">
                                            {previewMilestones.map((milestone) => (
                                                <div key={milestone.id} className={`dash-overview-step dash-overview-step--${milestone.status}`}>
                                                    <span className="dash-overview-step__dot" />
                                                    <div style={{ minWidth: 0 }}>
                                                        <p className="dash-overview-step__label">{milestone.label || 'Étape projet'}</p>
                                                        <span className="dash-note">
                                                            {milestone.date ? formatDate(milestone.date) : MILESTONE_LABEL[milestone.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="dash-card dash-overview-panel">
                                    <div className="dash-row-between">
                                        <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Dernier point</h2>
                                        {latestUpdate && <span className="dash-kicker">{formatDate(latestUpdate.date)}</span>}
                                    </div>
                                    {latestUpdate ? (
                                        <>
                                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{latestUpdate.title}</p>
                                            <p className="dash-sub dash-overview-update__body">
                                                {latestUpdate.body.length > 180 ? `${latestUpdate.body.slice(0, 180).trimEnd()}…` : latestUpdate.body}
                                            </p>
                                            <div className="dash-row-between" style={{ marginTop: 'auto' }}>
                                                <span className="dash-note">{latestUpdate.authorName}</span>
                                                <Link to={`/projects/${heroProject.id}`} className="dash-kicker" style={{ textDecoration: 'none' }}>
                                                    Voir le projet →
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="dash-note">Aucun point partagé pour l’instant.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <aside className="dash-overview-side">
                            <div className="dash-card dash-overview-panel">
                                <div className="dash-row-between">
                                    <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>À faire</h2>
                                    <span className="dash-kicker">Global</span>
                                </div>
                                <div className="dash-overview-action__totals">
                                    <div>
                                        <span className="dash-kicker">Factures</span>
                                        <p className="dash-overview-action__value">{formatEur(dueTotal)}</p>
                                    </div>
                                    <div>
                                        <span className="dash-kicker">Questions</span>
                                        <p className="dash-overview-action__value">{openTickets.length}</p>
                                    </div>
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
                                        <p className="dash-note">Rien en attente pour le moment.</p>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </section>

                    {otherProjects.length > 0 && (
                        <section className="dash-stack">
                            <div className="dash-row-between">
                                <h2 className="dash-h2">Autres projets</h2>
                                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none' }}>
                                    Tout voir →
                                </Link>
                            </div>
                            <div className="dash-grid dash-grid--3">
                                {otherProjects.map((project) => (
                                    <Link key={project.id} to={`/projects/${project.id}`} className="dash-card dash-card--link dash-overview-panel">
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
        </div>
    )
}
