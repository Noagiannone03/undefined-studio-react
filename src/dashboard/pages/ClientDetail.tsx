import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import {
    InvoiceStatusPill,
    ProjectStatusPill,
    RolePill,
    TicketStatusPill,
} from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'
import { DashboardSkeleton, LoadingButton } from '../components/LoadingState'
import { SaveIndicator } from '../components/SaveIndicator'
import { useAutoSave } from '../components/useAutoSave'
import { useToast } from '../components/Toast'
import {
    createClientAccount,
    createProject,
    deleteClient,
    removeClientAccess,
    updateClient,
    updateUserAccess,
} from '../firestore'
import { mailApi } from '../api'
import { formatDate, formatEur } from '../utils'
import { PROJECT_STATUS_OPTIONS } from '../projectStatus'
import type { Client, ClientStatus, ProjectStatus } from '../types'

const CLIENT_STATUS_OPTIONS: { value: ClientStatus; label: string; tone: 'mute' | 'klein' | 'tomato' | 'ink' }[] = [
    { value: 'active', label: 'Actif', tone: 'ink' },
    { value: 'lead', label: 'Lead', tone: 'klein' },
    { value: 'archived', label: 'Archivé', tone: 'mute' },
]

const ACCENTS = [
    { label: 'Klein', value: 'var(--color-klein)' },
    { label: 'Tomato', value: 'var(--color-tomato)' },
    { label: 'Ink', value: 'var(--color-ink)' },
]

type EditableClient = {
    name: string
    status: ClientStatus
    contactName: string
    contactEmail: string
    billingEmail: string
    address: string
    notes: string
}

function clientToDraft(client: Client): EditableClient {
    return {
        name: client.name,
        status: client.status,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        billingEmail: client.billingEmail,
        address: client.address ?? '',
        notes: client.notes ?? '',
    }
}

function clientsAreEqual(a: EditableClient, b: EditableClient): boolean {
    return (
        a.name === b.name &&
        a.status === b.status &&
        a.contactName === b.contactName &&
        a.contactEmail === b.contactEmail &&
        a.billingEmail === b.billingEmail &&
        a.address === b.address &&
        a.notes === b.notes
    )
}

function randomPassword() {
    return `Temp-${Math.random().toString(36).slice(2, 7)}-${Math.random().toString(36).slice(2, 6)}`
}

