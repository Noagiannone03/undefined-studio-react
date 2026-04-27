import { EmptyState } from '../components/EmptyState'
import { InvoiceStatusPill } from '../components/StatusPill'
import { useDashboardData } from '../useDashboardData'
import { formatDate, formatEur } from '../utils'

export default function Invoices() {
    const { invoices, findProject } = useDashboardData()
    const paid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    const due = invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 04 ) — Factures</span>
                <h1 className="dash-h1">
                    L'état des <span className="serif-italic">comptes.</span>
                </h1>
                <p className="dash-sub">
                    Chaque facture est rattachée à un projet. Si tu ajoutes plus tard une URL PDF dans Firestore, le bouton de téléchargement l’utilisera directement.
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
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const project = findProject(invoice.projectId)
                                    return (
                                        <tr key={invoice.id}>
                                            <td className="dash-table__num">{invoice.number}</td>
                                            <td>{project?.name ?? '—'}</td>
                                            <td>{formatDate(invoice.issued)}</td>
                                            <td>{formatDate(invoice.due)}</td>
                                            <td className="dash-table__num">{formatEur(invoice.amount)}</td>
                                            <td><InvoiceStatusPill status={invoice.status} /></td>
                                            <td style={{ textAlign: 'right' }}>
                                                {invoice.pdfUrl ? (
                                                    <a
                                                        href={invoice.pdfUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="dash-btn dash-btn--ghost"
                                                        style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                    >
                                                        PDF
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="dash-btn dash-btn--ghost"
                                                        style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                        onClick={() => alert('Ajoute `pdfUrl` sur la facture Firestore pour activer le téléchargement.')}
                                                    >
                                                        PDF
                                                    </button>
                                                )}
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
