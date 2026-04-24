import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../auth'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string } | null)?.from ?? '/'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!email.trim() || !password.trim()) {
            setError('Email et mot de passe requis.')
            return
        }
        setLoading(true)
        try {
            await login(email)
            navigate(from, { replace: true })
        } catch {
            setError('Connexion impossible. Réessaie.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dash-login">
            <section className="dash-login__left">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EXPO }}
                >
                    <span className="dash-kicker">( 00 ) — Espace client</span>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                    <motion.h1
                        className="dash-login__h1"
                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.8, ease: EXPO }}
                    >
                        TON <span className="serif-italic" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em' }}>projet,</span>
                        <br />
                        AU <span style={{ color: 'var(--color-klein)' }}>CLAIR.</span>
                    </motion.h1>
                    <motion.p
                        className="dash-login__sub"
                        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.7, ease: EXPO }}
                    >
                        Avancement, questions, factures. Tout au même endroit.
                    </motion.p>

                    <motion.form
                        onSubmit={onSubmit}
                        className="dash-login__form"
                        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.7, ease: EXPO }}
                        noValidate
                    >
                        <div>
                            <label htmlFor="email" className="dash-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="dash-input"
                                placeholder="toi@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="dash-label">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="dash-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: 11,
                                    letterSpacing: '0.15em',
                                    color: 'var(--color-tomato)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button type="submit" className="dash-btn" disabled={loading}>
                            {loading ? 'Connexion…' : 'Se connecter'}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden>
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </button>

                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: 'var(--color-ink-mute)', textTransform: 'uppercase', margin: '4px 0 0' }}>
                            Démo — n'importe quel email + mot de passe fonctionne.
                        </p>
                    </motion.form>
                </motion.div>

                <span className="dash-kicker" style={{ opacity: 0.5 }}>
                    Marseille — 2026
                </span>
            </section>

            <aside className="dash-login__right" aria-hidden>
                <span className="dash-kicker" style={{ color: 'rgba(239,235,221,0.6)' }}>
                    ( APP ) — UNDEFINED STUDIO
                </span>
                <div style={{ marginTop: 'auto' }}>
                    <p className="dash-login__big">
                        ON BÂTIT,
                        <br />
                        <span className="dash-login__big-italic" style={{ color: 'var(--color-tomato)' }}>tu regardes</span>
                        <br />
                        EN DIRECT.
                    </p>
                </div>
                <p className="dash-login__quote">
                    — Cet espace te donne accès à l'avancement de ton projet, aux questions en cours et à tes factures. Si quelque chose manque, on ouvre un ticket.
                </p>
            </aside>
        </div>
    )
}
