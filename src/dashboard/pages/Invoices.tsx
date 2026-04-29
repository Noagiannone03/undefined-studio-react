import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { EmptyState } from '../components/EmptyState'
import { InvoiceStatusPill } from '../components/StatusPill'
import { useDashboardData } from '../useDashboardData'
import { useAuth } from '../auth'
import { InvoicePDF } from '../invoice/InvoicePDF'
import { mailApi } from '../api'
import { formatDate, formatEur } from '../utils'
import type { Invoice } from '../types'

async function pdfToBase64(invoice: Invoice, client: ReturnType<ReturnType<typeof useDashboardData>['findClient']>): Promise<string> {
    const blob = await pdf(<InvoicePDF invoice={invoice} client={client ?? null} />).toBlob()
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}

export default function Invoices() {
    const { user } = useAuth()
    const { invoices, findProject, findClient } = useDashboardData()
    const [sendingId, setSendingId] = useState<string | null>(null)
    const [sentIds, setSentIds] = useState<Set<string>>(new Set())

    const paid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    const due = invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)

    const onSendInvoice = async (invoice: Invoice) => {
        const client = findClient(invoice.clientId)
        const to = client?.billingEmail ?? client?.contactEmail
        if (!to) {
            alert('Aucun email de facturation trouvé pour ce client.')
            return
        }

        setSendingId(invoice.id)
        try {
            const pdfBase64 = await pdfToBase64(invoice, client)
            await mailApi.invoice({
                to,
                contactName: client?.contactName ?? client?.name ?? '',
                clientName: client?.name ?? '',
                invoiceNumber: invoice.number,
                invoiceTitle: invoice.title,
                amount: invoice.amount,
                dueDate: invoice.due,
                items: invoice.items,
                pdfBase64,
            })
            setSentIds((prev) => new Set([...prev, invoice.id]))
        } catch {
            alert('Échec de l\'envoi. Vérifie la config SMTP sur le serveur.')
        } finally {
            setSendingId(null)
        }
    }

    const onDownloadPdf = async (invoice: Invoice) => {
        const client = findClient(invoice.clientId)
        const blob = await pdf(<InvoicePDF invoice={invoice} client={client ?? null} />).toBlob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Facture-${invoice.number}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 04 ) — Factures</span>
                <h1 className="dash-h1">
                    L'état des <span className="serif-italic">comptes.</span>
                </h1>
                <p className="dash-sub">
                    PDF généré ici, envoi par mail en un clic.
                </p>
            </header>

            <section className="dash-grid dash-grid--2">
                <div className="dash-card">
                    <span className="dash-kicker">Total payé</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>{formatEur(paid)}</span>
                </div>
                <div className="dash-card">
                    <span className="dash-kicker">En attente</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: due > 0 ? 'var(--color-klein)' : 'var(--color-ink)' }}>
                        {formatEur(due)}
                    </span>
                </div>
            </section>

            {invoices.length === 0 ? (
                <EmptyState title="Aucune facture" body="Elles apparaîtront ici au fil du projet." />
            ) : (
                <section className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Projet</th>
                                    <th>Émise</th>
                                    <th>Échéance</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const project = findProject(invoice.projectId)
                                    const isSending = sendingId === invoice.id
                                    const wasSent = sentIds.has(invoice.id)
                                    return (
                                        <tr key={invoice.id}>
                                            <td className="dash-table__num">{invoice.number}</td>
                                            <td>{project?.name ?? '—'}</td>
                                            <td>{formatDate(invoice.issued)}</td>
                                            <td>{formatDate(invoice.due)}</td>
                                            <td className="dash-table__num">{formatEur(invoice.amount)}</td>
                                            <td><InvoiceStatusPill status={invoice.status} /></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="dash-row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                                                    <button
                                                        type="button"
                                                        className="dash-btn dash-btn--ghost"
                                                        style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                        onClick={() => onDownloadPdf(invoice)}
                                                    >
                                                        PDF
                                                    </button>
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            type="button"
                                                            className="dash-btn"
                                                            style={{
                                                                height: 34,
                                                                fontSize: 12,
                                                                padding: '0 14px',
                                                                background: wasSent ? 'var(--color-ink)' : undefined,
                                                            }}
                                                            disabled={isSending || wasSent}
                                                            onClick={() => onSendInvoice(invoice)}
                                                        >
                                                            {wasSent ? 'Envoyé ✓' : isSending ? 'Envoi…' : 'Envoyer'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}
