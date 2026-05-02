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

type PdfDensity = {
    pagePadding: number
    baseFontSize: number
    lineHeight: number
    headerMargin: number
    titleSize: number
    titleWidth: number
    markWidth: number
    markHeight: number
    metaMargin: number
    partiesTop: number
    partiesBottom: number
    partyKickerSize: number
    partyKickerMargin: number
    partyLineSize: number
    tableMargin: number
    rowMinHeight: number
    cellPadY: number
    cellPadX: number
    amountWidth: number
    tableHeadSize: number
    totalPadY: number
    totalPadX: number
    totalLabelSize: number
    totalValueSize: number
    footerTop: number
    footerTitleSize: number
    footerTitleMargin: number
    footerItemMargin: number
    footerTextSize: number
    footerVatTop: number
    footerVatSize: number
}

function estimateTextLines(text: string | undefined, charsPerLine: number): number {
    const clean = (text ?? '').trim()
    if (!clean) return 1
    return Math.max(1, Math.ceil(clean.length / charsPerLine))
}

function getPdfDensity(invoice: Invoice, client: Client | null): PdfDensity {
    const itemLines = Math.max(1, invoice.items.length) +
        invoice.items.reduce((sum, item) => sum + Math.max(0, estimateTextLines(item.description, 62) - 1), 0)
    const termLines = invoice.terms.reduce((sum, term) => sum + estimateTextLines(term, 86), 0)
    const clientLines = 1 +
        (client?.address ? estimateTextLines(client.address, 42) : 0) +
        (client?.billingEmail || client?.contactEmail ? 1 : 0) +
        (client?.phone ? 1 : 0)
    const densityScore = itemLines * 1.35 + termLines * 0.9 + clientLines * 0.35

    if (densityScore >= 17 || invoice.items.length >= 9 || termLines >= 8) {
        return {
            pagePadding: 28,
            baseFontSize: 8.2,
            lineHeight: 1.18,
            headerMargin: 10,
            titleSize: 21,
            titleWidth: 410,
            markWidth: 52,
            markHeight: 36,
            metaMargin: 8,
            partiesTop: 12,
            partiesBottom: 14,
            partyKickerSize: 7.6,
            partyKickerMargin: 3,
            partyLineSize: 7.8,
            tableMargin: 12,
            rowMinHeight: 25,
            cellPadY: 6,
            cellPadX: 10,
            amountWidth: 124,
            tableHeadSize: 8,
            totalPadY: 8,
            totalPadX: 14,
            totalLabelSize: 9,
            totalValueSize: 10.5,
            footerTop: 16,
            footerTitleSize: 8.4,
            footerTitleMargin: 4,
            footerItemMargin: 2,
            footerTextSize: 7.8,
            footerVatTop: 8,
            footerVatSize: 7.2,
        }
    }

    if (densityScore >= 11 || invoice.items.length >= 6 || termLines >= 5) {
        return {
            pagePadding: 38,
            baseFontSize: 9,
            lineHeight: 1.28,
            headerMargin: 14,
            titleSize: 25,
            titleWidth: 400,
            markWidth: 60,
            markHeight: 42,
            metaMargin: 10,
            partiesTop: 16,
            partiesBottom: 20,
            partyKickerSize: 8.2,
            partyKickerMargin: 5,
            partyLineSize: 8.6,
            tableMargin: 16,
            rowMinHeight: 30,
            cellPadY: 8,
            cellPadX: 12,
            amountWidth: 138,
            tableHeadSize: 8.8,
            totalPadY: 10,
            totalPadX: 16,
            totalLabelSize: 10,
            totalValueSize: 12,
            footerTop: 24,
            footerTitleSize: 9,
            footerTitleMargin: 5,
            footerItemMargin: 3,
            footerTextSize: 8.4,
            footerVatTop: 10,
            footerVatSize: 8,
        }
    }

    return {
        pagePadding: 56,
        baseFontSize: 10,
        lineHeight: 1.45,
        headerMargin: 24,
        titleSize: 30,
        titleWidth: 380,
        markWidth: 74,
        markHeight: 52,
        metaMargin: 18,
        partiesTop: 28,
        partiesBottom: 36,
        partyKickerSize: 9,
        partyKickerMargin: 8,
        partyLineSize: 10,
        tableMargin: 28,
        rowMinHeight: 38,
        cellPadY: 12,
        cellPadX: 16,
        amountWidth: 160,
        tableHeadSize: 10,
        totalPadY: 14,
        totalPadX: 20,
        totalLabelSize: 12,
        totalValueSize: 14,
        footerTop: 56,
        footerTitleSize: 10,
        footerTitleMargin: 8,
        footerItemMargin: 4,
        footerTextSize: 10,
        footerVatTop: 14,
        footerVatSize: 9,
    }
}

