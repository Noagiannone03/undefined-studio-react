import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../auth'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function Login() {
    const { user, loading: authLoading, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string } | null)?.from ?? '/'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (authLoading) return
        if (user) navigate(user.mustChangePassword ? '/setup-password' : from, { replace: true })
    }, [authLoading, from, navigate, user])

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!email.trim() || !password.trim()) {
            setError('Email et mot de passe requis.')
            return
        }
        setLoading(true)
        try {
            await login(email, password)
        } catch (err) {
            setError(err instanceof Error ? 'Connexion impossible. Vérifie email et mot de passe.' : 'Connexion impossible. Réessaie.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login">
            {/* LEFT — Form (always visible) */}
            <div className="login__form-side">
                <span className="dash-kicker login__top-kicker">
                    ( 00 ) — Espace client
                </span>

                <div className="login__content">
                    <motion.h1
                        className="login__title"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EXPO }}
                    >
                        TON{' '}
                        <span className="serif-italic">projet,</span>
                        <br />
                        AU <span className="login__accent">CLAIR.</span>
                    </motion.h1>

                    <motion.p
                        className="login__sub"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EXPO, delay: 0.1 }}
                    >
                        Avancement, questions, factures.
                        <br />
                        Un seul accès, branché sur Firebase Auth.
                    </motion.p>

                    <motion.form
                        onSubmit={onSubmit}
                        className="login__form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EXPO, delay: 0.2 }}
                        noValidate
                    >
                        <div>
                            <label htmlFor="email" className="dash-label">Email</label>
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
                            <label htmlFor="password" className="dash-label">Mot de passe</label>
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
                            <div role="alert" className="login__error">{error}</div>
                        )}

                        <button type="submit" className="dash-btn" disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden>
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </button>

                        <p className="login__demo-note">Compte client: email + mot de passe temporaire, puis changement obligatoire.</p>
                    </motion.form>
                </div>

                <span className="dash-kicker login__bot-kicker">
                    UNDEFINED STUDIO — 2026
                </span>
            </div>

            {/* RIGHT — Editorial (desktop only, hidden on mobile via CSS) */}
            <div className="login__splash" aria-hidden>
                <span className="dash-kicker login__splash-kicker">
                    ( APP ) — UNDEFINED STUDIO
                </span>
                <p className="login__splash-big">
                    ON BATIT,
                    <br />
                    <span className="login__splash-italic">tu regardes</span>
                    <br />
                    EN DIRECT.
                </p>
                <p className="login__splash-quote">
                    Cet espace te donne acces a l'avancement de ton projet,
                    aux questions en cours et a tes factures.
                </p>
            </div>
        </div>
    )
}
