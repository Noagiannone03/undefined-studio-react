import { motion } from 'motion/react'
import { INVOICES, findProject } from '../data'
import { InvoiceStatusPill } from '../components/StatusPill'
import { EmptyState } from '../components/EmptyState'

const EXPO = [0.16, 1, 0.3, 1] as const

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
function formatEur(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function Invoices() {
    const paid = INVOICES.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const due = INVOICES.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <span className="dash-kicker">( 04 ) — Factures</span>
                <h1 className="dash-h1">
                    L'état des <span className="serif-italic">comptes.</span>
                </h1>
                <p className="dash-sub">
                    Chaque facture est émise à la fin d'une étape. Les paiements se font en virement — le RIB est en pied de facture.
                </p>
            </header>

            <section className="dash-grid dash-grid--2">
                <motion.div
                    className="dash-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EXPO }}
                >
                    <span className="dash-kicker">Total payé</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>{formatEur(paid)}</span>
                </motion.div>
                <motion.div
                    className="dash-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EXPO, delay: 0.05 }}
                >
                    <span className="dash-kicker">En attente</span>
                    <span className="dash-h1" style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: due > 0 ? 'var(--color-klein)' : 'var(--color-ink)' }}>
                        {formatEur(due)}
                    </span>
                </motion.div>
            </section>

            {INVOICES.length === 0 ? (
                <EmptyState title="Aucune facture" body="Elles apparaîtront ici au fil du projet." />
            ) : (
                <section className="dash-card" style={{ padding: 0, overflow: 'auto' }}>
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
                            {INVOICES.map((i) => {
                                const p = findProject(i.project)
                                return (
                                    <tr key={i.id}>
                                        <td className="dash-table__num">{i.number}</td>
                                        <td>{p?.name ?? '—'}</td>
                                        <td>{formatDate(i.issued)}</td>
                                        <td>{formatDate(i.due)}</td>
                                        <td className="dash-table__num">{formatEur(i.amount)}</td>
                                        <td><InvoiceStatusPill status={i.status} /></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                className="dash-btn dash-btn--ghost"
                                                style={{ height: 34, fontSize: 12, padding: '0 14px' }}
                                                onClick={() => alert('Téléchargement PDF — branche back à venir.')}
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    )
}
