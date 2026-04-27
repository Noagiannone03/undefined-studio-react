import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { ClientStatusPill, ProjectStatusPill, RolePill } from '../components/StatusPill'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'
import { createClientAccount, createProject } from '../firestore'
import { formatDate } from '../utils'
import type { ProjectStatus } from '../types'

const PROJECT_STATUSES: ProjectStatus[] = ['discovery', 'design', 'build', 'review', 'live', 'paused']
const ACCENTS = [
    { label: 'Klein', value: 'var(--color-klein)' },
    { label: 'Tomato', value: 'var(--color-tomato)' },
    { label: 'Ink', value: 'var(--color-ink)' },
]

function randomPassword() {
    return `Temp-${Math.random().toString(36).slice(2, 7)}-${Math.random().toString(36).slice(2, 6)}`
}

export default function ClientDetail() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { clients, projects, users, tickets, loading } = useDashboardData()

    // ── Account form ──────────────────────────────────────────────────────────
    const [accName, setAccName] = useState('')
    const [accEmail, setAccEmail] = useState('')
    const [accPass, setAccPass] = useState(randomPassword)
    const [accBusy, setAccBusy] = useState(false)
    const [accError, setAccError] = useState<string | null>(null)
    const [accSuccess, setAccSuccess] = useState<string | null>(null)

    // ── Project form ──────────────────────────────────────────────────────────
    const [projName, setProjName] = useState('')
    const [projTagline, setProjTagline] = useState('')
    const [projStatus, setProjStatus] = useState<ProjectStatus>('discovery')
    const [projProgress, setProjProgress] = useState('10')
    const [projAccent, setProjAccent] = useState(ACCENTS[0].value)
    const [projKickoff, setProjKickoff] = useState('')
    const [projDelivery, setProjDelivery] = useState('')
    const [projBusy, setProjBusy] = useState(false)
    const [projError, setProjError] = useState<string | null>(null)

    if (user?.role !== 'admin') return <Navigate to="/" replace />

    const client = clients.find((c) => c.id === id)
    const clientAccounts = users.filter((u) => u.clientIds.includes(id ?? ''))
    const clientProjects = projects.filter((p) => p.clientId === id)
    const clientTickets = tickets.filter((t) => t.clientId === id)
    const openTickets = clientTickets.filter((t) => t.status !== 'resolved')

    if (loading && !client) {
        return (
            <div className="dash-card">
                <span className="dash-kicker">Chargement…</span>
            </div>
        )
    }

    if (!client) {
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
            setAccSuccess(`Compte créé — mot de passe temporaire : ${accPass}`)
            setAccName('')
            setAccEmail('')
            setAccPass(randomPassword())
        } catch {
            setAccError('Email déjà utilisé ou erreur Firebase Auth.')
        } finally {
            setAccBusy(false)
        }
    }

    const onCreateProject = async (event: FormEvent) => {
        event.preventDefault()
        setProjError(null)
        if (!projName.trim() || !projTagline.trim() || !projKickoff || !projDelivery) {
            setProjError('Nom, tagline, kickoff et livraison requis.')
            return
        }
        setProjBusy(true)
        try {
            await createProject({
                clientId: client.id,
                name: projName,
                tagline: projTagline,
                status: projStatus,
                progress: Number(projProgress) || 0,
                accent: projAccent,
                kickoff: projKickoff,
                delivery: projDelivery,
            })
            setProjName('')
            setProjTagline('')
            setProjStatus('discovery')
            setProjProgress('10')
            setProjAccent(ACCENTS[0].value)
            setProjKickoff('')
            setProjDelivery('')
        } catch {
            setProjError('Création du projet impossible.')
        } finally {
            setProjBusy(false)
        }
    }

    return (
        <div className="dash-stack-lg">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className="dash-page-head">
                <Link to="/clients" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Tous les clients
                </Link>
                <div className="dash-row" style={{ marginTop: 8 }}>
                    <ClientStatusPill status={client.status} />
                    <span className="dash-kicker">{client.slug}</span>
                </div>
                <h1 className="dash-h1" style={{ marginTop: 4 }}>{client.name}</h1>
                <p className="dash-sub">
                    {client.contactName} · {client.contactEmail}
                    {client.billingEmail !== client.contactEmail && ` · facturation : ${client.billingEmail}`}
                </p>
                {client.notes && <p style={{ margin: 0, lineHeight: 1.6, maxWidth: 600 }}>{client.notes}</p>}
            </header>

            {/* ── Stats rapides ─────────────────────────────────────────────── */}
            <section className="dash-grid dash-grid--3">
                {[
                    { label: 'Comptes actifs', value: clientAccounts.length },
                    { label: 'Projets', value: clientProjects.length },
                    { label: 'Tickets ouverts', value: openTickets.length },
                ].map((stat) => (
                    <div key={stat.label} className="dash-card">
                        <span className="dash-kicker">{stat.label}</span>
                        <span className="dash-h1" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
                            {stat.value.toString().padStart(2, '0')}
                        </span>
                    </div>
                ))}
            </section>

            {/* ── Comptes accès ────────────────────────────────────────────── */}
            <section className="dash-stack">
                <h2 className="dash-h2">Accès client</h2>
                <div className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <form onSubmit={onCreateAccount} className="dash-card dash-stack" noValidate>
                        <div className="dash-row-between">
                            <h3 className="dash-h2">Créer un accès</h3>
                            <button
                                type="button"
                                className="dash-btn dash-btn--ghost"
                                style={{ height: 38, fontSize: 12, padding: '0 14px' }}
                                onClick={() => setAccPass(randomPassword())}
                            >
                                Générer mdp
                            </button>
                        </div>
                        <div>
                            <label htmlFor="acc-name" className="dash-label">Nom complet</label>
                            <input id="acc-name" className="dash-input" value={accName} onChange={(e) => setAccName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="acc-email" className="dash-label">Email</label>
                            <input id="acc-email" type="email" className="dash-input" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="acc-pass" className="dash-label">Mot de passe temporaire</label>
                            <input id="acc-pass" className="dash-input" value={accPass} onChange={(e) => setAccPass(e.target.value)} />
                        </div>
                        {accError && <div className="login__error">{accError}</div>}
                        {accSuccess && <div className="dash-note">{accSuccess}</div>}
                        <button type="submit" className="dash-btn" disabled={accBusy}>
                            {accBusy ? 'Création…' : 'Créer le compte'}
                        </button>
                    </form>

                    <div className="dash-stack">
                        {clientAccounts.length === 0 ? (
                            <EmptyState title="Aucun accès" body="Ce client n'a pas encore de compte. Crée-en un à gauche." />
                        ) : (
                            clientAccounts.map((account) => (
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
                                            {!account.isActive && <span className="dash-pill dash-pill--mute">Inactif</span>}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ── Projets ──────────────────────────────────────────────────── */}
            <section className="dash-stack">
                <h2 className="dash-h2">Projets</h2>
                <div className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                    <form onSubmit={onCreateProject} className="dash-card dash-stack" noValidate>
                        <h3 className="dash-h2">Nouveau projet</h3>
                        <div>
                            <label htmlFor="proj-name" className="dash-label">Nom du projet</label>
                            <input id="proj-name" className="dash-input" value={projName} onChange={(e) => setProjName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="proj-tagline" className="dash-label">Tagline</label>
                            <input id="proj-tagline" className="dash-input" value={projTagline} onChange={(e) => setProjTagline(e.target.value)} />
                        </div>
                        <div className="dash-grid dash-grid--2">
                            <div>
                                <label htmlFor="proj-status" className="dash-label">Statut</label>
                                <select id="proj-status" className="dash-input" value={projStatus} onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}>
                                    {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="proj-progress" className="dash-label">Avancement %</label>
                                <input id="proj-progress" type="number" min="0" max="100" className="dash-input" value={projProgress} onChange={(e) => setProjProgress(e.target.value)} />
                            </div>
                        </div>
                        <div className="dash-grid dash-grid--2">
                            <div>
                                <label htmlFor="proj-kickoff" className="dash-label">Kickoff</label>
                                <input id="proj-kickoff" type="date" className="dash-input" value={projKickoff} onChange={(e) => setProjKickoff(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="proj-delivery" className="dash-label">Livraison</label>
                                <input id="proj-delivery" type="date" className="dash-input" value={projDelivery} onChange={(e) => setProjDelivery(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="proj-accent" className="dash-label">Couleur accent</label>
                            <select id="proj-accent" className="dash-input" value={projAccent} onChange={(e) => setProjAccent(e.target.value)}>
                                {ACCENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </div>
                        {projError && <div className="login__error">{projError}</div>}
                        <button type="submit" className="dash-btn" disabled={projBusy}>
                            {projBusy ? 'Création…' : 'Créer le projet'}
                        </button>
                    </form>

                    <div className="dash-stack">
                        {clientProjects.length === 0 ? (
                            <EmptyState title="Aucun projet" body="Crée le premier projet de ce client." />
                        ) : (
                            clientProjects.map((project) => (
                                <div key={project.id}>
                                    <Link to={`/projects/${project.id}`} className="dash-card dash-card--pop dash-card--link">
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
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ── Tickets récents ───────────────────────────────────────────── */}
            {clientTickets.length > 0 && (
                <section className="dash-stack">
                    <div className="dash-row-between">
                        <h2 className="dash-h2">Tickets</h2>
                        <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none' }}>Tous les tickets →</Link>
                    </div>
                    <div className="dash-stack">
                        {clientTickets.slice(0, 4).map((ticket) => (
                            <div key={ticket.id} className="dash-card">
                                <div className="dash-row-between">
                                    <span className="dash-kicker">{ticket.id.toUpperCase()}</span>
                                    <span className={`dash-pill${ticket.status === 'open' ? ' dash-pill--tomato' : ticket.status === 'resolved' ? ' dash-pill--ink' : ''}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{ticket.subject}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
