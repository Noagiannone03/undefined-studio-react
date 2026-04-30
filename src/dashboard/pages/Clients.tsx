import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ClientStatusPill } from '../components/StatusPill'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { createClient } from '../firestore'

export default function Clients() {
    const { user } = useAuth()
    const { clients, projects, users } = useDashboardData()
    const [name, setName] = useState('')
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [billingEmail, setBillingEmail] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (user?.role !== 'admin') return <Navigate to="/" replace />

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        if (!name.trim() || !contactName.trim() || !contactEmail.trim() || !billingEmail.trim()) {
            setError('Nom, contact et emails requis.')
            return
        }

        setLoading(true)
        try {
            await createClient({ name, contactName, contactEmail, billingEmail, notes })
            setName('')
            setContactName('')
            setContactEmail('')
            setBillingEmail('')
            setNotes('')
        } catch {
            setError('Impossible de créer le client.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( ADMIN ) — Clients</span>
                <h1 className="dash-h1">
                    Les entreprises <span className="serif-italic">clientes.</span>
                </h1>
                <p className="dash-sub">
                    Comptes, accès et projets rattachés à chaque entreprise.
                </p>
            </header>

            <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                {/* Formulaire création */}
                <form onSubmit={onSubmit} className="dash-card dash-stack" noValidate>
                    <h2 className="dash-h2">Nouvelle entreprise</h2>

                    <div>
                        <label htmlFor="client-name" className="dash-label">Nom de l'entreprise</label>
                        <input id="client-name" className="dash-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="contact-name" className="dash-label">Contact principal</label>
                        <input id="contact-name" className="dash-input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    </div>
                    <div className="dash-grid dash-grid--2">
                        <div>
                            <label htmlFor="contact-email" className="dash-label">Email contact</label>
                            <input id="contact-email" type="email" className="dash-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="billing-email" className="dash-label">Email facturation</label>
                            <input id="billing-email" type="email" className="dash-input" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="client-notes" className="dash-label">Notes internes</label>
                        <textarea id="client-notes" className="dash-input dash-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    {error && <div className="login__error">{error}</div>}

                    <button type="submit" className="dash-btn" disabled={loading}>
                        {loading ? 'Création…' : 'Créer l\'entreprise'}
                    </button>
                </form>

                {/* Liste des clients */}
                <div className="dash-stack">
                    {clients.length === 0 ? (
                        <EmptyState title="Aucune entreprise" body="Crée la première entreprise — tu géreras ensuite ses accès et ses projets depuis sa fiche." />
                    ) : (
                        clients.map((client) => {
                            const count = {
                                projects: projects.filter((p) => p.clientId === client.id).length,
                                accounts: users.filter((u) => u.clientIds.includes(client.id)).length,
                            }

                            return (
                                <div key={client.id}>
                                    <Link to={`/clients/${client.id}`} className="dash-card dash-card--link" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div className="dash-row-between">
                                            <div>
                                                <span className="dash-kicker">{client.slug}</span>
                                                <h2 className="dash-h2" style={{ marginTop: 4 }}>{client.name}</h2>
                                            </div>
                                            <ClientStatusPill status={client.status} />
                                        </div>
                                        <p className="dash-sub" style={{ fontSize: 15, margin: 0 }}>
                                            {client.contactName} · {client.contactEmail}
                                        </p>
                                        <div className="dash-grid dash-grid--2">
                                            <div className="dash-card" style={{ padding: '10px 14px' }}>
                                                <span className="dash-kicker">Projets</span>
                                                <span className="dash-h2">{count.projects}</span>
                                            </div>
                                            <div className="dash-card" style={{ padding: '10px 14px' }}>
                                                <span className="dash-kicker">Comptes</span>
                                                <span className="dash-h2">{count.accounts}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}
