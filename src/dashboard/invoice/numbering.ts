import type { Client, Invoice } from '../types'

const MONTHS = [
    'JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN',
    'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC',
]

const MONTHS_FULL = [
    'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
]

function clientToken(client: Client | undefined | null): string {
    if (!client) return 'CLIENT'
    return client.slug ? client.slug.toUpperCase() : client.name.toUpperCase().replace(/\s+/g, '').slice(0, 12)
}

/**
 * Suggère un numéro `FAC-CAT-CLIENT-YYYY-NNN` calé sur le compteur du client pour l'année.
 * `category` est éditable par l'utilisateur (ex. MAINT, DEV, AUDIT).
 */
export function suggestInvoiceNumber(opts: {
    client: Client | null | undefined
    issued: string // ISO
    invoices: Invoice[]
    category?: string
}): string {
    const date = new Date(opts.issued)
    const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear()
    const cat = (opts.category ?? 'MAINT').toUpperCase()
    const slug = clientToken(opts.client)

    const sameYearForClient = opts.invoices.filter((invoice) => {
        if (opts.client && invoice.clientId !== opts.client.id) return false
        const issued = invoice.issued ? new Date(invoice.issued) : null
        return issued && issued.getFullYear() === year
    })

    const next = String(sameYearForClient.length + 1).padStart(3, '0')
    return `FAC-${cat}-${slug}-${year}-${next}`
}

/**
 * Suggère un titre du type `FACTURE – SERVICES WEB MENSUELS – MARS 2026`
 * en se basant sur la date d'émission.
 */
export function suggestInvoiceTitle(opts: { issued: string; subject?: string }): string {
    const date = new Date(opts.issued)
    if (Number.isNaN(date.getTime())) return 'FACTURE'
    const month = MONTHS_FULL[date.getMonth()]
    const year = date.getFullYear()
    const subject = (opts.subject ?? 'SERVICES WEB MENSUELS').toUpperCase()
    return `FACTURE – ${subject} – ${month} ${year}`
}

export const SHORT_MONTHS = MONTHS

export const DEFAULT_TERMS = [
    'Cette facture couvre la prestation indiquée pour la période concernée.',
    'Pour toute évolution ou ajout non inclus dans cette prestation, un devis séparé pourra être établi.',
    'Forfait facturé selon le tarif en vigueur.',
]