export default function ClientDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showSuccess, showError } = useToast()
    const { clients, projects, users, tickets, invoices, loading } = useDashboardData()

    const client = useMemo(() => clients.find((c) => c.id === id), [clients, id])

    const [draft, setDraft] = useState<EditableClient | null>(client ? clientToDraft(client) : null)

    useEffect(() => {
        if (client) setDraft(clientToDraft(client))
    }, [client])

    // ── Account form ──
    const [accName, setAccName] = useState('')
    const [accEmail, setAccEmail] = useState('')
    const [accPass, setAccPass] = useState(randomPassword)
    const [accBusy, setAccBusy] = useState(false)
    const [accError, setAccError] = useState<string | null>(null)
    const [accSuccess, setAccSuccess] = useState<string | null>(null)
    const [accFormOpen, setAccFormOpen] = useState(false)

    // ── Project form ──
    const [projName, setProjName] = useState('')
    const [projTagline, setProjTagline] = useState('')
    const [projStatus, setProjStatus] = useState<ProjectStatus>('active')
    const [projAccent, setProjAccent] = useState(ACCENTS[0].value)
    const [projKickoff, setProjKickoff] = useState('')
    const [projDelivery, setProjDelivery] = useState('')
    const [projBusy, setProjBusy] = useState(false)
    const [projError, setProjError] = useState<string | null>(null)
    const [projFormOpen, setProjFormOpen] = useState(false)
    const [adminActionBusy, setAdminActionBusy] = useState<string | null>(null)
    const [adminActionError, setAdminActionError] = useState<string | null>(null)

    const { state: saveState, errorMessage: saveError, adopt: adoptDraft } = useAutoSave<EditableClient | null>({
        value: draft,
        enabled: Boolean(client && draft),
        isEqual: (a, b) => {
            if (!a || !b) return a === b
            return clientsAreEqual(a, b)
        },
        onSave: async (next) => {
            if (!client || !next) return
            await updateClient(client.id, next)
        },
    })

    useEffect(() => {
        if (client) adoptDraft(clientToDraft(client))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client?.updatedAt])

    if (user?.role !== 'admin') return <Navigate to="/" replace />

    if (loading && !client) {
        return <DashboardSkeleton label="Chargement du client" />
    }

    if (!client || !draft) {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <Link to="/clients" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                        ← Tous les clients
                    </Link>
                    <h1 className="dash-h1">Ce client n'existe pas.</h1>
                </header>
            </div>
        )
    }

    const clientAccounts = users.filter((u) => u.clientIds.includes(client.id))
    const clientProjects = projects.filter((p) => p.clientId === client.id)
    const clientTickets = tickets.filter((t) => t.clientId === client.id)
    const openTickets = clientTickets.filter((t) => t.status !== 'resolved')
    const clientInvoices = invoices.filter((i) => i.clientId === client.id)
    const dueTotal = clientInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
    const paidTotal = clientInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)

    const patch = (p: Partial<EditableClient>) => setDraft((prev) => (prev ? { ...prev, ...p } : prev))

    const onCreateAccount = async (event: FormEvent) => {
        event.preventDefault()
        setAccError(null)
        setAccSuccess(null)
        if (!accName.trim() || !accEmail.trim() || accPass.length < 8) {
            setAccError('Nom, email et mot de passe (8 car. min) requis.')
            return
        }
        setAccBusy(true)
        try {
            await createClientAccount({ clientId: client.id, name: accName, email: accEmail, temporaryPassword: accPass })
            await mailApi.welcome({
                to: accEmail.trim().toLowerCase(),
                contactName: accName.trim(),
                clientName: client.name,
                email: accEmail.trim().toLowerCase(),
                temporaryPassword: accPass,
            })
            showSuccess('Invitation envoyée', `Email confirmé par Vercel pour ${accEmail.trim().toLowerCase()}.`)
            setAccSuccess(`Compte créé — mot de passe temporaire : ${accPass}`)
            setAccName('')
            setAccEmail('')
            setAccPass(randomPassword())
            setAccFormOpen(false)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Email déjà utilisé ou erreur Firebase Auth.'
            setAccError(message)
            showError('Invitation non envoyée', message)
        } finally {
            setAccBusy(false)
        }
    }

    const onCreateProject = async (event: FormEvent) => {
        event.preventDefault()
        setProjError(null)
        if (!projName.trim() || !projTagline.trim() || !projKickoff || !projDelivery) {
            setProjError('Nom, description courte, date de démarrage et livraison requis.')
            return
        }
        setProjBusy(true)
        try {
            await createProject({
                clientId: client.id,
                name: projName,
                tagline: projTagline,
                status: projStatus,
                progress: 0,
                accent: projAccent,
                kickoff: projKickoff,
                delivery: projDelivery,
            })
            setProjName('')
            setProjTagline('')
            setProjStatus('active')
            setProjAccent(ACCENTS[0].value)
            setProjKickoff('')
            setProjDelivery('')
            setProjFormOpen(false)
        } catch {
            setProjError('Création du projet impossible.')
        } finally {
            setProjBusy(false)
        }
    }

    const onToggleAccount = async (uid: string, isActive: boolean) => {
        setAdminActionError(null)
        setAdminActionBusy(uid)
        try {
            await updateUserAccess(uid, { isActive: !isActive })
        } catch {
            setAdminActionError('Action impossible sur cet accès.')
        } finally {
            setAdminActionBusy(null)
        }
    }

    const onRemoveAccess = async (uid: string, accountName: string) => {
        if (!window.confirm(`Retirer l'accès de ${accountName} à ${client.name} ?`)) return
        setAdminActionError(null)
        setAdminActionBusy(uid)
        try {
            await removeClientAccess(uid, client.id)
        } catch {
            setAdminActionError('Retrait de l’accès impossible.')
        } finally {
            setAdminActionBusy(null)
        }
    }

    const onDeleteClient = async () => {
        const confirmed = window.confirm(
            `Supprimer définitivement ${client.name} ? Les projets, points, tickets, factures et accès liés à cette entreprise seront retirés.`,
        )
        if (!confirmed) return
        setAdminActionError(null)
        setAdminActionBusy('delete-client')
        try {
            await deleteClient(client.id)
            navigate('/clients', { replace: true })
        } catch {
            setAdminActionError('Suppression de l’entreprise impossible.')
            setAdminActionBusy(null)
        }
    }

    return (
        <div className="dash-stack-lg">
            {/* ── Header inline editable ─────────────────────────────────────── */}
            <header className="dash-page-head">
                <div className="dash-row-between" style={{ alignItems: 'flex-start' }}>
                    <Link to="/clients" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        ← Tous les clients
                    </Link>
                    <SaveIndicator state={saveState} errorMessage={saveError} />
                </div>
                <div className="dash-row" style={{ marginTop: 8, gap: 10, flexWrap: 'wrap' }}>
                    {CLIENT_STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => patch({ status: opt.value })}
                            className={`dash-status-pick tone-${opt.tone}${draft.status === opt.value ? ' is-active' : ''}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <span className="dash-kicker">{client.slug}</span>
                </div>
                <input
                    className="dash-inline-input dash-inline-input--h1"
                    style={{ marginTop: 8 }}
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="Nom de l'entreprise"
                />
            </header>

            {/* ── Coordonnées + notes (inline edit) ────────────────────────── */}
            <section className="dash-edit">
                <div className="dash-edit__head">
                    <h2 className="dash-h2">Coordonnées</h2>
                </div>
                <div className="dash-grid dash-grid--2">
                    <div className="dash-stack-sm">
                        <span className="dash-label">Contact</span>
                        <input
                            className="dash-input"
                            value={draft.contactName}
                            onChange={(e) => patch({ contactName: e.target.value })}
                        />
                    </div>
                    <div className="dash-stack-sm">
                        <span className="dash-label">Email contact</span>
                        <input
                            type="email"
                            className="dash-input"
                            value={draft.contactEmail}
                            onChange={(e) => patch({ contactEmail: e.target.value })}
                        />
                    </div>
                </div>
                <div className="dash-stack-sm">
                    <span className="dash-label">Email facturation</span>
                    <input
                        type="email"
                        className="dash-input"
                        value={draft.billingEmail}
                        onChange={(e) => patch({ billingEmail: e.target.value })}
                    />
                </div>
                <div className="dash-stack-sm">
                    <span className="dash-label">Adresse entreprise</span>
                    <textarea
                        className="dash-inline-textarea"
                        value={draft.address}
                        onChange={(e) => patch({ address: e.target.value })}
                        placeholder="Adresse postale complète"
                    />
                </div>
                <div className="dash-stack-sm">
                    <span className="dash-label">Notes internes</span>
                    <textarea
                        className="dash-inline-textarea"
                        value={draft.notes}
                        onChange={(e) => patch({ notes: e.target.value })}
                    />
                </div>
            </section>

            {/* ── KPI ─────────────────────────────────────────────────────── */}
            <section className="dash-grid dash-grid--3">
                <div className="dash-card">
                    <span className="dash-kicker">Comptes actifs</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{clientAccounts.length}</span>
                </div>
                <div className="dash-card">
                    <span className="dash-kicker">Projets</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{clientProjects.length}</span>
                </div>
                <div className="dash-card">
                    <span className="dash-kicker">Tickets ouverts</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: openTickets.length > 0 ? 'var(--color-tomato)' : 'var(--color-ink)' }}>
                        {openTickets.length}
                    </span>
                </div>
            </section>

            {/* ── Accès ───────────────────────────────────────────────────── */}
            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Accès</h2>
                    <button
                        type="button"
                        className="dash-btn dash-btn--ghost"
                        style={{ height: 38, fontSize: 12, padding: '0 16px' }}
                        onClick={() => setAccFormOpen((v) => !v)}
                    >
                        {accFormOpen ? 'Annuler' : '+ Créer un accès'}
                    </button>
                </div>
                {accFormOpen && (
                    <form onSubmit={onCreateAccount} className="dash-card dash-stack" noValidate>
                        <div className="dash-grid dash-grid--2">
                            <div className="dash-stack-sm">
                                <span className="dash-label">Nom complet</span>
                                <input className="dash-input" value={accName} onChange={(e) => setAccName(e.target.value)} />
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Email</span>
                                <input type="email" className="dash-input" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Mot de passe temporaire</span>
                            <div className="dash-row" style={{ gap: 8 }}>
                                <input className="dash-input" style={{ flex: 1 }} value={accPass} onChange={(e) => setAccPass(e.target.value)} />
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--ghost"
                                    style={{ height: 48, fontSize: 12, padding: '0 14px' }}
                                    onClick={() => setAccPass(randomPassword())}
                                >Générer</button>
                            </div>
                        </div>
                        {accError && <div className="login__error">{accError}</div>}
                        <LoadingButton type="submit" className="dash-btn" loading={accBusy} loadingLabel="Création">
                            Créer le compte
                        </LoadingButton>
                    </form>
                )}
                {accSuccess && <div className="dash-note">{accSuccess}</div>}
                {clientAccounts.length === 0 ? (
                    <EmptyState title="Aucun accès" body="Crée un accès pour que ce client puisse se connecter." />
                ) : (
                    <div className="dash-stack">
                        {clientAccounts.map((account) => (
                            <div key={account.uid} className="dash-card">
                                <div className="dash-row-between">
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>{account.name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 13 }}>{account.email}</p>
                                    </div>
                                    <RolePill role={account.role} />
                                </div>
                                {(account.mustChangePassword || !account.isActive) && (
                                    <div className="dash-row" style={{ marginTop: 8 }}>
                                        {account.mustChangePassword && <span className="dash-pill dash-pill--tomato">Mot de passe à changer</span>}
                                        {!account.isActive && <span className="dash-pill dash-pill--mute">Bloqué</span>}
                                    </div>
                                )}
                                <div className="dash-row" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
                                    <LoadingButton
                                        type="button"
                                        className="dash-btn dash-btn--ghost"
                                        loading={adminActionBusy === account.uid}
                                        loadingLabel="Traitement"
                                        style={{ height: 34, fontSize: 11, padding: '0 12px' }}
                                        onClick={() => onToggleAccount(account.uid, account.isActive)}
                                    >
                                        {account.isActive ? 'Bloquer' : 'Débloquer'}
                                    </LoadingButton>
                                    <LoadingButton
                                        type="button"
                                        className="dash-btn dash-btn--ghost"
                                        loading={adminActionBusy === account.uid}
                                        loadingLabel="Retrait"
                                        style={{ height: 34, fontSize: 11, padding: '0 12px', color: 'var(--color-tomato)', borderColor: 'var(--color-tomato)' }}
                                        onClick={() => onRemoveAccess(account.uid, account.name)}
                                    >
                                        Retirer l’accès
                                    </LoadingButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {adminActionError && <div className="login__error">{adminActionError}</div>}
            </section>

            {/* ── Projets ─────────────────────────────────────────────────── */}
            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Projets</h2>
                    <button
                        type="button"
                        className="dash-btn dash-btn--ghost"
                        style={{ height: 38, fontSize: 12, padding: '0 16px' }}
                        onClick={() => setProjFormOpen((v) => !v)}
                    >
                        {projFormOpen ? 'Annuler' : '+ Nouveau projet'}
                    </button>
                </div>
                {projFormOpen && (
                    <form onSubmit={onCreateProject} className="dash-card dash-stack" noValidate>
                        <div className="dash-grid dash-grid--2">
                            <div className="dash-stack-sm">
                                <span className="dash-label">Nom du projet</span>
                                <input className="dash-input" value={projName} onChange={(e) => setProjName(e.target.value)} />
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Couleur accent</span>
                                <select className="dash-input" value={projAccent} onChange={(e) => setProjAccent(e.target.value)}>
                                    {ACCENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Description courte</span>
                            <input
                                className="dash-input"
                                value={projTagline}
                                onChange={(e) => setProjTagline(e.target.value)}
                                placeholder="Ex : Refonte du site vitrine, espace client, identité..."
                            />
                        </div>
                        <div className="dash-grid dash-grid--3">
                            <div className="dash-stack-sm">
                                <span className="dash-label">Statut</span>
                                <select className="dash-input" value={projStatus} onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}>
                                    {PROJECT_STATUS_OPTIONS.map((status) => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Date de démarrage</span>
                                <input type="date" className="dash-input" value={projKickoff} onChange={(e) => setProjKickoff(e.target.value)} />
                            </div>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Livraison</span>
                                <input type="date" className="dash-input" value={projDelivery} onChange={(e) => setProjDelivery(e.target.value)} />
                            </div>
                        </div>
                        {projError && <div className="login__error">{projError}</div>}
                        <LoadingButton type="submit" className="dash-btn" loading={projBusy} loadingLabel="Création">
                            Créer le projet
                        </LoadingButton>
                    </form>
                )}
                {clientProjects.length === 0 ? (
                    <EmptyState title="Aucun projet" body="Crée le premier projet de ce client." />
                ) : (
                    <div className="dash-grid dash-grid--2">
                        {clientProjects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="dash-card dash-card--pop dash-card--link"
                            >
                                <span className="dash-card__accent" style={{ background: project.accent }} />
                                <div className="dash-row-between">
                                    <ProjectStatusPill status={project.status} />
                                    <span className="dash-kicker">Livraison · {formatDate(project.delivery)}</span>
                                </div>
                                <h3 className="dash-h2" style={{ marginTop: 6 }}>{project.name}</h3>
                                <p className="dash-sub" style={{ fontSize: 16 }}>{project.tagline}</p>
                                <div className="dash-stack-sm" style={{ marginTop: 8 }}>
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">Avancement</span>
                                        <span className="dash-progress__value">{project.progress}%</span>
                                    </div>
                                    <ProgressBar value={project.progress} color={project.accent} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Factures ────────────────────────────────────────────────── */}
            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Factures</h2>
                    <Link
                        to={`/invoices/new?client=${client.id}`}
                        className="dash-btn"
                        style={{ height: 38, fontSize: 12, padding: '0 16px' }}
                    >
                        + Nouvelle facture
                    </Link>
                </div>

                <div className="dash-grid dash-grid--2">
                    <div className="dash-card">
                        <span className="dash-kicker">Total payé</span>
                        <span className="dash-h2" style={{ fontSize: 28 }}>{formatEur(paidTotal)}</span>
                    </div>
                    <div className="dash-card">
                        <span className="dash-kicker">En attente</span>
                        <span className="dash-h2" style={{ fontSize: 28, color: dueTotal > 0 ? 'var(--color-klein)' : 'var(--color-ink)' }}>
                            {formatEur(dueTotal)}
                        </span>
                    </div>
                </div>

                {clientInvoices.length === 0 ? (
                    <EmptyState
                        title="Aucune facture"
                        body="Génère ou importe la première facture pour ce client."
                    />
                ) : (
                    <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Projet</th>
                                        <th>Émise</th>
                                        <th>Échéance</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientInvoices.map((invoice) => {
                                        const project = projects.find((p) => p.id === invoice.projectId)
                                        return (
                                            <tr key={invoice.id}>
                                                <td className="dash-table__num">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        style={{ textDecoration: 'underline', color: 'inherit' }}
                                                    >
                                                        {invoice.number}
                                                    </Link>
                                                </td>
                                                <td>{project?.name ?? '—'}</td>
                                                <td>{formatDate(invoice.issued)}</td>
                                                <td>{formatDate(invoice.due)}</td>
                                                <td className="dash-table__num">{formatEur(invoice.amount)}</td>
                                                <td><InvoiceStatusPill status={invoice.status} /></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Tickets ─────────────────────────────────────────────────── */}
            <section className="dash-stack">
                <div className="dash-row-between">
                    <h2 className="dash-h2">Tickets</h2>
                    <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>
                        Tous les tickets →
                    </Link>
                </div>
                {clientTickets.length === 0 ? (
                    <EmptyState title="Aucun ticket" body="Aucune demande support pour ce client." />
                ) : (
                    <div className="dash-stack">
                        {clientTickets.map((ticket) => {
                            const project = projects.find((p) => p.id === ticket.projectId)
                            return (
                                <Link
                                    key={ticket.id}
                                    to={`/tickets#${ticket.id}`}
                                    className="dash-card dash-card--link"
                                >
                                    <div className="dash-row-between">
                                        <span className="dash-kicker">
                                            {ticket.id.toUpperCase()}{project ? ` · ${project.name}` : ''} · {formatDate(ticket.createdAt)}
                                        </span>
                                        <TicketStatusPill status={ticket.status} />
                                    </div>
                                    <h3 className="dash-h2" style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', marginTop: 4 }}>
                                        {ticket.subject}
                                    </h3>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="dash-card" style={{ borderColor: 'var(--color-tomato)' }}>
                <div className="dash-row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                    <div>
                        <span className="dash-kicker" style={{ color: 'var(--color-tomato)' }}>Zone admin</span>
                        <h2 className="dash-h2" style={{ marginTop: 4 }}>Supprimer l’entreprise</h2>
                        <p className="dash-note" style={{ marginTop: 6 }}>
                            Supprime l’entreprise et ses éléments liés. Les accès utilisateurs liés uniquement à cette entreprise seront bloqués.
                        </p>
                    </div>
                    <LoadingButton
                        type="button"
                        className="dash-btn"
                        loading={adminActionBusy === 'delete-client'}
                        loadingLabel="Suppression"
                        style={{ background: 'var(--color-tomato)', borderColor: 'var(--color-tomato)' }}
                        onClick={onDeleteClient}
                    >
                        Supprimer
                    </LoadingButton>
                </div>
                {adminActionError && <div className="login__error" style={{ marginTop: 12 }}>{adminActionError}</div>}
            </section>
        </div>
    )
}
