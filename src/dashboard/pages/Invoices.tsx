import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import { attachInvoicePdf, markInvoiceSent, updateInvoice } from '../firestore'
import { formatDate, formatEur } from '../utils'
import type { Invoice } from '../types'

export default function Invoices() {
    const { user } = useAuth()
    const { invoices, findProject, findClient, hasClientScope, error } = useDashboardData()
    const isAdmin = user?.role === 'admin'
    const location = useLocation()

    const [activeId, setActiveId] = useState<string | null>(null)
    const [previewId, setPreviewId] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewError, setPreviewError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(
        (location.state as { justSent?: string } | null)?.justSent
            ? `Facture ${(location.state as { justSent: string }).justSent} envoyée.`
            : null
    )

    useEffect(() => {
        if (!successMessage) return
        const t = setTimeout(() => setSuccessMessage(null), 5000)
        return () => clearTimeout(t)
    }, [successMessage])

    const paid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    const due = invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    const previewInvoice = invoices.find((invoice) => invoice.id === previewId) ?? invoices[0]

    useEffect(() => {
        if (!previewInvoice || isAdmin || !previewOpen) return

        let cancelled = false
        let objectUrl: string | null = null
        setPreviewUrl(null)
        setPreviewError(null)

        const buildPreview = async () => {
            try {
                if (previewInvoice.pdfUrl) {
                    if (!cancelled) setPreviewUrl(previewInvoice.pdfUrl)
                    return
                }

                if (previewInvoice.source !== 'generated') {
                    throw new Error('Aucun PDF disponible pour cette facture.')
                }

                const client = findClient(previewInvoice.clientId)
                const blob = await pdf(<InvoicePDF invoice={previewInvoice} client={client ?? null} />).toBlob()
                if (cancelled) return
                objectUrl = URL.createObjectURL(blob)
                setPreviewUrl(objectUrl)
            } catch (err) {
                if (!cancelled) {
                    setPreviewError(err instanceof Error ? err.message : 'Prévisualisation impossible.')
                }
            }
        }

        void buildPreview()

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [findClient, isAdmin, previewInvoice, previewOpen])

    const openPreview = (invoice: Invoice) => {
        setPreviewId(invoice.id)
        setPreviewOpen(true)
    }

    const closePreview = () => {
        setPreviewOpen(false)
        setPreviewError(null)
        setPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
            return null
        })
    }

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

            await markInvoiceSent(invoice.id)
            setSuccessMessage(`Facture ${invoice.number} envoyée à ${to}.`)
        } catch (err) {
            console.error('[invoices/send]', err)
            setSuccessMessage(null)
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
                        ? 'Création, envoi et suivi des règlements au même endroit.'
                        : 'Historique clair des règlements, avec aperçu disponible à la demande.'}
                </p>
            </header>

            {error && <div className="login__error">{error}</div>}
            {successMessage && (
                <div className="dash-banner dash-banner--success">{successMessage}</div>
            )}

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
            ) : !isAdmin ? (
                <section className="dash-invoice-client">
                    <div className="dash-invoice-client__list">
                        {invoices.map((invoice) => {
                            const project = findProject(invoice.projectId)
                            const selected = previewInvoice?.id === invoice.id
                            return (
                                <button
                                    key={invoice.id}
                                    type="button"
                                    className={`dash-invoice-client__item${selected && previewOpen ? ' is-active' : ''}`}
                                    onClick={() => openPreview(invoice)}
                                >
                                    <span className="dash-invoice-client__item-accent" />
                                    <span className="dash-invoice-client__item-main">
                                        <span className="dash-kicker">{invoice.number}</span>
                                        <strong>{invoice.title || project?.name || 'Facture'}</strong>
                                        <span>{project?.name ?? 'Projet'} · émise le {formatDate(invoice.issued)}</span>
                                    </span>
                                    <span className="dash-invoice-client__item-side">
                                        <strong>{formatEur(invoice.amount)}</strong>
                                        <InvoiceStatusPill status={invoice.status} />
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    {previewOpen && previewInvoice && (
                        <div className="dash-modal" role="dialog" aria-modal="true" aria-label={`Aperçu ${previewInvoice.number}`}>
                            <div className="dash-modal__backdrop" onClick={closePreview} />
                            <div className="dash-invoice-modal">
                                <div className="dash-invoice-client__preview-head">
                                    <div>
                                        <span className="dash-kicker">Prévisualisation</span>
                                        <h2>{previewInvoice.number}</h2>
                                    </div>
                                    <div className="dash-row" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="dash-btn dash-btn--ghost"
                                            style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                            onClick={() => onDownloadPdf(previewInvoice)}
                                        >
                                            PDF
                                        </button>
                                        <button
                                            type="button"
                                            className="dash-btn"
                                            style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                            onClick={closePreview}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                                <div className="dash-invoice-client__frame">
                                    {previewError ? (
                                        <div className="dash-invoice-client__empty">{previewError}</div>
                                    ) : previewUrl ? (
                                        <iframe title={`Aperçu ${previewInvoice.number}`} src={previewUrl} />
                                    ) : (
                                        <div className="dash-invoice-client__empty">Chargement de l'aperçu...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
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
                                    {isAdmin && <th>Envoyée</th>}
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
                                            {isAdmin && (
                                                <td style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>
                                                    {invoice.sentAt ? formatDate(invoice.sentAt) : '—'}
                                                </td>
                                            )}
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
                                                                {isActive ? 'Envoi…' : invoice.sentAt ? 'Renvoyer' : 'Envoyer'}
                                                            </button>
                                                            {invoice.status !== 'paid' && (
                                                                <button
                                                                    type="button"
                                                                    className="dash-btn dash-btn--ghost"
                                                                    style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                                    disabled={isActive}
                                                                    onClick={() => onMarkPaid(invoice)}
                                                                >
                                                                    {isActive ? 'Mise à jour…' : 'Marquer payée'}
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
