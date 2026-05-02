import type { Invoice } from '../types'

const MONTHS = [
    'JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN',
    'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC',
]

const MONTHS_FULL = [
    'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
]

function safeDateFromIso(iso: string): Date {
    const date = new Date(`${iso}T12:00:00`)
    return Number.isNaN(date.getTime()) ? new Date() : date
}

export function invoiceDueAtEndOfMonth(issued: string): string {
    const date = safeDateFromIso(issued)
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12).toISOString().slice(0, 10)
}

function previousBillingMonth(issued: string): { month: string; year: number } {
    const date = safeDateFromIso(issued)
    const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1, 12)
    return { month: MONTHS_FULL[previous.getMonth()], year: previous.getFullYear() }
}

/**
 * Suggère un numéro mensuel `YYYY-MM-NNN`, basé sur la date d'émission.
 * Le compteur repart à 001 chaque mois et s'appuie sur les factures déjà émises ce mois-là.
 */
export function suggestInvoiceNumber(opts: {
    issued: string // ISO
    invoices: Invoice[]
}): string {
    const safeDate = safeDateFromIso(opts.issued)
    const year = safeDate.getFullYear()
    const month = String(safeDate.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`

    const sameMonth = opts.invoices.filter((invoice) => {
        const issued = invoice.issued ? new Date(invoice.issued) : null
        return issued &&
            !Number.isNaN(issued.getTime()) &&
            issued.getFullYear() === year &&
            issued.getMonth() === safeDate.getMonth()
    })

    const maxExisting = sameMonth.reduce((max, invoice) => {
        const match = invoice.number.match(new RegExp(`^${prefix}-(\\d+)$`))
        const value = match ? Number(match[1]) : 0
        return Number.isFinite(value) ? Math.max(max, value) : max
    }, 0)

    const fallbackNext = sameMonth.length + 1
    const next = String(Math.max(maxExisting + 1, fallbackNext)).padStart(3, '0')
    return `${prefix}-${next}`
}

/**
 * Suggère un titre du type `FACTURE – SERVICES WEB MENSUELS – MARS 2026`
 * en se basant sur la date d'émission.
 */
export function suggestInvoiceTitle(opts: { issued: string; subject?: string }): string {
    const { month, year } = previousBillingMonth(opts.issued)
    const subject = (opts.subject ?? 'SERVICES WEB MENSUELS').toUpperCase()
    return `FACTURE – ${subject} – ${month} ${year}`
}

export const SHORT_MONTHS = MONTHS

export const DEFAULT_TERMS = [
    'Cette facture couvre la prestation indiquée pour la période concernée.',
    'Pour toute évolution ou ajout non inclus dans cette prestation, un devis séparé pourra être établi.',
    'Forfait facturé selon le tarif en vigueur.',
]
