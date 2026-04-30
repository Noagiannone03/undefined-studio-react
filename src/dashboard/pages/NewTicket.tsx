import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { createTicket } from '../firestore'
import { mailApi } from '../api'
import type { TicketPriority } from '../types'

export default function NewTicket() {
    const { user } = useAuth()
    const { projects, findClient } = useDashboardData()
    const navigate = useNavigate()

    const [subject, setSubject] = useState('')
    const [projectId, setProjectId] = useState<string>('')
    const [priority, setPriority] = useState<TicketPriority>('normal')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (user?.role !== 'client') return <Navigate to="/tickets" replace />

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const clientId = user.clientId ?? user.clientIds[0]
        if (subject.trim().length < 4 || body.trim().length < 10 || !clientId) {
            setError('Sujet et message trop courts.')
            return
        }

        setSending(true)
        try {
            await createTicket({
                clientId,
                projectId: projectId || undefined,
                subject,
                body,
                priority,
                createdByUid: user.uid,
                createdByName: user.name,
            })

            const client = findClient(clientId)
            mailApi.ticketCreated({
                clientName: client?.name ?? user.name,
                contactName: user.name,
                ticketSubject: subject,
                ticketBody: body,
                priority,
            })

            setSent(true)
            setTimeout(() => navigate('/tickets'), 700)
        } catch {
            setError("Impossible d'envoyer le ticket.")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="dash-stack-lg" style={{ maxWidth: 760 }}>
            <header className="dash-page-head">
                <Link to="/tickets" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Tous les tickets
                </Link>
                <h1 className="dash-h1" style={{ marginTop: 8 }}>
                    Nouveau <span className="serif-italic">ticket.</span>
                </h1>
                <p className="dash-sub">Dis-nous ce qu’il faut regarder, on reprend le fil ici.</p>
            </header>

            <form onSubmit={onSubmit} className="dash-stack" noValidate>
                <div>
                    <label htmlFor="subject" className="dash-label">Sujet</label>
                    <input
                        id="subject"
                        type="text"
                        className="dash-input"
                        placeholder="En une phrase."
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        disabled={sending || sent}
                    />
                </div>

                <div className="dash-grid dash-grid--2">
                    <div>
                        <label htmlFor="project" className="dash-label">Projet concerné</label>
                        <select
                            id="project"
                            className="dash-input"
                            value={projectId}
                            onChange={(event) => setProjectId(event.target.value)}
                            disabled={sending || sent}
                        >
                            <option value="">Aucun / général</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} — {project.tagline}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="dash-label">Priorité</label>
                        <select
                            id="priority"
                            className="dash-input"
                            value={priority}
                            onChange={(event) => setPriority(event.target.value as TicketPriority)}
                            disabled={sending || sent}
                        >
                            <option value="low">Basse — pas urgent</option>
                            <option value="normal">Normale</option>
                            <option value="high">Haute — bloquant</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="body" className="dash-label">Message</label>
                    <textarea
                        id="body"
                        className="dash-input dash-textarea"
                        placeholder="Décris-nous la situation."
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        disabled={sending || sent}
                    />
                </div>

                {error && <div className="login__error">{error}</div>}

                <div className="dash-row" style={{ marginTop: 8 }}>
                    <button type="submit" className="dash-btn" disabled={sending || sent}>
                        {sent ? 'Envoyé ✓' : sending ? 'Envoi…' : 'Envoyer'}
                    </button>
                    <Link to="/tickets" className="dash-btn dash-btn--ghost">
                        Annuler
                    </Link>
                </div>


            </form>
        </div>
    )
}
