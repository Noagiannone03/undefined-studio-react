import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { EmptyState } from '../components/EmptyState'
import { InvoiceStatusPill } from '../components/StatusPill'
import { useDashboardData } from '../useDashboardData'
import { useAuth } from '../auth'
import { InvoicePDF } from '../invoice/InvoicePDF'
import { mailApi } from '../api'
import {
    blobToBase64,
    uploadInvoicePdf,
} from '../invoice/storage'
import { attachInvoicePdf, updateInvoice } from '../firestore'
import { formatDate, formatEur } from '../utils'
import type { Invoice } from '../types'

export default function Invoices() {
    const { user } = useAuth()
    const { invoices, findProject, findClient, hasClientScope, error } = useDashboardData()
    const isAdmin = user?.role === 'admin'

    const [activeId, setActiveId] = useState<string | null>(null)

    const paid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    const due = invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)

    const onSendInvoice = async (invoice: Invoice) => {
        const client = findClient(invoice.clientId)
        const to = client?.billingEmail ?? client?.contactEmail
        if (!to) {
            alert('Aucun email de facturation trouvé pour ce client.')
            return
        }
        if (invoice.source === 'uploaded' && !invoice.pdfUrl) {
            alert('PDF manquant pour cette facture importée.')
            return
        }

        setActiveId(invoice.id)
        try {
            let pdfBase64: string

            if (invoice.source === 'generated') {
                const blob = await pdf(<InvoicePDF invoice={invoice} client={client ?? null} />).toBlob()
                if (!invoice.storagePath) {
                    const stored = await uploadInvoicePdf({
                        clientId: invoice.clientId,
                        invoiceId: invoice.id,
                        blob,
                    })
                    await attachInvoicePdf(invoice.id, {
                        pdfUrl: stored.pdfUrl,
                        storagePath: stored.storagePath,
                    })
                }
                pdfBase64 = await blobToBase64(blob)
            } else {
                const res = await fetch(invoice.pdfUrl as string)
                if (!res.ok) throw new Error('Impossible de récupérer le PDF stocké.')
                const blob = await res.blob()
                pdfBase64 = await blobToBase64(blob)
            }

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

            if (invoice.status === 'draft') {
                await updateInvoice(invoice.id, {
                    clientId: invoice.clientId,
                    projectId: invoice.projectId || undefined,
                    number: invoice.number,
                    title: invoice.title,
                    items: invoice.items,
                    terms: invoice.terms,
                    status: 'due',
                    issued: invoice.issued,
                    due: invoice.due,
                    source: invoice.source,
                    amount: invoice.source === 'uploaded' ? invoice.amount : undefined,
                    notes: invoice.notes,
                })
            }
        } catch (err) {
            console.error('[invoices/send]', err)
            alert(err instanceof Error ? err.message : 'Échec de l\'envoi.')
        } finally {
            setActiveId(null)
        }
    }

    const onMarkPaid = async (invoice: Invoice) => {
        setActiveId(invoice.id)
        try {
            await updateInvoice(invoice.id, {
                clientId: invoice.clientId,
                projectId: invoice.projectId || undefined,
                number: invoice.number,
                title: invoice.title,
                items: invoice.items,
                terms: invoice.terms,
                status: 'paid',
                issued: invoice.issued,
                due: invoice.due,
                source: invoice.source,
                amount: invoice.source === 'uploaded' ? invoice.amount : undefined,
                notes: invoice.notes,
            })
        } catch (err) {
            console.error('[invoices/mark-paid]', err)
            alert(err instanceof Error ? err.message : 'Impossible de mettre la facture à jour.')
        } finally {
            setActiveId(null)
        }
    }

    const onDownloadPdf = async (invoice: Invoice) => {
        if (invoice.pdfUrl) {
            window.open(invoice.pdfUrl, '_blank', 'noopener')
            return
        }
        if (invoice.source === 'generated') {
            const client = findClient(invoice.clientId)
            const blob = await pdf(<InvoicePDF invoice={invoice} client={client ?? null} />).toBlob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Facture-${invoice.number}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    if (!isAdmin && !hasClientScope) {
        return (
            <div className="dash-stack-lg">
                <header className="dash-page-head">
                    <span className="dash-kicker">( 04 ) — Factures</span>
                    <h1 className="dash-h1">L'état des <span className="serif-italic">comptes.</span></h1>
                </header>
                <EmptyState
                    title="Compte pas encore relié"
                    body="Ton compte n'est pas encore associé à un dossier client. Contacte le studio pour activer l'accès."
                />
            </div>
        )
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 04 ) — Factures</span>
                <div className="dash-row-between" style={{ alignItems: 'flex-end' }}>
                    <h1 className="dash-h1">
                        L'état des <span className="serif-italic">comptes.</span>
                    </h1>
                    {isAdmin && (
                        <div className="dash-row" style={{ gap: 8 }}>
                            <Link to="/invoices/new?mode=generated" className="dash-btn">+ Nouvelle facture</Link>
                            <Link to="/invoices/new?mode=uploaded" className="dash-btn dash-btn--ghost">Uploader une ancienne facture</Link>
                        </div>
                    )}
                </div>
                <p className="dash-sub">
                    {isAdmin
                        ? 'Crée une nouvelle facture ou archive une facture déjà émise. Les PDF sont stockés sur Firebase Storage.'
                        : 'Toutes tes factures, téléchargeables en un clic.'}
                </p>
            </header>

            {error && <div className="login__error">{error}</div>}

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
                <EmptyState
                    title="Aucune facture"
                    body={isAdmin
                        ? 'Crée une nouvelle facture ou importe une facture déjà émise.'
                        : 'Tes factures apparaîtront ici dès qu\'elles seront émises.'}
                    action={isAdmin && <Link to="/invoices/new?mode=generated" className="dash-btn" style={{ marginTop: 12 }}>+ Nouvelle facture</Link>}
                />
            ) : (
                <section className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    {isAdmin && <th>Client</th>}
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
                                    const client = isAdmin ? findClient(invoice.clientId) : null
                                    const isActive = activeId === invoice.id
                                    return (
                                        <tr key={invoice.id}>
                                            <td className="dash-table__num">
                                                {isAdmin ? (
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        style={{ textDecoration: 'underline', color: 'inherit' }}
                                                    >
                                                        {invoice.number}
                                                    </Link>
                                                ) : (
                                                    invoice.number
                                                )}
                                            </td>
                                            {isAdmin && <td>{client?.name ?? '—'}</td>}
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
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="dash-btn"
                                                                style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                                disabled={isActive}
                                                                onClick={() => onSendInvoice(invoice)}
                                                            >
                                                                {isActive ? 'Envoi…' : 'Envoyer'}
                                                            </button>
                                                            {invoice.status !== 'paid' && (
                                                                <button
                                                                    type="button"
                                                                    className="dash-btn dash-btn--ghost"
                                                                    style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                                    disabled={isActive}
                                                                    onClick={() => onMarkPaid(invoice)}
                                                                >
                                                                    {isActive ? 'MAJ…' : 'Payée'}
                                                                </button>
                                                            )}
                                                        </>
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
