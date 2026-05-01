import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../auth'
import { LoadingButton } from '../components/LoadingState'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function Login() {
    const { user, loading: authLoading, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    const wasBlocked = Boolean((location.state as { blocked?: boolean } | null)?.blocked)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (wasBlocked) setError('Ton accès a été bloqué. Contacte le studio.')
    }, [wasBlocked])

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
            window.sessionStorage.setItem('dash-entry-intro', '1')
        } catch (err) {
            console.error('[login] failed', err)
            const code = (err as { code?: string } | null)?.code
            const userMessage =
                code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
                    ? 'Email ou mot de passe incorrect.'
                    : code === 'dashboard/account-blocked'
                    ? 'Ton accès a été bloqué. Contacte le studio.'
                    : code === 'auth/user-disabled'
                    ? 'Ce compte est désactivé.'
                    : code === 'auth/too-many-requests'
                    ? 'Trop de tentatives. Réessaie dans quelques minutes.'
                    : 'Connexion impossible. Réessaie.'
            setError(userMessage)
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
                        Ton espace{' '}
                        <span className="serif-italic">projet.</span>
                    </motion.h1>

                    <motion.p
                        className="login__sub"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EXPO, delay: 0.1 }}
                    >
                        Avancement, factures, échanges — au même endroit.
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

                        <LoadingButton type="submit" className="dash-btn" loading={loading} loadingLabel="Connexion">
                            Se connecter
                            {!loading && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden>
                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                </svg>
                            )}
                        </LoadingButton>

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
                    Bienvenue dans les
                    <br />
                    <span className="login__splash-italic">coulisses</span>
                    <br />
                    du studio.
                </p>
            </div>
        </div>
    )
}
