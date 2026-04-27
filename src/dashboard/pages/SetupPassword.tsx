import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function SetupPassword() {
    const { user, changePassword } = useAuth()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        if (password.length < 8) {
            setError('Choisis au moins 8 caractères.')
            return
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }

        setLoading(true)
        try {
            await changePassword(password)
            navigate('/', { replace: true })
        } catch {
            setError('Impossible de mettre à jour le mot de passe. Reconnecte-toi si besoin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login">
            <div className="login__form-side">
                <span className="dash-kicker login__top-kicker">( 00 ) — Sécurisation du compte</span>

                <div className="login__content">
                    <motion.h1
                        className="login__title"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EXPO }}
                    >
                        DEFINIS TON
                        <br />
                        <span className="login__accent">MOT DE PASSE.</span>
                    </motion.h1>

                    <motion.p
                        className="login__sub"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EXPO, delay: 0.1 }}
                    >
                        {user?.name}, ton accès a été créé avec un mot de passe temporaire.
                        Remplace-le maintenant pour activer complètement le dashboard.
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
                            <label htmlFor="password" className="dash-label">Nouveau mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                className="dash-input"
                                placeholder="Minimum 8 caractères"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="dash-label">Confirmer</label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                className="dash-input"
                                placeholder="Retape-le"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </div>

                        {error && <div role="alert" className="login__error">{error}</div>}

                        <button type="submit" className="dash-btn" disabled={loading}>
                            {loading ? 'Mise à jour...' : 'Activer mon accès'}
                        </button>
                    </motion.form>
                </div>

                <span className="dash-kicker login__bot-kicker">UNDEFINED STUDIO — ACCÈS SÉCURISÉ</span>
            </div>

            <div className="login__splash" aria-hidden>
                <span className="dash-kicker login__splash-kicker">( FIRST LOGIN ) — PASSWORD RESET</span>
                <p className="login__splash-big">
                    PREMIERE
                    <br />
                    <span className="login__splash-italic">connexion,</span>
                    <br />
                    PREMIER SETUP.
                </p>
            </div>
        </div>
    )
}
