import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { PROJECTS } from '../data'
import { ProjectStatusPill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'

const EXPO = [0.16, 1, 0.3, 1] as const

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export default function Projects() {
    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 02 ) — Projets</span>
                <h1 className="dash-h1">
                    Tout ce qu'on <span className="serif-italic">construit</span> pour toi.
                </h1>
                <p className="dash-sub">
                    Un projet par carte. Clique pour voir le détail, les étapes et les dernières nouvelles.
                </p>
            </header>

            <section className="dash-grid dash-grid--2">
                {PROJECTS.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EXPO, delay: 0.05 + i * 0.08 }}
                    >
                        <Link to={`/projects/${p.id}`} className="dash-card dash-card--pop dash-card--link">
                            <span className="dash-card__accent" style={{ background: p.accent }} />
                            <div className="dash-row-between">
                                <ProjectStatusPill status={p.status} />
                                <span className="dash-kicker">Livraison · {formatDate(p.delivery)}</span>
                            </div>
                            <h2 className="dash-h2" style={{ marginTop: 6 }}>
                                {p.name}
                            </h2>
                            <p className="dash-sub" style={{ fontSize: 17 }}>
                                {p.tagline}
                            </p>

                            <div className="dash-stack-sm" style={{ marginTop: 8 }}>
                                <div className="dash-row-between">
                                    <span className="dash-kicker">Avancement</span>
                                    <span className="dash-progress__value">{p.progress}%</span>
                                </div>
                                <ProgressBar value={p.progress} color={p.accent} />
                            </div>

                            <div className="dash-row" style={{ marginTop: 8 }}>
                                <span className="dash-kicker">Kickoff · {formatDate(p.kickoff)}</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </section>
        </div>
    )
}
