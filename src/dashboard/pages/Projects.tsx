import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { ProjectStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'
import { formatDate } from '../utils'

export default function Projects() {
    const { user } = useAuth()
    const { projects, findClient } = useDashboardData()

    if (user?.role === 'admin') {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <span className="dash-kicker">( ADMIN ) — Projets</span>
                    <h1 className="dash-h1">
                        Tous les <span className="serif-italic">chantiers.</span>
                    </h1>
                    <p className="dash-sub">
                        Crée un projet depuis la fiche client.
                    </p>
                </header>

                {projects.length === 0 ? (
                    <EmptyState
                        title="Aucun projet"
                        body="Crée un projet depuis la fiche client."
                        action={<Link to="/clients" className="dash-btn" style={{ marginTop: 8 }}>Voir les clients →</Link>}
                    />
                ) : (
                    <section className="dash-grid dash-grid--2">
                        {projects.map((project) => {
                            const client = findClient(project.clientId)
                            return (
                                <div key={project.id}>
                                    <Link to={`/projects/${project.id}`} className="dash-card dash-card--pop dash-card--link">
                                        <span className="dash-card__accent" style={{ background: project.accent }} />
                                        <div className="dash-row-between">
                                            <ProjectStatusPill status={project.status} />
                                            <span className="dash-kicker">{client?.name ?? 'Client'} · {formatDate(project.delivery)}</span>
                                        </div>
                                        <h2 className="dash-h2" style={{ marginTop: 6 }}>{project.name}</h2>
                                        <p className="dash-sub" style={{ fontSize: 17 }}>{project.tagline}</p>
                                        <div className="dash-stack-sm" style={{ marginTop: 8 }}>
                                            <div className="dash-row-between">
                                                <span className="dash-kicker">Avancement</span>
                                                <span className="dash-progress__value">{project.progress}%</span>
                                            </div>
                                            <ProgressBar value={project.progress} color={project.accent} />
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}
                    </section>
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
            </header>

            {projects.length === 0 ? (
                <EmptyState title="Aucun projet" body="On t'affichera tes projets ici." />
            ) : (
                <section className="dash-grid dash-grid--2">
                    {projects.map((project) => (
                        <div key={project.id}>
                            <Link to={`/projects/${project.id}`} className="dash-card dash-card--pop dash-card--link">
                                <span className="dash-card__accent" style={{ background: project.accent }} />
                                <div className="dash-row-between">
                                    <ProjectStatusPill status={project.status} />
                                    <span className="dash-kicker">Livraison · {formatDate(project.delivery)}</span>
                                </div>
                                <h2 className="dash-h2" style={{ marginTop: 6 }}>{project.name}</h2>
                                <p className="dash-sub" style={{ fontSize: 17 }}>{project.tagline}</p>

                                <div className="dash-stack-sm" style={{ marginTop: 8 }}>
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">Avancement</span>
                                        <span className="dash-progress__value">{project.progress}%</span>
                                    </div>
                                    <ProgressBar value={project.progress} color={project.accent} />
                                </div>

                                <div className="dash-row" style={{ marginTop: 8 }}>
                                    <span className="dash-kicker">Kickoff · {formatDate(project.kickoff)}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}
