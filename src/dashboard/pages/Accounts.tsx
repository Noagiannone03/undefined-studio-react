import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { RolePill } from '../components/StatusPill'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { createClientAccount } from '../firestore'
import { mailApi } from '../api'

function generateTemporaryPassword() {
    return `Temp-${Math.random().toString(36).slice(2, 7)}-${Math.random().toString(36).slice(2, 6)}`
}

export default function Accounts() {
    const { user } = useAuth()
    const { clients, users, findClient } = useDashboardData()
    const [clientId, setClientId] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [temporaryPassword, setTemporaryPassword] = useState(generateTemporaryPassword())

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    if (user?.role !== 'admin') return <Navigate to="/" replace />

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        if (!clientId || !name.trim() || !email.trim() || temporaryPassword.length < 8) {
            setError('Client, nom, email et mot de passe temporaire valides requis.')
            return
        }

        setLoading(true)
        try {
            await createClientAccount({
                clientId,
                name,
                email,
                temporaryPassword,
            })

            const selectedClient = clients.find((c) => c.id === clientId)
            mailApi.welcome({
                to: email.trim().toLowerCase(),
                contactName: name.trim(),
                clientName: selectedClient?.name ?? name.trim(),
                email: email.trim().toLowerCase(),
                temporaryPassword,
            })

            setSuccess(`Compte créé pour ${email}. Mot de passe temporaire: ${temporaryPassword}`)
            setName('')
            setEmail('')
            setTemporaryPassword(generateTemporaryPassword())
        } catch {
            setError('Création du compte impossible. Vérifie si cet email existe déjà dans Firebase Auth.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( ADMIN ) — Comptes</span>
                <h1 className="dash-h1">
                    Les accès <span className="serif-italic">clients.</span>
                </h1>
                <p className="dash-sub">
                    Tu crées le compte, tu fournis un mot de passe temporaire, et l’utilisateur le remplace à sa première connexion.
                </p>
            </header>

            <section className="dash-grid dash-grid--2" style={{ alignItems: 'start' }}>
                <form onSubmit={onSubmit} className="dash-card dash-stack" noValidate>
                    <div className="dash-row-between">
                        <h2 className="dash-h2">Créer un accès</h2>
                        <button
                            type="button"
                            className="dash-btn dash-btn--ghost"
                            style={{ height: 40, fontSize: 12, padding: '0 14px' }}
                            onClick={() => setTemporaryPassword(generateTemporaryPassword())}
                        >
                            Générer
                        </button>
                    </div>

                    <div>
                        <label htmlFor="account-client" className="dash-label">Client</label>
                        <select id="account-client" className="dash-input" value={clientId} onChange={(event) => setClientId(event.target.value)}>
                            <option value="">Choisir un client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="account-name" className="dash-label">Nom complet</label>
                        <input id="account-name" className="dash-input" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="account-email" className="dash-label">Email</label>
                        <input id="account-email" type="email" className="dash-input" value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="account-temp-password" className="dash-label">Mot de passe temporaire</label>
                        <input id="account-temp-password" className="dash-input" value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} />
                    </div>

                    {error && <div className="login__error">{error}</div>}
                    {success && <div className="dash-note">{success}</div>}

                    <button type="submit" className="dash-btn" disabled={loading || clients.length === 0}>
                        {loading ? 'Création...' : 'Créer le compte'}
                    </button>
                </form>

                <div className="dash-stack">
                    {users.length === 0 ? (
                        <EmptyState title="Aucun compte" body="Les comptes Firebase apparaîtront ici dès leur création." />
                    ) : (
                        users.map((account) => {
                            const client = findClient(account.clientId ?? undefined)
                            return (
                                <article key={account.uid} className="dash-card">
                                    <div className="dash-row-between">
                                        <div>
                                            <span className="dash-kicker">{account.uid}</span>
                                            <h2 className="dash-h2" style={{ marginTop: 6 }}>{account.name}</h2>
                                        </div>
                                        <RolePill role={account.role} />
                                    </div>
                                    <p style={{ margin: 0 }}>{account.email}</p>
                                    <div className="dash-row">
                                        {client && <span className="dash-pill">{client.name}</span>}
                                        {account.mustChangePassword && <span className="dash-pill dash-pill--tomato">Mot de passe à changer</span>}
                                        {!account.isActive && <span className="dash-pill dash-pill--mute">Inactif</span>}
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}
