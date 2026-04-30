import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { EmptyState } from '../components/EmptyState'
import { ProgressBar } from '../components/ProgressBar'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { SaveIndicator } from '../components/SaveIndicator'
import { useAutoSave } from '../components/useAutoSave'
import { createProjectUpdate, updateProject } from '../firestore'
import { mailApi } from '../api'
import { formatDate, formatEur } from '../utils'
import type { Milestone, ProjectStatus } from '../types'

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; tone: 'mute' | 'klein' | 'tomato' | 'ink' }[] = [
    { value: 'discovery', label: 'Cadrage', tone: 'mute' },
    { value: 'design', label: 'Design', tone: 'klein' },
    { value: 'build', label: 'Dev', tone: 'klein' },
    { value: 'review', label: 'Revue', tone: 'tomato' },
    { value: 'live', label: 'En ligne', tone: 'ink' },
    { value: 'paused', label: 'En pause', tone: 'mute' },
]

const MILESTONE_STATUS_OPTIONS: { value: Milestone['status']; label: string }[] = [
    { value: 'upcoming', label: 'À venir' },
    { value: 'current', label: 'En cours' },
    { value: 'done', label: 'Fait' },
]

type EditableProject = {
    status: ProjectStatus
    progress: number
    kickoff: string
    delivery: string
    summary: string
    milestones: Milestone[]
}

