import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth'
import { auth as firebaseAuth } from './firebase'
import { markPasswordChangeCompleted, ensureUserProfile, subscribeUserProfile } from './firestore'
import { AuthContext, useAuth } from './auth'
import type { UserProfile } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubProfile: (() => void) | null = null

        const unsubAuth = onAuthStateChanged(firebaseAuth, async (nextUser) => {
            if (unsubProfile) {
                unsubProfile()
                unsubProfile = null
            }

            if (!nextUser) {
                setUser(null)
                setLoading(false)
                return
            }

            setLoading(true)
            await ensureUserProfile(nextUser)

            unsubProfile = subscribeUserProfile(
                nextUser.uid,
                (profile) => {
                    setUser(profile)
                    setLoading(false)
                },
                () => {
                    setUser(null)
                    setLoading(false)
                },
            )
        })

        return () => {
            unsubAuth()
            unsubProfile?.()
        }
    }, [])

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(firebaseAuth, email.trim().toLowerCase(), password)
    }

    const logout = async () => {
        await signOut(firebaseAuth)
    }

    const changePassword = async (nextPassword: string) => {
        if (!firebaseAuth.currentUser) throw new Error('No authenticated user.')
        await updatePassword(firebaseAuth.currentUser, nextPassword)
        await markPasswordChangeCompleted(firebaseAuth.currentUser.uid)
    }

    return <AuthContext.Provider value={{ user, loading, login, logout, changePassword }}>{children}</AuthContext.Provider>
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const location = useLocation()
    if (loading) {
        return (
            <div className="dash-root" style={{ display: 'grid', placeItems: 'center', minHeight: '100svh' }}>
                <div className="dash-card">
                    <span className="dash-kicker">Connexion sécurisée</span>
                    <h1 className="dash-h2">Chargement du compte…</h1>
                </div>
            </div>
        )
    }
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
    if (user.mustChangePassword && location.pathname !== '/setup-password') {
        return <Navigate to="/setup-password" replace />
    }
    if (!user.mustChangePassword && location.pathname === '/setup-password') {
        return <Navigate to="/" replace />
    }
    return <>{children}</>
}
