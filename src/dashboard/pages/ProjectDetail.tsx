import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { ProgressBar } from '../components/ProgressBar'
import { InvoiceStatusPill, ProjectStatusPill, TicketStatusPill } from '../components/StatusPill'
import { DashboardSkeleton, LoadingButton } from '../components/LoadingState'
import { SaveIndicator } from '../components/SaveIndicator'
import { useAutoSave } from '../components/useAutoSave'
import { useToast } from '../components/Toast'
import { createProjectUpdate, deleteProject, updateProject } from '../firestore'
import { mailApi } from '../api'
import { formatDate } from '../utils'
import { formatInvoiceEur } from '../invoice/format'
import { PROJECT_STATUS_OPTIONS, projectStatusLabel } from '../projectStatus'
import type { Milestone, ProjectStatus } from '../types'

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
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showSuccess, showError } = useToast()
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
    const [deleteBusy, setDeleteBusy] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

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
        return <DashboardSkeleton label="Chargement du projet" />
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
    const currentStep = activeMilestone(draft.milestones)
    const currentStatusLabel = projectStatusLabel(draft.status)

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
        if (!updateMilestoneId) { setUpdateError('Choisis l’étape concernée par ce point.'); return }
        if (!updateBody.trim()) { setUpdateError('Écris le message à envoyer au client.'); return }

        const selectedMilestone = draft.milestones.find((m) => m.id === updateMilestoneId)
        if (!selectedMilestone) { setUpdateError('Cette étape n’existe plus. Choisis une autre étape.'); return }
        const milestoneLabel = selectedMilestone.label || 'Étape projet'
        const title = `Point — ${milestoneLabel}`

        setPublishingUpdate(true)
        try {
            await createProjectUpdate({
                clientId: project.clientId, projectId: project.id, title,
                body: updateBody, authorName: user?.name ?? 'Undefined',
                milestoneId: selectedMilestone.id, milestoneLabel: milestoneLabel,
            })
            const contactEmail = client?.contactEmail
            if (contactEmail) {
                await mailApi.projectStatus({
                    to: contactEmail, contactName: client?.contactName ?? '', clientName: client?.name ?? '',
                    projectName: project.name, projectId: project.id, newStatus: draft.status,
                    progress, isUpdate: true, updateTitle: title, updateBody,
                })
                showSuccess('Point envoyé', `Email confirmé par Vercel pour ${contactEmail}.`)
            } else {
                showError('Point non envoyé par email', 'Aucun email contact configuré pour ce client. Le point reste publié dans l’espace.')
            }
            setUpdateBody('')
            setUpdateSuccess(true)
            setTimeout(() => setUpdateSuccess(false), 4000)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Publication impossible.'
            setUpdateError(message)
            showError('Point non envoyé', message)
        } finally {
            setPublishingUpdate(false)
        }
    }

    const onDeleteProject = async () => {
        const confirmed = window.confirm(
            `Supprimer définitivement ${project.name} ? Les points liés seront supprimés, les tickets et factures resteront dans le dossier client sans projet attaché.`,
        )
        if (!confirmed) return
        setDeleteError(null)
        setDeleteBusy(true)
        try {
            await deleteProject(project.id)
            navigate('/projects', { replace: true })
        } catch {
            setDeleteError('Suppression du projet impossible.')
            setDeleteBusy(false)
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

                <section className="dash-card" style={{ padding: '32px 40px', gap: 24, marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
                    <span className="dash-card__accent" style={{ background: project.accent, width: 8 }} />
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <div className="dash-row" style={{ gap: 12, marginBottom: 16 }}>
                                <ProjectStatusPill status={draft.status} />
                                <span className="dash-kicker" style={{ color: 'var(--color-ink-soft)' }}>Statut projet · {currentStatusLabel}</span>
                            </div>
                            <span className="dash-kicker">Étape en cours</span>
                            <h2 className="dash-h1" style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, marginTop: 4 }}>
                                {currentStep?.label ?? 'Étape à définir'}
                            </h2>
                        </div>

                        <div style={{ flex: '0 0 auto', display: 'flex', gap: 32, textAlign: 'right' }}>
                            <div>
                                <span className="dash-kicker">Livraison cible</span>
                                <strong style={{ display: 'block', fontSize: '24px', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>{formatDate(draft.delivery)}</strong>
                            </div>
                            <div style={{ borderLeft: '1px solid var(--color-hair)', paddingLeft: 32 }}>
                                <span className="dash-kicker">Avancement</span>
                                <strong style={{ display: 'block', fontSize: '48px', fontFamily: 'Archivo Black', lineHeight: 0.9, marginTop: 4 }}>{progress}%</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <div className="dash-row-between" style={{ marginBottom: 8 }}>
                            <span className="dash-kicker">{doneCount}/{totalCount || 0} étapes faites</span>
                        </div>
                        <ProgressBar value={progress} color={project.accent} />
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
                                        Les étapes décrivent ce qui se passe concrètement. Le statut du projet se règle à droite.
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
                                            <label className="dash-step__date-wrap">
                                                <span>Fin prévue</span>
                                                <input
                                                    type="date"
                                                    className="dash-step__date"
                                                    value={milestone.date ?? ''}
                                                    onChange={(e) => updateMilestoneField(milestone.id, { date: e.target.value || undefined })}
                                                />
                                            </label>
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
                                        Chaque point doit être rattaché à une étape. Il sera affiché sous cette étape côté client.
                                    </p>
                                </div>
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Étape concernée</span>
                                <select className="dash-input" value={updateMilestoneId}
                                    onChange={(e) => setUpdateMilestoneId(e.target.value)}>
                                    {draft.milestones.map((m) => (
                                        <option key={m.id} value={m.id}>{m.label || 'Étape sans titre'}</option>
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
                                <LoadingButton type="submit" className="dash-btn" loading={publishingUpdate} loadingLabel="Publication">
                                    Publier le point
                                </LoadingButton>
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
                                                <span className="dash-kicker">{invoice.title || 'Facture'}</span>
                                                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{formatInvoiceEur(invoice.amount)}</p>
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
                        {/* RÉGLAGES — statut + dates + note */}
                        <section className="dash-card">
                            <div className="dash-row-between" style={{ marginBottom: 12 }}>
                                <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Réglages</h2>
                            </div>

                            <div className="dash-stack-sm">
                                <span className="dash-label">Statut du projet</span>
                                <div className="dash-status-picker">
                                    {PROJECT_STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => patch({ status: opt.value })}
                                            className={`dash-status-pick tone-${opt.tone}${projectStatusLabel(draft.status) === opt.label ? ' is-active' : ''}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dash-stack-sm" style={{ marginTop: 16 }}>
                                <span className="dash-label">Date de démarrage</span>
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

                        <section className="dash-card" style={{ borderColor: 'var(--color-tomato)', marginTop: 16 }}>
                            <span className="dash-kicker" style={{ color: 'var(--color-tomato)' }}>Zone admin</span>
                            <h2 className="dash-h2" style={{ fontSize: 'clamp(18px, 2vw, 24px)', marginTop: 4 }}>Supprimer le projet</h2>
                            <p className="dash-note" style={{ marginTop: 6 }}>
                                Supprime le projet et ses points. Les tickets et factures restent conservés côté client.
                            </p>
                            <LoadingButton
                                type="button"
                                className="dash-btn"
                                loading={deleteBusy}
                                loadingLabel="Suppression"
                                style={{ marginTop: 14, background: 'var(--color-tomato)', borderColor: 'var(--color-tomato)' }}
                                onClick={onDeleteProject}
                            >
                                Supprimer le projet
                            </LoadingButton>
                            {deleteError && <div className="login__error" style={{ marginTop: 8 }}>{deleteError}</div>}
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

            <section className="dash-card" style={{ padding: '32px 40px', gap: 24, marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
                <span className="dash-card__accent" style={{ background: project.accent, width: 8 }} />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div className="dash-row" style={{ gap: 12, marginBottom: 16 }}>
                            <ProjectStatusPill status={project.status} />
                            <span className="dash-kicker" style={{ color: 'var(--color-ink-soft)' }}>Statut projet · {currentStatusLabel}</span>
                        </div>
                        <span className="dash-kicker">Étape en cours</span>
                        <h2 className="dash-h1" style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, marginTop: 4 }}>
                            {currentStep?.label ?? 'À définir'}
                        </h2>
                    </div>

                    <div style={{ flex: '0 0 auto', display: 'flex', gap: 32, textAlign: 'right' }}>
                        <div>
                            <span className="dash-kicker">Livraison cible</span>
                            <strong style={{ display: 'block', fontSize: '24px', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>{formatDate(project.delivery)}</strong>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--color-hair)', paddingLeft: 32 }}>
                            <span className="dash-kicker">Avancement</span>
                            <strong style={{ display: 'block', fontSize: '48px', fontFamily: 'Archivo Black', lineHeight: 0.9, marginTop: 4 }}>{progress}%</strong>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div className="dash-row-between" style={{ marginBottom: 8 }}>
                        <span className="dash-kicker">{doneCount}/{draft.milestones.length || 0} étapes faites</span>
                    </div>
                    <ProgressBar value={progress} color={project.accent} />
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
                                {project.milestones.map((milestone) => {
                                    const milestoneUpdates = projectUpdates.filter((update) =>
                                        update.milestoneId
                                            ? update.milestoneId === milestone.id
                                            : update.milestoneLabel === milestone.label,
                                    )
                                    return (
                                    <li key={milestone.id} className={`dash-milestone dash-milestone--${milestone.status}`}>
                                        <span className="dash-milestone__marker" />
                                        <span className="dash-milestone__line" />
                                        <p className="dash-milestone__title">{milestone.label || 'Étape projet'}</p>
                                        <p className="dash-milestone__date">
                                            <span>{milestone.date ? 'Fin prévue' : 'Statut'}</span>
                                            <strong>{milestone.date ? formatDate(milestone.date) : MILESTONE_LABEL[milestone.status]}</strong>
                                        </p>
                                        {milestoneUpdates.length > 0 && (
                                            <div className="dash-milestone__updates">
                                                {milestoneUpdates.map((update) => (
                                                    <article key={update.id} className="dash-milestone__update">
                                                        <span>{formatDate(update.date)}</span>
                                                        <p>{update.body}</p>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                    )
                                })}
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
                                            <span className="dash-kicker">{invoice.title || 'Facture'}</span>
                                            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{formatInvoiceEur(invoice.amount)}</p>
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
                                <span className="dash-kicker">Statut projet</span>
                                <strong style={{ display: 'block', marginTop: 4, fontSize: 15 }}>{currentStatusLabel}</strong>
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
                                        <div>
                                            <h3 className="dash-update__title" style={{ fontSize: 15 }}>{update.title}</h3>
                                            {update.milestoneLabel && (
                                                <span className="dash-pill dash-pill--mute" style={{ marginTop: 6 }}>
                                                    {update.milestoneLabel}
                                                </span>
                                            )}
                                        </div>
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
