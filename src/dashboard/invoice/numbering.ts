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

function previousBillingDate(issued: string): Date {
    const date = safeDateFromIso(issued)
    return new Date(date.getFullYear(), date.getMonth() - 1, 1, 12)
}

function previousBillingMonth(issued: string): { month: string; year: number } {
    const previous = previousBillingDate(issued)
    return { month: MONTHS_FULL[previous.getMonth()], year: previous.getFullYear() }
}

/**
 * Suggère un numéro mensuel `YYYY-MM-NNN`, basé sur le mois facturé.
 * Une facture émise en mai pour avril prend donc le préfixe `YYYY-04`.
 */
export function suggestInvoiceNumber(opts: {
    issued: string // ISO
    invoices: Invoice[]
}): string {
    const billedDate = previousBillingDate(opts.issued)
    const year = billedDate.getFullYear()
    const month = String(billedDate.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`

    const sameMonth = opts.invoices.filter((invoice) => {
        const match = invoice.number.match(new RegExp(`^${prefix}-(\\d+)$`))
        if (match) return true
        const issued = invoice.issued ? previousBillingDate(invoice.issued) : null
        if (!issued) return false
        return issued.getFullYear() === year && issued.getMonth() === billedDate.getMonth()
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