function UndefinedMark({ density }: { density: PdfDensity }) {
    return (
        <Svg style={[styles.mark, { width: density.markWidth, height: density.markHeight }]} viewBox="0 0 40 28">
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

function cleanPartyLine(value: string | undefined): string {
    return (value ?? '').trim().replace(/[,\s]+$/g, '')
}

export function InvoicePDF({ invoice, client }: InvoicePDFProps) {
    const total = invoice.items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0)
    const items = invoice.items.length > 0 ? invoice.items : [{ id: 'empty', description: '—', amount: invoice.amount }]
    const clientEmail = cleanPartyLine(client?.billingEmail || client?.contactEmail)
    const clientPhone = cleanPartyLine(client?.phone)
    const density = getPdfDensity(invoice, client)

    return (
        <Document
            title={invoice.number || 'Facture'}
            author={STUDIO_PROFILE.name}
            subject={invoice.title}
            creator="Undefined Studio"
        >
            <Page
                size="A4"
                wrap={false}
                style={[
                    styles.page,
                    {
                        padding: density.pagePadding,
                        fontSize: density.baseFontSize,
                        lineHeight: density.lineHeight,
                    },
                ]}
            >
                {/* Header */}
                <View style={[styles.headerRow, { marginBottom: density.headerMargin }]}>
                    <Text style={[styles.title, { fontSize: density.titleSize, maxWidth: density.titleWidth }]}>{invoice.title || 'Facture'}</Text>
                    <UndefinedMark density={density} />
                </View>

                {/* Date + numéro */}
                <View style={[styles.metaBlock, { marginBottom: density.metaMargin }]}>
                    <Text style={[styles.metaLine, { fontSize: density.baseFontSize }]}>
                        <Text style={styles.metaLabel}>Date</Text>
                        {' : '}
                        {formatInvoiceDate(invoice.issued)}
                    </Text>
                    <Text style={[styles.metaLine, { fontSize: density.baseFontSize }]}>Facture n° {invoice.number}</Text>
                </View>

                <View style={styles.divider} />

                {/* Émetteur / Destinataire */}
                <View style={[styles.parties, { marginTop: density.partiesTop, marginBottom: density.partiesBottom }]}>
                    <View style={styles.partyCol}>
                        <Text style={[styles.partyKicker, { fontSize: density.partyKickerSize, marginBottom: density.partyKickerMargin }]}>{STUDIO_PROFILE.name}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{cleanPartyLine(STUDIO_PROFILE.phone)}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{STUDIO_PROFILE.email}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{STUDIO_PROFILE.website}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{STUDIO_PROFILE.address}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{STUDIO_PROFILE.legalForm}</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>SIRET : {STUDIO_PROFILE.siret}</Text>
                    </View>
                    <View style={styles.partyColRight}>
                        <Text style={[styles.partyKicker, { fontSize: density.partyKickerSize, marginBottom: density.partyKickerMargin }]}>À L'ATTENTION DE</Text>
                        <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{client?.name ?? '—'}</Text>
                        {client?.address ? <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{cleanPartyLine(client.address)}</Text> : null}
                        {clientEmail ? <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{clientEmail}</Text> : null}
                        {clientPhone ? <Text style={[styles.partyLine, { fontSize: density.partyLineSize }]}>{clientPhone}</Text> : null}
                    </View>
                </View>

                {/* Tableau */}
                <View style={[styles.table, { marginBottom: density.tableMargin }]}>
                    <View style={[styles.tableRow, { minHeight: density.rowMinHeight }]}>
                        <View style={[styles.cellDesc, { paddingVertical: density.cellPadY, paddingHorizontal: density.cellPadX }]}>
                            <Text style={[styles.tableHead, { fontSize: density.tableHeadSize }]}>DESCRIPTION</Text>
                        </View>
                        <View style={[styles.cellAmount, { width: density.amountWidth, paddingVertical: density.cellPadY, paddingHorizontal: density.cellPadX }]}>
                            <Text style={[styles.tableHead, { fontSize: density.tableHeadSize }]}>MONTANT HT</Text>
                        </View>
                    </View>
                    {items.map((item, i) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                { minHeight: density.rowMinHeight },
                                i === items.length - 1 ? styles.tableRowLast : {},
                            ]}
                        >
                            <View style={[styles.cellDesc, { paddingVertical: density.cellPadY, paddingHorizontal: density.cellPadX }]}>
                                <Text>{item.description || '—'}</Text>
                            </View>
                            <View style={[styles.cellAmount, { width: density.amountWidth, paddingVertical: density.cellPadY, paddingHorizontal: density.cellPadX }]}>
                                <Text style={styles.cellAmountValue}>{formatInvoiceEur(item.amount)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bandeau total */}
                <View style={[styles.totalBar, { paddingVertical: density.totalPadY, paddingHorizontal: density.totalPadX }]}>
                    <Text style={[styles.totalLabel, { fontSize: density.totalLabelSize }]}>TOTAL TTC :</Text>
                    <Text style={[styles.totalValue, { fontSize: density.totalValueSize }]}>{formatInvoiceEur(total)}</Text>
                </View>

                {/* Termes et conditions */}
                {invoice.terms.length > 0 ? (
                    <View style={[styles.footer, { marginTop: density.footerTop }]}>
                        <Text style={[styles.footerTitle, { fontSize: density.footerTitleSize, marginBottom: density.footerTitleMargin }]}>Termes et conditions</Text>
                        {invoice.terms.map((line, i) => (
                            <View key={i} style={[styles.footerItem, { marginBottom: density.footerItemMargin, fontSize: density.footerTextSize }]}>
                                <Text style={[styles.footerBullet, { width: density.footerTextSize + 2 }]}>•</Text>
                                <Text style={[styles.footerText, { fontSize: density.footerTextSize, lineHeight: density.lineHeight }]}>{line}</Text>
                            </View>
                        ))}
                        <Text style={[styles.footerVat, { marginTop: density.footerVatTop, fontSize: density.footerVatSize }]}>{STUDIO_PROFILE.vatMention}</Text>
                    </View>
                ) : (
                    <View style={[styles.footer, { marginTop: density.footerTop }]}>
                        <Text style={[styles.footerVat, { marginTop: density.footerVatTop, fontSize: density.footerVatSize }]}>{STUDIO_PROFILE.vatMention}</Text>
                    </View>
                )}
            </Page>
        </Document>
    )
}
