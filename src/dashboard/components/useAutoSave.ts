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
    const onSaveRef = useRef(onSave)
    const isEqualRef = useRef(isEqual)

    onSaveRef.current = onSave
    isEqualRef.current = isEqual

    const equals = useCallback((a: T, b: T) => {
        if (isEqualRef.current) return isEqualRef.current(a, b)
        return Object.is(a, b)
    }, [])

    // Reset baseline if upstream data refreshes (e.g. Firestore snapshot updates).
    // We only adopt new baselines coming from outside while we're in idle/saved.
    const externalUpdateRef = useRef(false)
    useEffect(() => {
        externalUpdateRef.current = true
    }, [enabled])

    useEffect(() => {
        if (!enabled) return
        if (equals(value, lastSavedRef.current)) {
            return
        }

        setState('saving')
        setErrorMessage(null)

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(async () => {
            try {
                await onSaveRef.current(value)
                lastSavedRef.current = value
                setState('saved')
                setTimeout(() => {
                    setState((prev) => (prev === 'saved' ? 'idle' : prev))
                }, 1400)
            } catch (err) {
                console.error('[useAutoSave] save failed', err)
                setErrorMessage(err instanceof Error ? err.message : null)
                setState('error')
            }
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [value, equals, delay, enabled])

    const adopt = useCallback((next: T) => {
        lastSavedRef.current = next
        setState('idle')
        setErrorMessage(null)
    }, [])

    return { state, errorMessage, adopt }
}
