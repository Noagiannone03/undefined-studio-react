/**
 * Formats dédiés au PDF facture — gardent les centimes.
 * (Le formatEur global du dashboard arrondit pour les KPI, ici on veut la précision.)
 */

export function formatInvoiceEur(amount: number): string {
    if (!Number.isFinite(amount)) return '0 €'
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function formatInvoiceDate(iso: string | undefined): string {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    }).format(new Date(iso))
}
