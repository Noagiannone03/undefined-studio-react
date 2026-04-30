import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { ProjectStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'
import { formatDate } from '../utils'
import type { Milestone, Project } from '../types'

function currentMilestone(milestones: Milestone[]) {
    return milestones.find((m) => m.status === 'current') ?? milestones.find((m) => m.status === 'upcoming')
}

function projectSortValue(project: Project) {
    const statusWeight = project.status === 'paused' ? 2 : project.status === 'live' ? 1 : 0
    return `${statusWeight}-${project.delivery || '9999-99-99'}`
}

function ProjectCard({ project, clientName, showClient }: { project: Project; clientName?: string; showClient?: boolean }) {
    const current = currentMilestone(project.milestones)
    const doneCount = project.milestones.filter((m) => m.status === 'done').length

    return (
        <Link to={`/projects/${project.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0', borderBottom: '1px solid var(--color-ink)', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="dash-row" style={{ gap: 10 }}>
                        <ProjectStatusPill status={project.status} />
                        {showClient && <span className="dash-kicker">{clientName ?? 'Client'}</span>}
                    </div>
                    <div>
                        <h2 className="dash-h2" style={{ fontSize: 'clamp(20px, 2vw, 26px)', margin: 0, lineHeight: 1.1 }}>{project.name}</h2>
                        {project.tagline && <p className="dash-note" style={{ marginTop: 6, fontSize: 13, maxWidth: '40ch' }}>{project.tagline}</p>}
                    </div>
                </div>

                <div style={{ flex: '1 1 300px', display: 'flex', gap: 24, paddingTop: 4 }}>
                    <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid var(--color-hair)', paddingLeft: 20 }}>
                        <span className="dash-kicker" style={{ color: 'var(--color-ink-soft)' }}>En cours</span>
                        <strong style={{ display: 'block', marginTop: 4, fontSize: 15, fontWeight: 700 }}>{current?.label ?? 'À définir'}</strong>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid var(--color-hair)', paddingLeft: 20 }}>
                        <span className="dash-kicker" style={{ color: 'var(--color-ink-soft)' }}>Livraison</span>
                        <strong style={{ display: 'block', marginTop: 4, fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(project.delivery)}</strong>
                    </div>
                </div>

                <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                    <span style={{ display: 'block', fontFamily: 'Archivo Black, sans-serif', fontSize: '32px', lineHeight: 0.9 }}>{project.progress}%</span>
                    <span className="dash-kicker" style={{ display: 'block', marginTop: 6, color: 'var(--color-ink-soft)' }}>{doneCount}/{project.milestones.length || 0} étapes</span>
                </div>
            </div>

            <ProgressBar value={project.progress} color={project.accent} />
        </Link>
    )
}

export default function Projects() {
    const { user } = useAuth()
    const { projects, findClient, hasClientScope, error } = useDashboardData()
    const sortedProjects = [...projects].sort((a, b) => projectSortValue(a).localeCompare(projectSortValue(b)))
    const activeCount = projects.filter((project) => project.status !== 'live' && project.status !== 'paused').length
    const liveCount = projects.filter((project) => project.status === 'live').length
    const pausedCount = projects.filter((project) => project.status === 'paused').length
    const nextProject = sortedProjects.find((project) => project.status !== 'live' && project.status !== 'paused') ?? sortedProjects[0]

    if (user?.role === 'admin') {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <span className="dash-kicker">( ADMIN ) — Projets</span>
                    <h1 className="dash-h1">
                        Tous les <span className="serif-italic">projets.</span>
                    </h1>
                    <p className="dash-sub">
                        Vision d'ensemble sur l'avancée et les prochaines étapes.
                    </p>
                </header>

                {projects.length === 0 ? (
                    <EmptyState
                        title="Aucun projet"
                        body="Crée un projet depuis la fiche client."
                        action={<Link to="/clients" className="dash-btn" style={{ marginTop: 8 }}>Voir les clients →</Link>}
                    />
                ) : (
                    <>
                        <section className="dash-project-summary">
                            <div className="dash-card dash-project-summary__main">
                                <span className="dash-kicker">Prochain à suivre</span>
                                <h2 className="dash-h2">{nextProject?.name ?? 'Aucun projet'}</h2>
                                <p className="dash-note">{nextProject ? `Livraison ${formatDate(nextProject.delivery)}` : 'Planning vide'}</p>
                            </div>
                            <div className="dash-card dash-project-summary__stats">
                                <div><span className="dash-kicker">En cours</span><strong>{activeCount}</strong></div>
                                <div><span className="dash-kicker">En ligne</span><strong>{liveCount}</strong></div>
                                <div><span className="dash-kicker">Pause</span><strong>{pausedCount}</strong></div>
                            </div>
                        </section>
                        <section style={{ display: 'flex', flexDirection: 'column' }}>
                            {sortedProjects.map((project) => {
                                const client = findClient(project.clientId)
                                return <ProjectCard key={project.id} project={project} clientName={client?.name} showClient />
                            })}
                        </section>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 02 ) — Projets</span>
                <h1 className="dash-h1">
                    Tes <span className="serif-italic">projets.</span>
                </h1>
                <p className="dash-sub">Une vision claire sur l'avancée et les prochaines étapes.</p>
            </header>

            {error && <div className="login__error">{error}</div>}

            {!hasClientScope ? (
                <EmptyState
                    title="Compte pas encore relié"
                    body="Ton compte n'est pas encore associé à un dossier client. Contacte le studio pour activer l'accès."
                />
            ) : projects.length === 0 ? (
                <EmptyState title="Aucun projet" body="On t'affichera tes projets ici." />
            ) : (
                <>
                    <section className="dash-project-summary">
                        <div className="dash-card dash-project-summary__main">
                            <span className="dash-kicker">À suivre</span>
                            <h2 className="dash-h2">{nextProject?.name ?? 'Aucun projet'}</h2>
                            <p className="dash-note">{nextProject ? `Livraison ${formatDate(nextProject.delivery)}` : 'Planning en préparation'}</p>
                        </div>
                        <div className="dash-card dash-project-summary__stats">
                            <div><span className="dash-kicker">Projets</span><strong>{projects.length}</strong></div>
                            <div><span className="dash-kicker">Actifs</span><strong>{activeCount}</strong></div>
                            <div><span className="dash-kicker">Livrés</span><strong>{liveCount}</strong></div>
                        </div>
                    </section>
                    <section style={{ display: 'flex', flexDirection: 'column' }}>
                        {sortedProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </section>
                </>
            )}
        </div>
    )
}
