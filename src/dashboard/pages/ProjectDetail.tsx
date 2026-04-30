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

const PHASE_OPTIONS: { value: ProjectStatus; label: string; tone: 'mute' | 'klein' | 'tomato' | 'ink' }[] = [
    { value: 'discovery', label: 'Cadrage', tone: 'mute' },
    { value: 'design', label: 'Design', tone: 'klein' },
    { value: 'build', label: 'Développement', tone: 'klein' },
    { value: 'review', label: 'Revue', tone: 'tomato' },
    { value: 'live', label: 'En ligne', tone: 'ink' },
    { value: 'paused', label: 'En pause', tone: 'mute' },
]

type EditableProject = {
    status: ProjectStatus
    kickoff: string
    delivery: string
    summary: string
    milestones: Milestone[]
}

function projectToDraft(p: {
    status: ProjectStatus; kickoff: string; delivery: string; summary?: string; milestones: Milestone[]
}): EditableProject {
    return { status: p.status, kickoff: p.kickoff, delivery: p.delivery, summary: p.summary ?? '', milestones: p.milestones }
}

function projectsAreEqual(a: EditableProject, b: EditableProject): boolean {
    if (a.status !== b.status || a.kickoff !== b.kickoff || a.delivery !== b.delivery || a.summary !== b.summary || a.milestones.length !== b.milestones.length) return false
    for (let i = 0; i < a.milestones.length; i++) {
        const l = a.milestones[i]; const r = b.milestones[i]
        if (l.id !== r.id || l.label !== r.label || l.status !== r.status || (l.date ?? '') !== (r.date ?? '')) return false
    }
    return true
}

function computeProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0
    const done = milestones.filter((m) => m.status === 'done').length
    const current = milestones.filter((m) => m.status === 'current').length
    return Math.max(0, Math.min(100, Math.round(((done + (current > 0 ? 0.5 : 0)) / milestones.length) * 100)))
}

