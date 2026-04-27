import type { Timestamp } from 'firebase/firestore'

export function derivedName(input: string) {
    const source = input.includes('@') ? input.split('@')[0] ?? input : input
    return (
        source
            .split(/[._-\s]/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') || input
    )
}

export function formatDate(iso: string | undefined) {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso))
}

export function formatDateTime(iso: string | undefined) {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso))
}

export function formatEur(amount: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(amount)
}

export function slugify(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48)
}

export function createReadableId(prefix: string, label: string) {
    const base = slugify(label) || prefix
    return `${prefix}-${base}-${Date.now().toString(36)}`
}

export function toIsoDate(value: unknown) {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (value instanceof Date) return value.toISOString()

    const maybeTimestamp = value as Timestamp & { toDate?: () => Date }
    if (typeof maybeTimestamp?.toDate === 'function') {
        return maybeTimestamp.toDate().toISOString()
    }

    return undefined
}

export function sortByDateDesc<T>(items: T[], pick: (item: T) => string | undefined) {
    return [...items].sort((a, b) => {
        const left = pick(a) ? new Date(pick(a) as string).getTime() : 0
        const right = pick(b) ? new Date(pick(b) as string).getTime() : 0
        return right - left
    })
}

export function sortByDateAsc<T>(items: T[], pick: (item: T) => string | undefined) {
    return [...items].sort((a, b) => {
        const left = pick(a) ? new Date(pick(a) as string).getTime() : 0
        const right = pick(b) ? new Date(pick(b) as string).getTime() : 0
        return left - right
    })
}
