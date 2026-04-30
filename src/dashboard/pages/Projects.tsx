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
        <Link to={`/projects/${project.id}`} className="dash-card dash-card--link dash-project-card">
            <span className="dash-card__accent" style={{ background: project.accent }} />
            <div className="dash-project-card__head">
                <div className="dash-stack-sm">
                    <div className="dash-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                        <ProjectStatusPill status={project.status} />
                        {showClient && <span className="dash-kicker">{clientName ?? 'Client'}</span>}
                    </div>
                    <h2 className="dash-h2 dash-project-card__title">{project.name}</h2>
                    {project.tagline && <p className="dash-note dash-project-card__sub">{project.tagline}</p>}
                </div>
                <div className="dash-project-card__score">
                    <span>{project.progress}%</span>
                </div>
            </div>

            <ProgressBar value={project.progress} color={project.accent} />

            <div className="dash-project-card__grid">
                <div>
                    <span className="dash-kicker">En cours</span>
                    <strong>{current?.label ?? 'À définir'}</strong>
                </div>
                <div>
                    <span className="dash-kicker">Livraison</span>
                    <strong>{formatDate(project.delivery)}</strong>
                </div>
                <div>
                    <span className="dash-kicker">Étapes faites</span>
                    <strong>{doneCount}/{project.milestones.length || 0}</strong>
                </div>
            </div>
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
                        Tous les <span className="serif-italic">chantiers.</span>
                    </h1>
                    <p className="dash-sub">
                        Ce qui avance, ce qui bloque, ce qui part bientôt.
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
                        <section className="dash-project-list">
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
                <p className="dash-sub">Le point simple sur ce qui avance et ce qui arrive ensuite.</p>
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
                    <section className="dash-project-list">
                        {sortedProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </section>
                </>
            )}
        </div>
    )
}
