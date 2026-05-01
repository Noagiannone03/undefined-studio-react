import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { LoadingButton } from '../components/LoadingState'

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
            window.sessionStorage.setItem('dash-entry-intro', '1')
            navigate('/', { replace: true })
        } catch (err) {
            console.error('[setup-password] failed', err)
            setError('Impossible de mettre à jour le mot de passe. Reconnecte-toi si besoin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login login--setup">
            <div className="login__form-side">
                <motion.span
                    className="dash-kicker login__top-kicker login__setup-kicker"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: EXPO }}
                >
                    ( 01 ) — Première connexion
                </motion.span>

                <div className="login__content">
                    <motion.div
                        className="login__handoff"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: EXPO }}
                    >
                        <span className="login__handoff-dot" aria-hidden />
                        <div>
                            <span className="dash-kicker">Étape requise</span>
                            <strong>Nouveau mot de passe</strong>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="login__title"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.68, ease: EXPO, delay: 0.08 }}
                    >
                        Sécurise ton{' '}
                        <span className="serif-italic">accès.</span>
                    </motion.h1>

                    <motion.p
                        className="login__sub"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: EXPO, delay: 0.16 }}
                    >
                        {user?.name}, finalise l’accès pour entrer dans ton espace.
                    </motion.p>

                    <motion.form
                        onSubmit={onSubmit}
                        className="login__form"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.58, ease: EXPO, delay: 0.24 }}
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

                        <LoadingButton type="submit" className="dash-btn" loading={loading} loadingLabel="Activation">
                            Activer mon accès
                        </LoadingButton>
                    </motion.form>
                </div>

                <span className="dash-kicker login__bot-kicker">UNDEFINED STUDIO — ACCÈS SÉCURISÉ</span>
            </div>

            <motion.div
                className="login__splash login__splash--setup"
                aria-hidden
                initial={{ clipPath: 'inset(0 0 0 100%)' }}
                animate={{ clipPath: 'inset(0 0 0 0%)' }}
                transition={{ duration: 0.7, ease: EXPO }}
            >
                <span className="dash-kicker login__splash-kicker">( MOT DE PASSE ) — UNDEFINED STUDIO</span>
                <motion.p
                    className="login__splash-big"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EXPO, delay: 0.2 }}
                >
                    Ton espace,
                    <br />
                    <span className="login__splash-italic">totalement</span>
                    <br />
                    privé.
                </motion.p>
                <motion.div
                    className="login__setup-rail"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: EXPO, delay: 0.36 }}
                >
                    <span />
                    <span />
                    <span />
                </motion.div>
            </motion.div>
        </div>
    )
}
