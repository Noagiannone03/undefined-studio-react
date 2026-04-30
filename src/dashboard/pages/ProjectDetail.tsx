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

const PROJECT_PHASE_OPTIONS: { value: ProjectStatus; label: string; tone: 'mute' | 'klein' | 'tomato' | 'ink' }[] = [
    { value: 'discovery', label: 'Cadrage', tone: 'mute' },
    { value: 'design', label: 'Design', tone: 'klein' },
    { value: 'build', label: 'Dev', tone: 'klein' },
    { value: 'review', label: 'Revue', tone: 'tomato' },
    { value: 'live', label: 'En ligne', tone: 'ink' },
    { value: 'paused', label: 'En pause', tone: 'mute' },
]

const STEP_STATUS_OPTIONS: { value: Milestone['status']; label: string; className: string }[] = [
    { value: 'upcoming', label: 'À faire', className: 'dash-pill dash-pill--mute' },
    { value: 'current', label: 'En cours', className: 'dash-pill dash-pill--klein' },
    { value: 'done', label: 'Fait', className: 'dash-pill dash-pill--ink' },
]

type EditableProject = {
    status: ProjectStatus
    kickoff: string
    delivery: string
    summary: string
    milestones: Milestone[]
}

function projectToDraft(project: {
    status: ProjectStatus
    kickoff: string
    delivery: string
    summary?: string
    milestones: Milestone[]
}): EditableProject {
    return {
        status: project.status,
        kickoff: project.kickoff,
        delivery: project.delivery,
        summary: project.summary ?? '',
        milestones: project.milestones,
    }
}

