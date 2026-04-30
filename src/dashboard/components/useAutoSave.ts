import { useCallback, useEffect, useRef, useState } from 'react'
import type { SaveState } from './SaveIndicator'

type Options<T> = {
    value: T
    onSave: (value: T) => Promise<void>
    delay?: number
    enabled?: boolean
    isEqual?: (a: T, b: T) => boolean
}

/**
 * Triggers `onSave(value)` after `delay` ms of inactivity once `value` differs
 * from the last saved snapshot. Returns the current save state and any error.
 *
 * - Initial render does NOT save (it adopts `value` as the baseline).
 * - Subsequent re-renders with the same value (deep equal via `isEqual`) are ignored.
 * - On unmount or when a newer value arrives, the pending timer is cleared.
 */
export function useAutoSave<T>({
    value,
    onSave,
    delay = 800,
    enabled = true,
    isEqual,
}: Options<T>) {
    const [state, setState] = useState<SaveState>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const lastSavedRef = useRef<T>(value)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const savingStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const savedStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const equals = useCallback((a: T, b: T) => {
        if (isEqual) return isEqual(a, b)
        return Object.is(a, b)
    }, [isEqual])

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            if (savingStateTimerRef.current) {
                clearTimeout(savingStateTimerRef.current)
                savingStateTimerRef.current = null
            }
            return
        }

        if (equals(value, lastSavedRef.current)) {
            return
        }

        if (savedStateTimerRef.current) {
            clearTimeout(savedStateTimerRef.current)
            savedStateTimerRef.current = null
        }

        if (savingStateTimerRef.current) {
            clearTimeout(savingStateTimerRef.current)
        }
        savingStateTimerRef.current = setTimeout(() => {
            setState('saving')
            setErrorMessage(null)
        }, 0)

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(async () => {
            try {
                await onSave(value)
                lastSavedRef.current = value
                setState('saved')
                savedStateTimerRef.current = setTimeout(() => {
                    setState((prev) => (prev === 'saved' ? 'idle' : prev))
                }, 1400)
            } catch (err) {
                console.error('[useAutoSave] save failed', err)
                setErrorMessage(err instanceof Error ? err.message : null)
                setState('error')
            }
        }, delay)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            if (savingStateTimerRef.current) {
                clearTimeout(savingStateTimerRef.current)
                savingStateTimerRef.current = null
            }
        }
    }, [value, equals, delay, enabled, onSave])

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (savingStateTimerRef.current) clearTimeout(savingStateTimerRef.current)
            if (savedStateTimerRef.current) clearTimeout(savedStateTimerRef.current)
        }
    }, [])

    const adopt = useCallback((next: T) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        if (savingStateTimerRef.current) {
            clearTimeout(savingStateTimerRef.current)
            savingStateTimerRef.current = null
        }
        if (savedStateTimerRef.current) {
            clearTimeout(savedStateTimerRef.current)
            savedStateTimerRef.current = null
        }
        lastSavedRef.current = next
        setState('idle')
        setErrorMessage(null)
    }, [])

    return { state, errorMessage, adopt }
}
