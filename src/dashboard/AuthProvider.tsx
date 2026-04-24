import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext, derivedName, readUser, useAuth, writeUser } from './auth'
import type { User } from './types'

/**
 * Placeholder auth. Any non-empty email + password authenticates and stores
 * a minimal user profile in localStorage. Swap login() / logout() with real
 * API calls when the backend is live.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => readUser())

    useEffect(() => {
        writeUser(user)
    }, [user])

    const login = async (email: string): Promise<User> => {
        // Simulated latency so the UX reads as a real network call.
        await new Promise((r) => setTimeout(r, 450))
        const next: User = {
            email: email.trim(),
            name: derivedName(email.trim()),
            clientId: 'demo-01',
            company: 'Client démo',
        }
        setUser(next)
        return next
    }

    const logout = () => setUser(null)

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const location = useLocation()
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
    return <>{children}</>
}
