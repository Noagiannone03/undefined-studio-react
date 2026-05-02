import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type ToastKind = 'success' | 'error' | 'info'

type Toast = {
    id: string
    kind: ToastKind
    title: string
    body?: string
}

type ToastInput = {
    kind?: ToastKind
    title: string
    body?: string
}

type ToastContextValue = {
    showToast: (toast: ToastInput) => void
    showSuccess: (title: string, body?: string) => void
    showError: (title: string, body?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const EXPO = [0.16, 1, 0.3, 1] as const

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((input: ToastInput) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const toast: Toast = {
            id,
            kind: input.kind ?? 'info',
            title: input.title,
            body: input.body,
        }
        setToasts((current) => [toast, ...current].slice(0, 4))
        window.setTimeout(() => dismiss(id), input.kind === 'error' ? 7000 : 4800)
    }, [dismiss])

    const value = useMemo<ToastContextValue>(() => ({
        showToast,
        showSuccess: (title, body) => showToast({ kind: 'success', title, body }),
        showError: (title, body) => showToast({ kind: 'error', title, body }),
    }), [showToast])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="dash-toast-viewport" aria-live="polite" aria-atomic="true">
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <motion.article
                            key={toast.id}
                            className={`dash-toast dash-toast--${toast.kind}`}
                            initial={{ opacity: 0, x: 28, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 18, scale: 0.98 }}
                            transition={{ duration: 0.28, ease: EXPO }}
                        >
                            <span className="dash-toast__bar" aria-hidden />
                            <div className="dash-toast__content">
                                <span className="dash-toast__kicker">
                                    {toast.kind === 'success' ? 'Email envoyé' : toast.kind === 'error' ? 'Email non envoyé' : 'Info'}
                                </span>
                                <strong>{toast.title}</strong>
                                {toast.body && <p>{toast.body}</p>}
                            </div>
                            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Fermer la notification">
                                ×
                            </button>
                        </motion.article>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used inside <ToastProvider>')
    return context
}
