import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { ProgressBar } from '../components/ProgressBar'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { createProjectUpdate, updateProject } from '../firestore'
import { mailApi } from '../api'
import { formatDate, formatEur } from '../utils'
import type { Milestone, ProjectStatus } from '../types'

const PROJECT_STATUSES: ProjectStatus[] = ['discovery', 'design', 'build', 'review', 'live', 'paused']

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { loading, findProject, findClient, updatesForProject, tickets, invoices } = useDashboardData()
    const project = findProject(id)

    const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'discovery')
    const [progress, setProgress] = useState(String(project?.progress ?? 0))
    const [kickoff, setKickoff] = useState(project?.kickoff ?? '')
    const [delivery, setDelivery] = useState(project?.delivery ?? '')
    const [summary, setSummary] = useState(project?.summary ?? '')
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateBody, setUpdateBody] = useState('')
    const [savingProject, setSavingProject] = useState(false)
    const [publishingUpdate, setPublishingUpdate] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editMilestones, setEditMilestones] = useState<Milestone[]>(project?.milestones ?? [])
    const [savingMilestones, setSavingMilestones] = useState(false)

    useEffect(() => {
        if (!project) return
        setStatus(project.status)
        setProgress(String(project.progress))
        setKickoff(project.kickoff)
        setDelivery(project.delivery)
        setSummary(project.summary ?? '')
        setEditMilestones(project.milestones)
    }, [project])

    if (loading && !project) {
        return (
            <div className="dash-card">
                <span className="dash-kicker">Projet</span>
                <h1 className="dash-h2">Chargement…</h1>
            </div>
        )
    }

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

    const projectTickets = tickets.filter((ticket) => ticket.projectId === project.id)
    const projectInvoices = invoices.filter((invoice) => invoice.projectId === project.id)
    const projectUpdates = updatesForProject(project.id)
    const client = findClient(project.clientId)

    const onSaveProject = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setSavingProject(true)
        try {
            await updateProject(project.id, {
                status,
                progress: Number(progress) || 0,
                kickoff,
                delivery,
                summary,
            })

            const contactEmail = client?.contactEmail
            if (contactEmail && (status !== project.status || Number(progress) !== project.progress)) {
                mailApi.projectStatus({
                    to: contactEmail,
                    contactName: client?.contactName ?? '',
                    clientName: client?.name ?? '',
                    projectName: project.name,
                    projectId: project.id,
                    newStatus: status,
                    progress: Number(progress) || 0,
                    summary: summary || undefined,
                })
            }
        } catch {
            setError("Impossible d'enregistrer le projet.")
        } finally {
            setSavingProject(false)
        }
    }

    const onSaveMilestones = async () => {
        setSavingMilestones(true)
        setError(null)
        try {
            await updateProject(project.id, {
                status: project.status,
                progress: project.progress,
                kickoff: project.kickoff,
                delivery: project.delivery,
                summary: project.summary,
                milestones: editMilestones,
            })
        } catch {
            setError('Impossible d\'enregistrer les étapes.')
        } finally {
            setSavingMilestones(false)
        }
    }

    const addMilestone = () => {
        setEditMilestones((prev) => [
            ...prev,
            { id: `m-${Date.now()}`, label: '', status: 'upcoming' },
        ])
    }

    const removeMilestone = (id: string) => {
        setEditMilestones((prev) => prev.filter((m) => m.id !== id))
    }

    const updateMilestone = (id: string, patch: Partial<Milestone>) => {
        setEditMilestones((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }

    const onPublishUpdate = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        if (!updateTitle.trim() || !updateBody.trim()) {
            setError('Titre et contenu requis pour publier une update.')
            return
        }

        setPublishingUpdate(true)
        try {
            await createProjectUpdate({
                clientId: project.clientId,
                projectId: project.id,
                title: updateTitle,
                body: updateBody,
                authorName: user?.name ?? 'Undefined',
            })

            const contactEmail = client?.contactEmail
            if (contactEmail) {
                mailApi.projectStatus({
                    to: contactEmail,
                    contactName: client?.contactName ?? '',
                    clientName: client?.name ?? '',
                    projectName: project.name,
                    projectId: project.id,
                    newStatus: status,
                    progress: Number(progress) || 0,
                    isUpdate: true,
                    updateTitle,
                    updateBody,
                })
            }

            setUpdateTitle('')
            setUpdateBody('')
        } catch {
            setError('Publication impossible.')
        } finally {
            setPublishingUpdate(false)
        }
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Tous les projets
                </Link>
                <div className="dash-row" style={{ marginTop: 8 }}>
                    <ProjectStatusPill status={project.status} />
                    <span className="dash-kicker">{client?.name ?? 'Client'} · Livraison {formatDate(project.delivery)}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>{project.name}</h1>
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
                    {project.summary && <span className="dash-kicker">·</span>}
                    {project.summary && <span className="dash-kicker">{project.summary}</span>}
                </div>
            </section>

            {user?.role === 'admin' && (
                <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <form onSubmit={onSaveProject} className="dash-card dash-stack" noValidate>
                        <h2 className="dash-h2">Pilotage projet</h2>
                        <div className="dash-grid dash-grid--2">
                            <div>
                                <label htmlFor="project-status" className="dash-label">Statut</label>
                                <select id="project-status" className="dash-input" value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>
                                    {PROJECT_STATUSES.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="project-progress" className="dash-label">Avancement %</label>
                                <input id="project-progress" type="number" min="0" max="100" className="dash-input" value={progress} onChange={(event) => setProgress(event.target.value)} />
                            </div>
                        </div>
                        <div className="dash-grid dash-grid--2">
                            <div>
                                <label htmlFor="project-kickoff" className="dash-label">Kickoff</label>
                                <input id="project-kickoff" type="date" className="dash-input" value={kickoff} onChange={(event) => setKickoff(event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="project-delivery" className="dash-label">Livraison</label>
                                <input id="project-delivery" type="date" className="dash-input" value={delivery} onChange={(event) => setDelivery(event.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="project-summary" className="dash-label">Résumé visible</label>
                            <textarea id="project-summary" className="dash-input dash-textarea" value={summary} onChange={(event) => setSummary(event.target.value)} />
                        </div>
                        <button type="submit" className="dash-btn" disabled={savingProject}>
                            {savingProject ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </form>

                    <form onSubmit={onPublishUpdate} className="dash-card dash-stack" noValidate>
                        <h2 className="dash-h2">Publier une update client</h2>
                        <div>
                            <label htmlFor="update-title" className="dash-label">Titre</label>
                            <input id="update-title" className="dash-input" value={updateTitle} onChange={(event) => setUpdateTitle(event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="update-body" className="dash-label">Contenu</label>
                            <textarea id="update-body" className="dash-input dash-textarea" value={updateBody} onChange={(event) => setUpdateBody(event.target.value)} />
                        </div>
                        <button type="submit" className="dash-btn" disabled={publishingUpdate}>
                            {publishingUpdate ? 'Publication...' : 'Publier la nouvelle'}
                        </button>
                    </form>
                </section>
            )}

            {error && <div className="login__error">{error}</div>}

            <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                <div className="dash-card">
                    <h2 className="dash-h2">Étapes</h2>
                    {user?.role === 'admin' ? (
                        <div className="dash-stack">
                            {editMilestones.map((milestone, index) => (
                                <div key={milestone.id} className="dash-milestone-edit">
                                    <div className="dash-milestone-edit__row">
                                        <span className="dash-milestone-edit__num">{String(index + 1).padStart(2, '0')}</span>
                                        <input
                                            type="text"
                                            className="dash-input dash-milestone-edit__label"
                                            value={milestone.label}
                                            placeholder="Nom de l'étape"
                                            onChange={(e) => updateMilestone(milestone.id, { label: e.target.value })}
                                        />
                                        <select
                                            className="dash-input dash-milestone-edit__status"
                                            value={milestone.status}
                                            onChange={(e) => updateMilestone(milestone.id, { status: e.target.value as Milestone['status'] })}
                                        >
                                            <option value="upcoming">À venir</option>
                                            <option value="current">En cours</option>
                                            <option value="done">Fait</option>
                                        </select>
                                        <input
                                            type="date"
                                            className="dash-input dash-milestone-edit__date"
                                            value={milestone.date ?? ''}
                                            onChange={(e) => updateMilestone(milestone.id, { date: e.target.value || undefined })}
                                        />
                                        <button
                                            type="button"
                                            className="dash-milestone-edit__remove"
                                            title="Supprimer"
                                            onClick={() => removeMilestone(milestone.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="dash-row" style={{ gap: 8, marginTop: 4 }}>
                                <button type="button" className="dash-btn dash-btn--ghost" style={{ height: 40, fontSize: 12, padding: '0 16px' }} onClick={addMilestone}>
                                    + Étape
                                </button>
                                <button type="button" className="dash-btn" style={{ height: 40, fontSize: 12, padding: '0 16px' }} disabled={savingMilestones} onClick={onSaveMilestones}>
                                    {savingMilestones ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ul className="dash-timeline">
                            {project.milestones.map((milestone) => (
                                <li key={milestone.id} className={`dash-milestone dash-milestone--${milestone.status}`}>
                                    <span className="dash-milestone__marker" />
                                    <span className="dash-milestone__line" />
                                    <div className="dash-row-between" style={{ alignItems: 'baseline' }}>
                                        <p className="dash-milestone__title">{milestone.label}</p>
                                        {milestone.status === 'current' && <span className="dash-pill dash-pill--klein">En cours</span>}
                                        {milestone.status === 'done' && <span className="dash-pill dash-pill--ink">Fait</span>}
                                    </div>
                                    <p className="dash-milestone__date">{formatDate(milestone.date)}</p>
                                    {milestone.note && <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{milestone.note}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="dash-card">
                    <h2 className="dash-h2">Nouvelles du projet</h2>
                    {projectUpdates.length === 0 ? (
                        <p className="dash-sub">Rien de neuf.</p>
                    ) : (
                        <div>
                            {projectUpdates.map((update) => (
                                <article key={update.id} className="dash-update">
                                    <div className="dash-update__head">
                                        <h3 className="dash-update__title">{update.title}</h3>
                                        <span className="dash-update__meta">
                                            {formatDate(update.date)} · {update.authorName}
                                        </span>
                                    </div>
                                    <p className="dash-update__body">{update.body}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Tickets liés</h2>
                    {user?.role === 'client' && (
                        <Link to="/tickets/new" className="dash-kicker" style={{ textDecoration: 'none' }}>
                            Nouveau ticket →
                        </Link>
                    )}
                </div>
                {projectTickets.length === 0 ? (
                    <EmptyState title="Pas de ticket" body="Ouvre un ticket, on gère." />
                ) : (
                    <div className="dash-stack">
                        {projectTickets.map((ticket) => (
                            <div key={ticket.id} className="dash-card">
                                <div className="dash-row-between">
                                    <span className="dash-kicker">{ticket.id.toUpperCase()}</span>
                                    <TicketStatusPill status={ticket.status} />
                                </div>
                                <h3 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}>{ticket.subject}</h3>
                                <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
                                    {ticket.body}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {user?.role === 'client' && (
                <section className="dash-stack">
                    <div className="dash-row-between">
                        <h2 className="dash-h2">Factures</h2>
                        <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>
                            Toutes →
                        </Link>
                    </div>
                    {projectInvoices.length === 0 ? (
                        <EmptyState title="Aucune facture" body="Elles arriveront ici." />
                    ) : (
                        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="dash-table-wrap">
                                <table className="dash-table">
                                    <thead>
                                        <tr>
                                            <th>Numero</th>
                                            <th>Emise</th>
                                            <th>Montant</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectInvoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="dash-table__num">{invoice.number}</td>
                                                <td>{formatDate(invoice.issued)}</td>
                                                <td className="dash-table__num">{formatEur(invoice.amount)}</td>
                                                <td><InvoiceStatusPill status={invoice.status} /></td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}
