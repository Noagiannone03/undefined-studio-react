import { createContext, useContext } from 'react'
import type { User } from './types'

const STORAGE_KEY = 'undefined-studio:user'

export type AuthContextValue = {
    user: User | null
    login: (email: string) => Promise<User>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function readUser(): User | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as User) : null
    } catch {
        return null
    }
}

export function writeUser(u: User | null) {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
}

export function derivedName(email: string) {
    const local = email.split('@')[0] ?? email
    // "noa.giannone" → "Noa Giannone"
    return (
        local
            .split(/[._-]/)
            .filter(Boolean)
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ') || email
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