function projectsAreEqual(a: EditableProject, b: EditableProject): boolean {
    if (
        a.status !== b.status ||
        a.progress !== b.progress ||
        a.kickoff !== b.kickoff ||
        a.delivery !== b.delivery ||
        a.summary !== b.summary ||
        a.milestones.length !== b.milestones.length
    ) {
        return false
    }
    for (let i = 0; i < a.milestones.length; i++) {
        const left = a.milestones[i]
        const right = b.milestones[i]
        if (
            left.id !== right.id ||
            left.label !== right.label ||
            left.status !== right.status ||
            (left.date ?? '') !== (right.date ?? '') ||
            (left.note ?? '') !== (right.note ?? '')
        ) {
            return false
        }
    }
    return true
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { loading, findProject, findClient, updatesForProject, tickets, invoicesForProject } = useDashboardData()
    const project = findProject(id)
    const isAdmin = user?.role === 'admin'

    const baseline = useMemo<EditableProject | null>(() => {
        if (!project) return null
        return {
            status: project.status,
            progress: project.progress,
            kickoff: project.kickoff,
            delivery: project.delivery,
            summary: project.summary ?? '',
            milestones: project.milestones,
        }
    }, [project])

    const [draft, setDraft] = useState<EditableProject | null>(baseline)
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateBody, setUpdateBody] = useState('')
    const [publishingUpdate, setPublishingUpdate] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)

    useEffect(() => {
        if (!baseline) return
        // Adopt server state whenever the snapshot changes — but only if user
        // hasn't started editing the same fields locally (we trust auto-save
        // to have already pushed local changes upstream).
        setDraft(baseline)
    }, [baseline])

    const client = project ? findClient(project.clientId) : undefined

    const { state: saveState, errorMessage: saveError, adopt: adoptDraft } = useAutoSave<EditableProject | null>({
        value: draft,
        enabled: Boolean(isAdmin && project && draft),
        isEqual: (a, b) => {
            if (!a || !b) return a === b
            return projectsAreEqual(a, b)
        },
        onSave: async (next) => {
            if (!project || !next) return
            await updateProject(project.id, {
                status: next.status,
                progress: next.progress,
                kickoff: next.kickoff,
                delivery: next.delivery,
                summary: next.summary,
                milestones: next.milestones,
            })

            const contactEmail = client?.contactEmail
            if (
                contactEmail &&
                (next.status !== project.status || next.progress !== project.progress)
            ) {
                mailApi.projectStatus({
                    to: contactEmail,
                    contactName: client?.contactName ?? '',
                    clientName: client?.name ?? '',
                    projectName: project.name,
                    projectId: project.id,
                    newStatus: next.status,
                    progress: next.progress,
                    summary: next.summary || undefined,
                })
            }
        },
    })

    // After the snapshot updates, reset the baseline tracker so we don't
    // re-fire saves for the same data.
    useEffect(() => {
        if (baseline) adoptDraft(baseline)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.updatedAt])

    if (loading && !project) {
        return (
            <div className="dash-card">
                <span className="dash-kicker">Projet</span>
                <h1 className="dash-h2">Chargement…</h1>
            </div>
        )
    }

    if (!project || !draft) {
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
    const projectInvoices = invoicesForProject(project.id)
    const projectUpdates = updatesForProject(project.id)

    const patchDraft = (patch: Partial<EditableProject>) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
    }

    const patchMilestones = (next: Milestone[]) => {
        setDraft((prev) => (prev ? { ...prev, milestones: next } : prev))
    }

    const addMilestone = () => {
        patchMilestones([
            ...draft.milestones,
            { id: `m-${Date.now()}`, label: '', status: 'upcoming' },
        ])
    }

    const removeMilestone = (mid: string) => {
        patchMilestones(draft.milestones.filter((m) => m.id !== mid))
    }

    const updateMilestone = (mid: string, patch: Partial<Milestone>) => {
        patchMilestones(draft.milestones.map((m) => (m.id === mid ? { ...m, ...patch } : m)))
    }

    const moveMilestone = (mid: string, dir: -1 | 1) => {
        const idx = draft.milestones.findIndex((m) => m.id === mid)
        if (idx < 0) return
        const next = idx + dir
        if (next < 0 || next >= draft.milestones.length) return
        const arr = [...draft.milestones]
        ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
        patchMilestones(arr)
    }

    const onPublishUpdate = async (event: FormEvent) => {
        event.preventDefault()
        setUpdateError(null)
        if (!updateTitle.trim() || !updateBody.trim()) {
            setUpdateError('Titre et contenu requis pour publier une update.')
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
                    newStatus: draft.status,
                    progress: draft.progress,
                    isUpdate: true,
                    updateTitle,
                    updateBody,
                })
            }

            setUpdateTitle('')
            setUpdateBody('')
        } catch {
            setUpdateError('Publication impossible.')
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
                    <ProjectStatusPill status={draft.status} />
                    <span className="dash-kicker">{client?.name ?? 'Client'} · Livraison {formatDate(draft.delivery)}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>{project.name}</h1>
                <p className="dash-sub">{project.tagline}</p>
            </header>

            <section className="dash-card dash-card--pop" style={{ position: 'relative' }}>
                <span className="dash-card__accent" style={{ background: project.accent }} />
                <div className="dash-row-between">
                    <span className="dash-kicker">Avancement global</span>
                    <span className="dash-progress__value">{draft.progress}%</span>
                </div>
                <ProgressBar value={draft.progress} color={project.accent} />
                <div className="dash-row" style={{ marginTop: 14 }}>
                    <span className="dash-kicker">Kickoff · {formatDate(draft.kickoff)}</span>
                    {draft.summary && <span className="dash-kicker">·</span>}
                    {draft.summary && <span className="dash-kicker">{draft.summary}</span>}
                </div>
            </section>

            {isAdmin && (
                <section className="dash-edit">
                    <div className="dash-edit__head">
                        <h2 className="dash-h2">Pilotage projet</h2>
                        <SaveIndicator state={saveState} errorMessage={saveError} />
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Statut</span>
                        <div className="dash-status-picker">
                            {PROJECT_STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => patchDraft({ status: opt.value })}
                                    className={`dash-status-pick tone-${opt.tone}${draft.status === opt.value ? ' is-active' : ''}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Avancement</span>
                        <div className="dash-slider-wrap">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={draft.progress}
                                onChange={(e) => patchDraft({ progress: Number(e.target.value) })}
                                className="dash-slider"
                            />
                            <span className="dash-slider-value">{draft.progress}%</span>
                        </div>
                    </div>

                    <div className="dash-grid dash-grid--2">
                        <div>
                            <label className="dash-label">Kickoff</label>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.kickoff}
                                onChange={(e) => patchDraft({ kickoff: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="dash-label">Livraison</label>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.delivery}
                                onChange={(e) => patchDraft({ delivery: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Résumé visible (client)</span>
                        <textarea
                            className="dash-inline-textarea"
                            value={draft.summary}
                            onChange={(e) => patchDraft({ summary: e.target.value })}
                            placeholder="En une phrase, où en est le projet ?"
                        />
                    </div>
                </section>
            )}

            <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                <div className={isAdmin ? 'dash-edit' : 'dash-card'}>
                    <div className="dash-edit__head">
                        <h2 className="dash-h2">Étapes</h2>
                        {isAdmin && <SaveIndicator state={saveState} errorMessage={saveError} />}
                    </div>
                    {isAdmin ? (
                        <div className="dash-stack">
                            {draft.milestones.map((milestone, index) => (
                                <div key={milestone.id} className="dash-milestone-edit">
                                    <div className="dash-milestone-edit__row">
                                        <div className="dash-milestone-edit__handle">
                                            <button
                                                type="button"
                                                onClick={() => moveMilestone(milestone.id, -1)}
                                                disabled={index === 0}
                                                title="Monter"
                                            >▲</button>
                                            <button
                                                type="button"
                                                onClick={() => moveMilestone(milestone.id, 1)}
                                                disabled={index === draft.milestones.length - 1}
                                                title="Descendre"
                                            >▼</button>
                                        </div>
                                        <span className="dash-milestone-edit__num">{String(index + 1).padStart(2, '0')}</span>
                                        <input
                                            type="text"
                                            className="dash-input dash-milestone-edit__label"
                                            value={milestone.label}
                                            placeholder="Nom de l'étape"
                                            onChange={(e) => updateMilestone(milestone.id, { label: e.target.value })}
                                        />
                                        <div className="dash-milestone-edit__status-toggle">
                                            {MILESTONE_STATUS_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`tone-${opt.value}${milestone.status === opt.value ? ' is-active' : ''}`}
                                                    onClick={() => updateMilestone(milestone.id, { status: opt.value })}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
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
                                        >×</button>
                                    </div>
                                </div>
                            ))}
                            <div className="dash-row" style={{ gap: 8, marginTop: 4 }}>
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--ghost"
                                    style={{ height: 40, fontSize: 12, padding: '0 16px' }}
                                    onClick={addMilestone}
                                >
                                    + Étape
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

                {isAdmin ? (
                    <form onSubmit={onPublishUpdate} className="dash-card dash-stack" noValidate>
                        <h2 className="dash-h2">Publier une update client</h2>
                        <div>
                            <label htmlFor="update-title" className="dash-label">Titre</label>
                            <input
                                id="update-title"
                                className="dash-input"
                                value={updateTitle}
                                onChange={(event) => setUpdateTitle(event.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="update-body" className="dash-label">Contenu</label>
                            <textarea
                                id="update-body"
                                className="dash-input dash-textarea"
                                value={updateBody}
                                onChange={(event) => setUpdateBody(event.target.value)}
                            />
                        </div>
                        <button type="submit" className="dash-btn" disabled={publishingUpdate}>
                            {publishingUpdate ? 'Publication...' : 'Publier la nouvelle'}
                        </button>
                        {updateError && <div className="login__error">{updateError}</div>}
                    </form>
                ) : (
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
                )}
            </section>

            {isAdmin && projectUpdates.length > 0 && (
                <section className="dash-card">
                    <h2 className="dash-h2">Historique des updates</h2>
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
                </section>
            )}

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

            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Factures du projet</h2>
                    <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Toutes →
                    </Link>
                </div>
                {projectInvoices.length === 0 ? (
                    <EmptyState title="Aucune facture" body="Les factures liées s'afficheront ici." />
                ) : (
                    <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Émise</th>
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
        </div>
    )
}
