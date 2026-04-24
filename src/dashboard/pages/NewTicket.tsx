import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { PROJECTS } from '../data'

const EXPO = [0.16, 1, 0.3, 1] as const

type Priority = 'low' | 'normal' | 'high'

export default function NewTicket() {
    const navigate = useNavigate()

    const [subject, setSubject] = useState('')
    const [projectId, setProjectId] = useState<string>('')
    const [priority, setPriority] = useState<Priority>('normal')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (subject.trim().length < 4 || body.trim().length < 10) {
            setError("Le sujet et le message doivent être un peu plus complets.")
            return
        }
        setSending(true)
        // Placeholder: would POST to /api/tickets
        await new Promise((r) => setTimeout(r, 700))
        setSending(false)
        setSent(true)
        setTimeout(() => navigate('/tickets'), 900)
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
                <p className="dash-sub">Dis-nous ce qui coince. On revient vite.</p>
            </header>

            <motion.form
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EXPO }}
                className="dash-stack"
                noValidate
            >
                <div>
                    <label htmlFor="subject" className="dash-label">Sujet</label>
                    <input
                        id="subject"
                        type="text"
                        className="dash-input"
                        placeholder="Résume en une phrase."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
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
                            onChange={(e) => setProjectId(e.target.value)}
                            disabled={sending || sent}
                        >
                            <option value="">Aucun / général</option>
                            {PROJECTS.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.tagline}
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
                            onChange={(e) => setPriority(e.target.value as Priority)}
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
                        placeholder="Le contexte, ce que tu attendais, ce qui s'est passé."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={sending || sent}
                    />
                </div>

                {error && (
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        letterSpacing: '0.15em',
                        color: 'var(--color-tomato)',
                        textTransform: 'uppercase',
                    }}>
                        {error}
                    </div>
                )}

                <div className="dash-row" style={{ marginTop: 8 }}>
                    <button type="submit" className="dash-btn" disabled={sending || sent}>
                        {sent ? 'Envoyé ✓' : sending ? 'Envoi…' : 'Envoyer'}
                    </button>
                    <Link to="/tickets" className="dash-btn dash-btn--ghost">
                        Annuler
                    </Link>
                </div>

                <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: 'var(--color-ink-mute)',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    Démo — cette requête n'est pas encore envoyée au serveur.
                </p>
            </motion.form>
        </div>
    )
}
