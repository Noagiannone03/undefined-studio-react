import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
    Svg,
    Path,
} from '@react-pdf/renderer'
import type { Client, Invoice } from '../types'
import { STUDIO_PROFILE } from './StudioProfile'
import { formatInvoiceDate, formatInvoiceEur } from './format'

const COLORS = {
    ink: '#0E0E0C',
    paper: '#EFEBDD',
    paper2: '#E6E1D0',
    hair: '#CFC8B8',
    soft: '#3A3A38',
    mute: '#6E6A61',
    klein: '#1D1DBF',
    tomato: '#E84A2A',
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        padding: 56,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.45,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 30,
        lineHeight: 1.06,
        letterSpacing: -0.5,
        maxWidth: 380,
    },
    mark: { width: 74, height: 52 },

    metaBlock: { marginBottom: 18 },
    metaLine: { fontSize: 10, color: COLORS.ink },
    metaLabel: { fontFamily: 'Helvetica-Bold' },

    divider: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.ink,
        marginVertical: 6,
    },

    parties: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 28,
        marginBottom: 36,
        gap: 24,
    },
    partyCol: { width: '48%' },
    partyColRight: { width: '48%', textAlign: 'right' },
    partyKicker: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        letterSpacing: 1,
        marginBottom: 8,
    },
    partyLine: { fontSize: 10, color: COLORS.ink, marginBottom: 1 },

    table: {
        borderWidth: 1,
        borderColor: COLORS.hair,
        backgroundColor: COLORS.paper,
        marginBottom: 28,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.hair,
        minHeight: 38,
    },
    tableRowLast: { borderBottomWidth: 0 },
    tableHead: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        letterSpacing: 0.6,
    },
    cellDesc: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: COLORS.hair,
        textAlign: 'center',
        justifyContent: 'center',
    },
    cellAmount: {
        width: 160,
        paddingVertical: 12,
        paddingHorizontal: 16,
        textAlign: 'center',
        justifyContent: 'center',
    },
    cellAmountValue: {
        fontFamily: 'Helvetica-Bold',
    },

    totalBar: {
        backgroundColor: COLORS.paper2,
        borderTopWidth: 2,
        borderTopColor: COLORS.klein,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 24,
    },
    totalLabel: {
        color: COLORS.ink,
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    totalValue: {
        color: COLORS.ink,
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        minWidth: 90,
        textAlign: 'right',
    },

    footer: { marginTop: 56 },
    footerTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginBottom: 8,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
        fontSize: 10,
        color: COLORS.ink,
    },
    footerBullet: { width: 12 },
    footerText: { flex: 1, lineHeight: 1.5 },
    footerVat: {
        marginTop: 14,
        fontSize: 9,
        color: COLORS.mute,
    },
})

function UndefinedMark() {
    return (
        <Svg style={styles.mark} viewBox="0 0 40 28">
            <Path
                d="M2 2L16 14L2 26"
                stroke={COLORS.tomato}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M18 2L32 14L18 26"
                stroke={COLORS.klein}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

type InvoicePDFProps = {
    invoice: Invoice
    client: Client | null
}

export function InvoicePDF({ invoice, client }: InvoicePDFProps) {
    const total = invoice.items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0)
    const items = invoice.items.length > 0 ? invoice.items : [{ id: 'empty', description: '—', amount: invoice.amount }]

    return (
        <Document
            title={invoice.number || 'Facture'}
            author={STUDIO_PROFILE.name}
            subject={invoice.title}
            creator="Undefined Studio"
        >
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{invoice.title || 'Facture'}</Text>
                    <UndefinedMark />
                </View>

                {/* Date + numéro */}
                <View style={styles.metaBlock}>
                    <Text style={styles.metaLine}>
                        <Text style={styles.metaLabel}>Date</Text>
                        {' : '}
                        {formatInvoiceDate(invoice.issued)}
                    </Text>
                    <Text style={styles.metaLine}>Facture n° {invoice.number}</Text>
                </View>

                <View style={styles.divider} />

                {/* Émetteur / Destinataire */}
                <View style={styles.parties}>
                    <View style={styles.partyCol}>
                        <Text style={styles.partyKicker}>{STUDIO_PROFILE.name}</Text>
                        <Text style={styles.partyLine}>{STUDIO_PROFILE.phone}</Text>
                        <Text style={styles.partyLine}>{STUDIO_PROFILE.email}</Text>
                        <Text style={styles.partyLine}>{STUDIO_PROFILE.website}</Text>
                        <Text style={styles.partyLine}>{STUDIO_PROFILE.address}</Text>
                        <Text style={styles.partyLine}>{STUDIO_PROFILE.legalForm}</Text>
                        <Text style={styles.partyLine}>SIRET : {STUDIO_PROFILE.siret}</Text>
                    </View>
                    <View style={styles.partyColRight}>
                        <Text style={styles.partyKicker}>À L'ATTENTION DE</Text>
                        <Text style={styles.partyLine}>{client?.name ?? '—'}</Text>
                        {client?.address ? <Text style={styles.partyLine}>{client.address}</Text> : null}
                        {client?.billingEmail || client?.contactEmail ? (
                            <Text style={styles.partyLine}>{client.billingEmail || client.contactEmail}</Text>
                        ) : null}
                    </View>
                </View>

                {/* Tableau */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.cellDesc}>
                            <Text style={styles.tableHead}>DESCRIPTION</Text>
                        </View>
                        <View style={styles.cellAmount}>
                            <Text style={styles.tableHead}>MONTANT HT</Text>
                        </View>
                    </View>
                    {items.map((item, i) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                i === items.length - 1 ? styles.tableRowLast : {},
                            ]}
                        >
                            <View style={styles.cellDesc}>
                                <Text>{item.description || '—'}</Text>
                            </View>
                            <View style={styles.cellAmount}>
                                <Text style={styles.cellAmountValue}>{formatInvoiceEur(item.amount)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bandeau total */}
                <View style={styles.totalBar}>
                    <Text style={styles.totalLabel}>TOTAL TTC :</Text>
                    <Text style={styles.totalValue}>{formatInvoiceEur(total)}</Text>
                </View>

                {/* Termes et conditions */}
                {invoice.terms.length > 0 ? (
                    <View style={styles.footer}>
                        <Text style={styles.footerTitle}>Termes et conditions</Text>
                        {invoice.terms.map((line, i) => (
                            <View key={i} style={styles.footerItem}>
                                <Text style={styles.footerBullet}>•</Text>
                                <Text style={styles.footerText}>{line}</Text>
                            </View>
                        ))}
                        <Text style={styles.footerVat}>{STUDIO_PROFILE.vatMention}</Text>
                    </View>
                ) : (
                    <View style={styles.footer}>
                        <Text style={styles.footerVat}>{STUDIO_PROFILE.vatMention}</Text>
                    </View>
                )}
            </Page>
        </Document>
    )
}