function activeMilestone(milestones: Milestone[]) {
    return milestones.find((m) => m.status === 'current') ?? milestones.find((m) => m.status === 'upcoming') ?? milestones[milestones.length - 1]
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { loading, findProject, findClient, updatesForProject, tickets, invoicesForProject } = useDashboardData()
    const project = findProject(id)
    const client = project ? findClient(project.clientId) : undefined
    const isAdmin = user?.role === 'admin'

    const baseline = useMemo<EditableProject | null>(() => project ? projectToDraft(project) : null, [project])
    const [draft, setDraft] = useState<EditableProject | null>(baseline)
    const [updateBody, setUpdateBody] = useState('')
    const [updateMilestoneId, setUpdateMilestoneId] = useState('')
    const [publishingUpdate, setPublishingUpdate] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)
    const [updateSuccess, setUpdateSuccess] = useState(false)

    useEffect(() => { if (baseline) setDraft(baseline) }, [baseline])

    const { state: saveState, errorMessage: saveError, adopt: adoptDraft } = useAutoSave<EditableProject | null>({
        value: draft,
        enabled: Boolean(isAdmin && project && draft),
        isEqual: (a, b) => { if (!a || !b) return a === b; return projectsAreEqual(a, b) },
        onSave: async (next) => {
            if (!project || !next) return
            await updateProject(project.id, {
                status: next.status, progress: computeProgress(next.milestones),
                kickoff: next.kickoff, delivery: next.delivery, summary: next.summary, milestones: next.milestones,
            })
        },
    })

    useEffect(() => { if (baseline) adoptDraft(baseline) }, [adoptDraft, baseline, project?.updatedAt])

    useEffect(() => {
        if (!draft) return
        const active = activeMilestone(draft.milestones)
        if (!active) { if (updateMilestoneId) setUpdateMilestoneId(''); return }
        if (!draft.milestones.some((m) => m.id === updateMilestoneId)) setUpdateMilestoneId(active.id)
    }, [draft, updateMilestoneId])

    if (loading && !project) {
        return <div className="dash-card"><span className="dash-kicker">Projet</span><h1 className="dash-h2">Chargement…</h1></div>
    }

    if (!project || !draft) {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <h1 className="dash-h1">Projet introuvable.</h1>
                    <Link to="/projects" className="dash-btn" style={{ alignSelf: 'flex-start', marginTop: 8 }}>← Retour aux projets</Link>
                </header>
            </div>
        )
    }

    const projectTickets = tickets.filter((t) => t.projectId === project.id)
    const projectInvoices = invoicesForProject(project.id)
    const projectUpdates = updatesForProject(project.id)
    const progress = computeProgress(draft.milestones)
    const currentPhase = PHASE_OPTIONS.find((o) => o.value === draft.status)
    const currentStep = activeMilestone(draft.milestones)

    const patch = (p: Partial<EditableProject>) => setDraft((prev) => prev ? { ...prev, ...p } : prev)
    const patchMilestones = (next: Milestone[]) => setDraft((prev) => prev ? { ...prev, milestones: next } : prev)

    const addMilestone = () => patchMilestones([
        ...draft.milestones,
        { id: `m-${Date.now()}`, label: '', status: draft.milestones.length === 0 ? 'current' : 'upcoming' },
    ])

    const removeMilestone = (mid: string) => {
        const next = draft.milestones.filter((m) => m.id !== mid)
        patchMilestones(next)
        if (updateMilestoneId === mid) setUpdateMilestoneId(activeMilestone(next)?.id ?? '')
    }

    const updateMilestoneField = (mid: string, p: Partial<Milestone>) =>
        patchMilestones(draft.milestones.map((m) => m.id === mid ? { ...m, ...p } : m))

    const setMilestoneStatus = (mid: string, status: Milestone['status']) =>
        patchMilestones(draft.milestones.map((m) => {
            if (m.id === mid) return { ...m, status }
            if (status === 'current' && m.status === 'current') return { ...m, status: 'upcoming' as Milestone['status'] }
            return m
        }))

    const onPublishUpdate = async (event: FormEvent) => {
        event.preventDefault()
        setUpdateError(null)
        setUpdateSuccess(false)
        if (!updateBody.trim()) { setUpdateError('Écris le message à envoyer au client.'); return }

        const selectedMilestone = draft.milestones.find((m) => m.id === updateMilestoneId)
        const title = selectedMilestone?.label ? `Point — ${selectedMilestone.label}` : `Point projet — ${project.name}`

        setPublishingUpdate(true)
        try {
            await createProjectUpdate({
                clientId: project.clientId, projectId: project.id, title,
                body: updateBody, authorName: user?.name ?? 'Undefined',
                milestoneId: selectedMilestone?.id, milestoneLabel: selectedMilestone?.label,
            })
            const contactEmail = client?.contactEmail
            if (contactEmail) {
                await mailApi.projectStatus({
                    to: contactEmail, contactName: client?.contactName ?? '', clientName: client?.name ?? '',
                    projectName: project.name, projectId: project.id, newStatus: draft.status,
                    progress, isUpdate: true, updateTitle: title, updateBody,
                })
            }
            setUpdateBody('')
            setUpdateSuccess(true)
            setTimeout(() => setUpdateSuccess(false), 4000)
        } catch (err) {
            setUpdateError(err instanceof Error ? err.message : 'Publication impossible.')
        } finally {
            setPublishingUpdate(false)
        }
    }

    // ─── ADMIN VIEW ───────────────────────────────────────────────────────────
    if (isAdmin) {
        return (
            <div className="dash-stack-lg">
                {/* Header */}
                <header className="dash-page-head">
                    <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                        ← Projets
                    </Link>
                    <div className="dash-row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                        {client && (
                            <Link to={`/clients/${client.id}`} className="dash-kicker" style={{ textDecoration: 'underline' }}>
                                {client.name}
                            </Link>
                        )}
                        <span className="dash-kicker">›</span>
                        <span className="dash-kicker">{project.name}</span>
                    </div>
                    <div className="dash-row-between" style={{ alignItems: 'flex-start', marginTop: 6 }}>
                        <h1 className="dash-h1">{project.name}</h1>
                        <SaveIndicator state={saveState} errorMessage={saveError} />
                    </div>
                    {project.tagline && <p className="dash-sub">{project.tagline}</p>}
                </header>

                {/* Gestion : phase + dates + note + étapes — tout en un */}
                <section className="dash-edit">
                    <div className="dash-edit__head" style={{ marginBottom: 20 }}>
                        <h2 className="dash-h2">Pilotage</h2>
                        <div className="dash-row" style={{ gap: 8, alignItems: 'center' }}>
                            <span className="dash-kicker">{progress}% avancement</span>
                        </div>
                    </div>

                    {/* Phase */}
                    <div className="dash-stack-sm">
                        <span className="dash-label">Phase</span>
                        <div className="dash-status-picker">
                            {PHASE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => patch({ status: opt.value })}
                                    className={`dash-status-pick tone-${opt.tone}${draft.status === opt.value ? ' is-active' : ''}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="dash-grid dash-grid--2">
                        <div className="dash-stack-sm">
                            <span className="dash-label">Départ</span>
                            <input type="date" className="dash-input" value={draft.kickoff}
                                onChange={(e) => patch({ kickoff: e.target.value })} />
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Livraison cible</span>
                            <input type="date" className="dash-input" value={draft.delivery}
                                onChange={(e) => patch({ delivery: e.target.value })} />
                        </div>
                    </div>

                    {/* Note interne */}
                    <div className="dash-stack-sm">
                        <span className="dash-label">Note interne</span>
                        <textarea
                            className="dash-inline-textarea"
                            value={draft.summary}
                            onChange={(e) => patch({ summary: e.target.value })}
                            placeholder="Mémo interne — non visible par le client."
                        />
                    </div>

                    {/* Séparateur étapes */}
                    <div style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 20, marginTop: 4 }}>
                        <div className="dash-row-between" style={{ marginBottom: 12 }}>
                            <span className="dash-label" style={{ margin: 0 }}>Étapes du projet</span>
                            <button
                                type="button"
                                className="dash-btn dash-btn--ghost"
                                style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                onClick={addMilestone}
                            >
                                + Étape
                            </button>
                        </div>

                        {/* Barre de progression live */}
                        <div className="dash-row-between" style={{ marginBottom: 10 }}>
                            <span className="dash-kicker">Avancement calculé automatiquement</span>
                            <span className="dash-progress__value">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} color={project.accent} />

                        {/* Liste compacte des étapes */}
                        {draft.milestones.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 14, marginTop: 16 }}>
                                Ajoute une première étape pour structurer l'avancement.
                            </p>
                        ) : (
                            <div style={{ marginTop: 14 }}>
                                {draft.milestones.map((milestone, index) => (
                                    <div key={milestone.id} className="dash-milestone-edit">
                                        <div className="dash-milestone-edit__row">
                                            <span className="dash-milestone-edit__num">{String(index + 1).padStart(2, '0')}</span>
                                            <input
                                                className="dash-input dash-milestone-edit__label"
                                                value={milestone.label}
                                                onChange={(e) => updateMilestoneField(milestone.id, { label: e.target.value })}
                                                placeholder={`Étape ${index + 1}`}
                                            />
                                            <select
                                                className="dash-input dash-milestone-edit__status"
                                                value={milestone.status}
                                                onChange={(e) => setMilestoneStatus(milestone.id, e.target.value as Milestone['status'])}
                                            >
                                                <option value="upcoming">À faire</option>
                                                <option value="current">En cours</option>
                                                <option value="done">Fait</option>
                                            </select>
                                            <input
                                                type="date"
                                                className="dash-input dash-milestone-edit__date"
                                                value={milestone.date ?? ''}
                                                onChange={(e) => updateMilestoneField(milestone.id, { date: e.target.value || undefined })}
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
                            </div>
                        )}
                    </div>
                </section>

                {/* Update client */}
                <form onSubmit={onPublishUpdate} className="dash-edit" noValidate>
                    <div className="dash-edit__head">
                        <h2 className="dash-h2">Envoyer une update</h2>
                    </div>
                    <div className="dash-grid dash-grid--2">
                        <div className="dash-stack-sm">
                            <span className="dash-label">Étape concernée</span>
                            <select className="dash-input" value={updateMilestoneId}
                                onChange={(e) => setUpdateMilestoneId(e.target.value)}>
                                <option value="">Général</option>
                                {draft.milestones.map((m) => (
                                    <option key={m.id} value={m.id}>{m.label || `Étape`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="dash-stack-sm">
                        <span className="dash-label">Message au client</span>
                        <textarea
                            className="dash-input dash-textarea"
                            value={updateBody}
                            onChange={(e) => setUpdateBody(e.target.value)}
                            placeholder="Ce qui a été fait, ce qui arrive ensuite, ce que le client doit savoir."
                        />
                    </div>
                    <div className="dash-row" style={{ gap: 12, alignItems: 'center' }}>
                        <button type="submit" className="dash-btn" disabled={publishingUpdate}>
                            {publishingUpdate ? 'Envoi…' : 'Publier'}
                        </button>
                        {updateSuccess && <span className="dash-kicker" style={{ color: 'var(--color-ink)' }}>Update envoyée ✓</span>}
                    </div>
                    {updateError && <div className="login__error">{updateError}</div>}
                </form>

                {/* Historique des updates */}
                {projectUpdates.length > 0 && (
                    <section className="dash-card">
                        <h2 className="dash-h2" style={{ marginBottom: 8 }}>Historique</h2>
                        {projectUpdates.map((update) => (
                            <article key={update.id} className="dash-update">
                                <div className="dash-update__head">
                                    <div>
                                        <h3 className="dash-update__title">{update.title}</h3>
                                        {update.milestoneLabel && (
                                            <span className="dash-pill dash-pill--mute" style={{ marginTop: 6 }}>
                                                {update.milestoneLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span className="dash-update__meta">{formatDate(update.date)} · {update.authorName}</span>
                                </div>
                                <p className="dash-update__body">{update.body}</p>
                            </article>
                        ))}
                    </section>
                )}

                {/* Tickets + Factures côte à côte */}
                <div className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <section className="dash-card">
                        <div className="dash-row-between" style={{ marginBottom: 4 }}>
                            <h2 className="dash-h2" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>Tickets</h2>
                            <span className="dash-kicker">{projectTickets.length} ticket{projectTickets.length !== 1 ? 's' : ''}</span>
                        </div>
                        {projectTickets.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 14 }}>Aucun ticket sur ce projet.</p>
                        ) : (
                            projectTickets.map((ticket) => (
                                <div key={ticket.id} className="dash-row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)' }}>
                                    <span style={{ fontSize: 14, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {ticket.subject}
                                    </span>
                                    <TicketStatusPill status={ticket.status} />
                                </div>
                            ))
                        )}
                    </section>

                    <section className="dash-card">
                        <div className="dash-row-between" style={{ marginBottom: 4 }}>
                            <h2 className="dash-h2" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>Factures</h2>
                            <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none' }}>Voir tout →</Link>
                        </div>
                        {projectInvoices.length === 0 ? (
                            <p className="dash-sub" style={{ fontSize: 14 }}>Aucune facture liée.</p>
                        ) : (
                            projectInvoices.map((invoice) => (
                                <Link key={invoice.id} to={`/invoices/${invoice.id}`}
                                    className="dash-row-between"
                                    style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)', textDecoration: 'none', color: 'inherit' }}>
                                    <div>
                                        <span className="dash-kicker">{invoice.number}</span>
                                        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{formatEur(invoice.amount)}</p>
                                    </div>
                                    <InvoiceStatusPill status={invoice.status} />
                                </Link>
                            ))
                        )}
                    </section>
                </div>
            </div>
        )
    }

    // ─── CLIENT VIEW ──────────────────────────────────────────────────────────
    const openTickets = projectTickets.filter((t) => t.status !== 'resolved')

    return (
        <div className="dash-stack-lg">
            {/* Header */}
            <header className="dash-page-head">
                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Projets
                </Link>
                <div className="dash-row" style={{ gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <ProjectStatusPill status={project.status} />
                    <span className="dash-kicker">Livraison · {formatDate(project.delivery)}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>{project.name}</h1>
                {project.tagline && <p className="dash-sub">{project.tagline}</p>}
            </header>

            {/* Progression hero */}
            <section className="dash-card dash-card--pop" style={{ position: 'relative' }}>
                <span className="dash-card__accent" style={{ background: project.accent }} />
                <div className="dash-row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                    <div className="dash-stack-sm" style={{ flex: 1 }}>
                        <span className="dash-kicker">Phase actuelle</span>
                        <h2 className="dash-h2">{currentPhase?.label ?? 'En cours'}</h2>
                        <p className="dash-sub" style={{ fontSize: 15, margin: 0 }}>
                            {currentStep?.label
                                ? `En cours : ${currentStep.label}`
                                : 'Le projet démarre — les étapes arrivent bientôt.'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="dash-kicker">Avancement</span>
                        <div className="dash-h2" style={{ marginTop: 4, fontSize: 'clamp(24px, 4vw, 40px)' }}>{progress}%</div>
                    </div>
                </div>
                <div style={{ marginTop: 14 }}>
                    <ProgressBar value={progress} color={project.accent} />
                </div>
            </section>

            {/* Timeline étapes */}
            {project.milestones.length > 0 && (
                <section className="dash-card">
                    <h2 className="dash-h2" style={{ marginBottom: 16 }}>Étapes du projet</h2>
                    <ul className="dash-timeline">
                        {project.milestones.map((milestone) => (
                            <li key={milestone.id} className={`dash-milestone dash-milestone--${milestone.status}`}>
                                <span className="dash-milestone__marker" />
                                <span className="dash-milestone__line" />
                                <p className="dash-milestone__title">{milestone.label}</p>
                                {milestone.date && (
                                    <p className="dash-milestone__date">{formatDate(milestone.date)}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Dernières updates */}
            {projectUpdates.length > 0 && (
                <section className="dash-card">
                    <h2 className="dash-h2" style={{ marginBottom: 8 }}>Derniers points</h2>
                    {projectUpdates.slice(0, 3).map((update) => (
                        <article key={update.id} className="dash-update">
                            <div className="dash-update__head">
                                <h3 className="dash-update__title">{update.title}</h3>
                                <span className="dash-update__meta">{formatDate(update.date)}</span>
                            </div>
                            <p className="dash-update__body">{update.body}</p>
                        </article>
                    ))}
                </section>
            )}

            {/* Support + factures */}
            <div className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                <section className="dash-card">
                    <div className="dash-row-between">
                        <h2 className="dash-h2" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>Questions</h2>
                        <Link to="/tickets/new" className="dash-kicker" style={{ textDecoration: 'none' }}>
                            Nouveau →
                        </Link>
                    </div>
                    {openTickets.length === 0 ? (
                        <p className="dash-sub" style={{ fontSize: 14 }}>Aucune question ouverte.</p>
                    ) : (
                        openTickets.map((ticket) => (
                            <div key={ticket.id} className="dash-row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)' }}>
                                <span style={{ fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {ticket.subject}
                                </span>
                                <TicketStatusPill status={ticket.status} />
                            </div>
                        ))
                    )}
                </section>

                {projectInvoices.length > 0 && (
                    <section className="dash-card">
                        <h2 className="dash-h2" style={{ fontSize: 'clamp(16px, 2vw, 22px)', marginBottom: 4 }}>Factures</h2>
                        {projectInvoices.map((invoice) => (
                            <div key={invoice.id} className="dash-row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-hair)' }}>
                                <div>
                                    <span className="dash-kicker">{invoice.number}</span>
                                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{formatEur(invoice.amount)}</p>
                                </div>
                                <InvoiceStatusPill status={invoice.status} />
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}
