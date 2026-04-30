import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
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
    const ratio = (done + current * 0.5) / milestones.length
    return Math.max(0, Math.min(100, Math.round(ratio * 100)))
}

const MILESTONE_CYCLE: Record<Milestone['status'], Milestone['status']> = {
    upcoming: 'current',
    current: 'done',
    done: 'upcoming',
}

const MILESTONE_LABEL: Record<Milestone['status'], string> = {
    upcoming: 'À faire',
    current: 'En cours',
    done: 'Fait',
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
        const doneCount = draft.milestones.filter((m) => m.status === 'done').length
        const totalCount = draft.milestones.length

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

                <section className="dash-project-detail-summary">
                    <div className="dash-card dash-project-detail-summary__main">
                        <span className="dash-card__accent" style={{ background: project.accent }} />
                        <div className="dash-row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                            <div>
                                <span className="dash-kicker">État du projet</span>
                                <h2 className="dash-h2">{currentStep?.label ?? 'Étape à définir'}</h2>
                            </div>
                            <ProjectStatusPill status={draft.status} />
                        </div>
                        <div className="dash-stack-sm">
                            <div className="dash-row-between">
                                <span className="dash-kicker">{doneCount}/{totalCount || 0} étapes faites</span>
                                <strong className="dash-progress__value">{progress}%</strong>
                            </div>
                            <ProgressBar value={progress} color={project.accent} />
                        </div>
                    </div>
                    <div className="dash-card dash-project-detail-summary__stats">
                        <div><span className="dash-kicker">Phase</span><strong>{currentPhase?.label ?? '—'}</strong></div>
                        <div><span className="dash-kicker">Départ</span><strong>{formatDate(draft.kickoff)}</strong></div>
                        <div><span className="dash-kicker">Livraison</span><strong>{formatDate(draft.delivery)}</strong></div>
                    </div>
                </section>

                <div className="dash-overview-layout">
                    {/* COLONNE GAUCHE (MAIN) */}
                    <div className="dash-overview-main">
                        {/* ÉTAPES — focal point */}
                        <section className="dash-edit">
                            <div className="dash-edit__head">
                                <div>
                                    <h2 className="dash-h2">Étapes</h2>
                                    <p className="dash-sub" style={{ fontSize: 13, margin: '2px 0 0' }}>
                                        Clique sur le statut pour cycler : à faire → en cours → faite.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--ghost"
                                    style={{ height: 36, fontSize: 12, padding: '0 16px' }}
                                    onClick={addMilestone}
                                >
                                    + Ajouter
                                </button>
                            </div>

                            {draft.milestones.length === 0 ? (
                                <p className="dash-sub" style={{ fontSize: 14 }}>
                                    Ajoute une première étape pour structurer l’avancement.
                                </p>
                            ) : (
                                <div className="dash-step-list">
                                    {draft.milestones.map((milestone, index) => (
                                        <div key={milestone.id} className={`dash-step dash-step--${milestone.status}`}>
                                            <span className="dash-step__num">{String(index + 1).padStart(2, '0')}</span>
                                            <input
                                                className="dash-step__label"
                                                value={milestone.label}
                                                onChange={(e) => updateMilestoneField(milestone.id, { label: e.target.value })}
                                                placeholder={`Étape ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className={`dash-step__status dash-step__status--${milestone.status}`}
                                                onClick={() => setMilestoneStatus(milestone.id, MILESTONE_CYCLE[milestone.status])}
                                                title="Cycler le statut"
                                            >
                                                {MILESTONE_LABEL[milestone.status]}
                                            </button>
                                            <input
                                                type="date"
                                                className="dash-step__date"
                                                value={milestone.date ?? ''}
                                                onChange={(e) => updateMilestoneField(milestone.id, { date: e.target.value || undefined })}
                                            />
                                            <button
                                                type="button"
                                                className="dash-step__remove"
                                                title="Supprimer"
                                                onClick={() => removeMilestone(milestone.id)}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* UPDATE CLIENT */}
                        <form onSubmit={onPublishUpdate} className="dash-card dash-card--pop" noValidate>
                            <div className="dash-row-between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h2 className="dash-h2">Envoyer un point au client</h2>
                                    <p className="dash-sub" style={{ fontSize: 13, margin: '2px 0 0' }}>
                                        Le client reçoit le message par email et le retrouve dans son espace.
                                    </p>
                                </div>
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Étape concernée</span>
                                <select className="dash-input" value={updateMilestoneId}
                                    onChange={(e) => setUpdateMilestoneId(e.target.value)}>
                                    <option value="">Général</option>
                                    {draft.milestones.map((m) => (
                                        <option key={m.id} value={m.id}>{m.label || 'Étape'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="dash-stack-sm" style={{ marginTop: 12 }}>
                                <span className="dash-label">Message</span>
                                <textarea
                                    className="dash-input dash-textarea"
                                    value={updateBody}
                                    onChange={(e) => setUpdateBody(e.target.value)}
                                    placeholder="Ce qui a été fait, ce qui arrive ensuite, ce que le client doit savoir."
                                />
                            </div>
                            <div className="dash-row" style={{ gap: 12, alignItems: 'center', marginTop: 16 }}>
                                <button type="submit" className="dash-btn" disabled={publishingUpdate}>
                                    {publishingUpdate ? 'Envoi...' : 'Publier le point'}
                                </button>
                                {updateSuccess && <span className="dash-kicker" style={{ color: 'var(--color-ink)' }}>Envoyé</span>}
                            </div>
                            {updateError && <div className="login__error" style={{ marginTop: 8 }}>{updateError}</div>}
                        </form>

                        {/* HISTORIQUE */}
                        {projectUpdates.length > 0 && (
                            <section className="dash-card">
                                <h2 className="dash-h2" style={{ marginBottom: 8 }}>Historique des points</h2>
                                <div className="dash-stack-sm">
                                    {projectUpdates.map((update) => (
                                        <article key={update.id} className="dash-update dash-update--quiet">
                                            <div className="dash-update__head">
                                                <div>
                                                    <h3 className="dash-update__title" style={{ fontSize: 15 }}>{update.title}</h3>
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
                                </div>
                            </section>
                        )}
                        
                        {/* TICKETS + FACTURES GRID (Admin) */}
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

                    {/* COLONNE DROITE (SIDEBAR) */}
                    <div className="dash-overview-side">
                        {/* RÉGLAGES — phase + dates + note */}
                        <section className="dash-card">
                            <div className="dash-row-between" style={{ marginBottom: 12 }}>
                                <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Réglages</h2>
                            </div>

                            <div className="dash-stack-sm">
                                <span className="dash-label">Phase du projet</span>
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

                            <div className="dash-stack-sm" style={{ marginTop: 16 }}>
                                <span className="dash-label">Départ</span>
                                <input type="date" className="dash-input" value={draft.kickoff}
                                    onChange={(e) => patch({ kickoff: e.target.value })} style={{ height: 40, fontSize: 14 }} />
                            </div>
                            
                            <div className="dash-stack-sm" style={{ marginTop: 12 }}>
                                <span className="dash-label">Livraison cible</span>
                                <input type="date" className="dash-input" value={draft.delivery}
                                    onChange={(e) => patch({ delivery: e.target.value })} style={{ height: 40, fontSize: 14 }} />
                            </div>

                            <div className="dash-stack-sm" style={{ marginTop: 16 }}>
                                <span className="dash-label">Note interne (non visible client)</span>
                                <textarea
                                    className="dash-inline-textarea"
                                    value={draft.summary}
                                    onChange={(e) => patch({ summary: e.target.value })}
                                    placeholder="Mémo interne — non visible par le client."
                                    style={{ minHeight: 120 }}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )
    }

    // ─── CLIENT VIEW ──────────────────────────────────────────────────────────
    const openTickets = projectTickets.filter((t) => t.status !== 'resolved')
    const nextStep = draft.milestones.find((m) => m.status === 'upcoming')
    const doneCount = draft.milestones.filter((m) => m.status === 'done').length

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <Link to="/projects" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Projets
                </Link>
                <h1 className="dash-h1">{project.name}</h1>
                {project.tagline && <p className="dash-sub">{project.tagline}</p>}
            </header>

            <section className="dash-project-detail-summary">
                <div className="dash-card dash-project-detail-summary__main">
                    <span className="dash-card__accent" style={{ background: project.accent }} />
                    <div className="dash-row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                        <div>
                            <span className="dash-kicker">En ce moment</span>
                            <h2 className="dash-h2">{currentStep?.label ?? 'Étape à définir'}</h2>
                        </div>
                        <ProjectStatusPill status={project.status} />
                    </div>
                    <div className="dash-stack-sm">
                        <div className="dash-row-between">
                            <span className="dash-kicker">{doneCount}/{draft.milestones.length || 0} étapes faites</span>
                            <strong className="dash-progress__value">{progress}%</strong>
                        </div>
                        <ProgressBar value={progress} color={project.accent} />
                    </div>
                </div>
                <div className="dash-card dash-project-detail-summary__stats">
                    <div><span className="dash-kicker">Phase</span><strong>{currentPhase?.label ?? 'En cours'}</strong></div>
                    <div><span className="dash-kicker">Prochaine étape</span><strong>{nextStep?.label ?? '—'}</strong></div>
                    <div><span className="dash-kicker">Livraison</span><strong>{formatDate(project.delivery)}</strong></div>
                </div>
            </section>

            <div className="dash-overview-layout">
                {/* COLONNE GAUCHE (MAIN) */}
                <div className="dash-overview-main">
                    <div className="dash-card dash-project-section">
                        <div className="dash-row-between">
                            <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Étapes</h2>
                            <span className="dash-kicker">{doneCount}/{draft.milestones.length || 0}</span>
                        </div>
                        {project.milestones.length === 0 ? (
                            <p className="dash-note">Les étapes apparaîtront ici dès qu’elles sont planifiées.</p>
                        ) : (
                            <ul className="dash-timeline dash-timeline--compact">
                                {project.milestones.map((milestone) => (
                                    <li key={milestone.id} className={`dash-milestone dash-milestone--${milestone.status}`}>
                                        <span className="dash-milestone__marker" />
                                        <span className="dash-milestone__line" />
                                        <p className="dash-milestone__title">{milestone.label || 'Étape projet'}</p>
                                        <p className="dash-milestone__date">
                                            {milestone.date ? formatDate(milestone.date) : MILESTONE_LABEL[milestone.status]}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* TICKETS + FACTURES (Client) */}
                    <div className="dash-grid dash-grid--2" style={{ alignItems: 'start', marginTop: 16 }}>
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

                {/* COLONNE DROITE (SIDEBAR) */}
                <div className="dash-overview-side">
                    <div className="dash-card">
                        <div className="dash-stack-sm" style={{ gap: 16 }}>
                            <div>
                                <span className="dash-kicker">Phase actuelle</span>
                                <strong style={{ display: 'block', marginTop: 4, fontSize: 15 }}>{currentPhase?.label ?? 'En cours'}</strong>
                            </div>
                            <div style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 12 }}>
                                <span className="dash-kicker">En cours</span>
                                <strong style={{ display: 'block', marginTop: 4, fontSize: 15 }}>{currentStep?.label ?? 'À définir'}</strong>
                            </div>
                            <div style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 12 }}>
                                <span className="dash-kicker">Prochaine étape</span>
                                <strong style={{ display: 'block', marginTop: 4, fontSize: 15 }}>{nextStep?.label ?? '—'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="dash-card dash-project-section" style={{ marginTop: 16 }}>
                        <div className="dash-row-between">
                            <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Derniers points</h2>
                            <span className="dash-kicker">{projectUpdates.length}</span>
                        </div>
                        {projectUpdates.length === 0 ? (
                            <p className="dash-note">Aucun point partagé pour l’instant.</p>
                        ) : (
                            projectUpdates.slice(0, 4).map((update) => (
                                <article key={update.id} className="dash-update dash-update--quiet">
                                    <div className="dash-update__head">
                                        <h3 className="dash-update__title" style={{ fontSize: 15 }}>{update.title}</h3>
                                        <span className="dash-update__meta">{formatDate(update.date)}</span>
                                    </div>
                                    <p className="dash-update__body">{update.body}</p>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