function projectsAreEqual(a: EditableProject, b: EditableProject): boolean {
    if (
        a.status !== b.status ||
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

function computeProjectProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0

    const doneCount = milestones.filter((item) => item.status === 'done').length
    const currentCount = milestones.filter((item) => item.status === 'current').length
    const raw = ((doneCount + (currentCount > 0 ? 0.5 : 0)) / milestones.length) * 100

    return Math.max(0, Math.min(100, Math.round(raw)))
}

function currentMilestone(milestones: Milestone[]) {
    return milestones.find((item) => item.status === 'current')
        ?? milestones.find((item) => item.status === 'upcoming')
        ?? milestones[milestones.length - 1]
}

function stepPill(status: Milestone['status']) {
    const option = STEP_STATUS_OPTIONS.find((item) => item.value === status)
    if (!option) return null
    return <span className={option.className}>{option.label}</span>
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { loading, findProject, findClient, updatesForProject, tickets, invoicesForProject } = useDashboardData()
    const project = findProject(id)
    const client = project ? findClient(project.clientId) : undefined
    const isAdmin = user?.role === 'admin'

    const baseline = useMemo<EditableProject | null>(() => {
        if (!project) return null
        return projectToDraft(project)
    }, [project])

    const [draft, setDraft] = useState<EditableProject | null>(baseline)
    const [updateBody, setUpdateBody] = useState('')
    const [updateMilestoneId, setUpdateMilestoneId] = useState('')
    const [publishingUpdate, setPublishingUpdate] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)

    useEffect(() => {
        if (baseline) setDraft(baseline)
    }, [baseline])

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
                progress: computeProjectProgress(next.milestones),
                kickoff: next.kickoff,
                delivery: next.delivery,
                summary: next.summary,
                milestones: next.milestones,
            })
        },
    })

    useEffect(() => {
        if (baseline) adoptDraft(baseline)
    }, [adoptDraft, baseline, project?.updatedAt])

    useEffect(() => {
        if (!draft) return

        const current = currentMilestone(draft.milestones)
        if (!current) {
            if (updateMilestoneId) setUpdateMilestoneId('')
            return
        }

        const exists = draft.milestones.some((item) => item.id === updateMilestoneId)
        if (!exists) setUpdateMilestoneId(current.id)
    }, [draft, updateMilestoneId])

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
    const progress = computeProjectProgress(draft.milestones)
    const activeMilestone = currentMilestone(draft.milestones)
    const activePhase = PROJECT_PHASE_OPTIONS.find((item) => item.value === draft.status)

    const patchDraft = (patch: Partial<EditableProject>) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
    }

    const patchMilestones = (next: Milestone[]) => {
        setDraft((prev) => (prev ? { ...prev, milestones: next } : prev))
    }

    const addMilestone = () => {
        patchMilestones([
            ...draft.milestones,
            {
                id: `m-${Date.now()}`,
                label: `Étape ${draft.milestones.length + 1}`,
                status: draft.milestones.length === 0 ? 'current' : 'upcoming',
            },
        ])
    }

    const removeMilestone = (mid: string) => {
        const next = draft.milestones.filter((item) => item.id !== mid)
        patchMilestones(next)
        if (updateMilestoneId === mid) {
            setUpdateMilestoneId(currentMilestone(next)?.id ?? '')
        }
    }

    const updateMilestone = (mid: string, patch: Partial<Milestone>) => {
        patchMilestones(draft.milestones.map((item) => (item.id === mid ? { ...item, ...patch } : item)))
    }

    const setMilestoneStatus = (mid: string, status: Milestone['status']) => {
        patchMilestones(
            draft.milestones.map((item) => {
                if (item.id === mid) return { ...item, status }
                if (status === 'current' && item.status === 'current') return { ...item, status: 'upcoming' }
                return item
            }),
        )
    }

    const onPublishUpdate = async (event: FormEvent) => {
        event.preventDefault()
        setUpdateError(null)

        if (!updateBody.trim()) {
            setUpdateError('Écris d’abord le message client.')
            return
        }

        const selectedMilestone = draft.milestones.find((item) => item.id === updateMilestoneId)
        const generatedTitle = selectedMilestone?.label
            ? `Point projet — ${selectedMilestone.label}`
            : `Point projet — ${project.name}`

        setPublishingUpdate(true)
        try {
            await createProjectUpdate({
                clientId: project.clientId,
                projectId: project.id,
                title: generatedTitle,
                body: updateBody,
                authorName: user?.name ?? 'Undefined',
                milestoneId: selectedMilestone?.id,
                milestoneLabel: selectedMilestone?.label,
            })

            const contactEmail = client?.contactEmail
            if (contactEmail) {
                await mailApi.projectStatus({
                    to: contactEmail,
                    contactName: client?.contactName ?? '',
                    clientName: client?.name ?? '',
                    projectName: project.name,
                    projectId: project.id,
                    newStatus: draft.status,
                    progress,
                    isUpdate: true,
                    updateTitle: generatedTitle,
                    updateBody,
                })
            }

            setUpdateBody('')
        } catch (err) {
            setUpdateError(err instanceof Error ? err.message : 'Publication impossible.')
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
                <div className="dash-row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
                    <ProjectStatusPill status={draft.status} />
                    <span className="dash-kicker">{client?.name ?? 'Client'} · Livraison {formatDate(draft.delivery)}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>{project.name}</h1>
                <p className="dash-sub">{project.tagline}</p>
            </header>

            <section className="dash-card dash-card--pop" style={{ position: 'relative' }}>
                <span className="dash-card__accent" style={{ background: project.accent }} />
                <div className="dash-row-between" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <div className="dash-stack-sm" style={{ flex: 1 }}>
                        <span className="dash-kicker">Phase actuelle</span>
                        <h2 className="dash-h2" style={{ margin: 0 }}>
                            {activePhase?.label ?? 'Projet'}
                        </h2>
                        <p className="dash-sub" style={{ margin: 0 }}>
                            {activeMilestone?.label
                                ? `Étape en cours : ${activeMilestone.label}`
                                : 'Ajoute la première étape pour structurer le projet.'}
                        </p>
                    </div>
                    <div style={{ minWidth: 110, textAlign: 'right' }}>
                        <span className="dash-kicker">Avancement</span>
                        <div className="dash-h2" style={{ marginTop: 4 }}>{progress}%</div>
                    </div>
                </div>
                <div style={{ marginTop: 14 }}>
                    <ProgressBar value={progress} color={project.accent} />
                </div>
            </section>

            {isAdmin && (
                <section className="dash-edit">
                    <div className="dash-edit__head">
                        <h2 className="dash-h2">Pilotage simple</h2>
                        <SaveIndicator state={saveState} errorMessage={saveError} />
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Phase du projet</span>
                        <div className="dash-status-picker">
                            {PROJECT_PHASE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => patchDraft({ status: option.value })}
                                    className={`dash-status-pick tone-${option.tone}${draft.status === option.value ? ' is-active' : ''}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Note interne studio</span>
                        <textarea
                            className="dash-inline-textarea"
                            value={draft.summary}
                            onChange={(event) => patchDraft({ summary: event.target.value })}
                            placeholder="Note interne pour toi et l’équipe. Non envoyée automatiquement au client."
                        />
                    </div>

                    <div className="dash-grid dash-grid--2">
                        <div className="dash-stack-sm">
                            <span className="dash-label">Date de départ</span>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.kickoff}
                                onChange={(event) => patchDraft({ kickoff: event.target.value })}
                            />
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Date cible</span>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.delivery}
                                onChange={(event) => patchDraft({ delivery: event.target.value })}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section className={isAdmin ? 'dash-edit' : 'dash-card'}>
                <div className="dash-edit__head">
                    <h2 className="dash-h2">Étapes du projet</h2>
                    {isAdmin && (
                        <button
                            type="button"
                            className="dash-btn dash-btn--ghost"
                            style={{ height: 38, fontSize: 12, padding: '0 16px' }}
                            onClick={addMilestone}
                        >
                            + Étape
                        </button>
                    )}
                </div>

                {(isAdmin ? draft.milestones : project.milestones).length === 0 ? (
                    <EmptyState title="Aucune étape" body="Ajoute la première étape pour clarifier le déroulé du projet." />
                ) : (
                    <div className="dash-stack">
                        {(isAdmin ? draft.milestones : project.milestones).map((milestone, index) => (
                            <div key={milestone.id} className="dash-card" style={{ padding: 16 }}>
                                {isAdmin ? (
                                    <div className="dash-stack-sm">
                                        <div className="dash-row-between" style={{ alignItems: 'center', gap: 10 }}>
                                            <div className="dash-row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                                                <span className="dash-pill">{String(index + 1).padStart(2, '0')}</span>
                                                <input
                                                    className="dash-input"
                                                    style={{ flex: 1 }}
                                                    value={milestone.label}
                                                    onChange={(event) => updateMilestone(milestone.id, { label: event.target.value })}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="dash-milestone-edit__remove"
                                                title="Supprimer l'étape"
                                                onClick={() => removeMilestone(milestone.id)}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="dash-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                                            {STEP_STATUS_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={milestone.status === option.value ? option.className : 'dash-pill dash-pill--mute'}
                                                    style={{
                                                        opacity: milestone.status === option.value ? 1 : 0.65,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => setMilestoneStatus(milestone.id, option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="dash-stack-sm" style={{ maxWidth: 220 }}>
                                            <span className="dash-label">Date cible</span>
                                            <input
                                                type="date"
                                                className="dash-input"
                                                value={milestone.date ?? ''}
                                                onChange={(event) => updateMilestone(milestone.id, { date: event.target.value || undefined })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="dash-stack-sm">
                                        <div className="dash-row-between" style={{ gap: 12, alignItems: 'center' }}>
                                            <div>
                                                <span className="dash-kicker">Étape {String(index + 1).padStart(2, '0')}</span>
                                                <h3 className="dash-h2" style={{ marginTop: 6 }}>{milestone.label}</h3>
                                            </div>
                                            {stepPill(milestone.status)}
                                        </div>
                                        {milestone.date && (
                                            <p className="dash-sub" style={{ margin: 0 }}>
                                                Cible : {formatDate(milestone.date)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {isAdmin ? (
                <form onSubmit={onPublishUpdate} className="dash-edit" noValidate>
                    <div className="dash-edit__head">
                        <h2 className="dash-h2">Update client</h2>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Étape concernée</span>
                        <select
                            className="dash-input"
                            value={updateMilestoneId}
                            onChange={(event) => setUpdateMilestoneId(event.target.value)}
                        >
                            <option value="">Sans étape précise</option>
                            {draft.milestones.map((milestone) => (
                                <option key={milestone.id} value={milestone.id}>
                                    {milestone.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">Message envoyé au client</span>
                        <textarea
                            className="dash-input dash-textarea"
                            value={updateBody}
                            onChange={(event) => setUpdateBody(event.target.value)}
                            placeholder="Explique simplement ce qui a été fait, ce qui arrive ensuite, ou ce que le client doit savoir."
                        />
                    </div>

                    <button type="submit" className="dash-btn" disabled={publishingUpdate}>
                        {publishingUpdate ? 'Envoi…' : 'Publier l’update'}
                    </button>
                    {updateError && <div className="login__error">{updateError}</div>}
                </form>
            ) : null}

            <section className="dash-card">
                <h2 className="dash-h2">Updates client</h2>
                {projectUpdates.length === 0 ? (
                    <p className="dash-sub">Aucune update envoyée pour l’instant.</p>
                ) : (
                    <div>
                        {projectUpdates.map((update) => (
                            <article key={update.id} className="dash-update">
                                <div className="dash-update__head">
                                    <div>
                                        <h3 className="dash-update__title">{update.title}</h3>
                                        {update.milestoneLabel && (
                                            <div style={{ marginTop: 6 }}>
                                                <span className="dash-pill dash-pill--mute">{update.milestoneLabel}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="dash-update__meta">
                                        {formatDate(update.date)} · {update.authorName}
                                    </span>
                                </div>
                                <p className="dash-update__body">{update.body}</p>
                            </article>
                        ))}
                    </div>
                )}
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
                    <EmptyState title="Pas de ticket" body="Ouvre un ticket si tu as besoin d’aide sur ce projet." />
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
