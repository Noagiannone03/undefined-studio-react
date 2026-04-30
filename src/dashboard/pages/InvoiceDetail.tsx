import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { useAuth } from '../auth'
import { useDashboardData } from '../useDashboardData'
import { InvoiceStatusPill } from '../components/StatusPill'
import { SaveIndicator } from '../components/SaveIndicator'
import { useAutoSave } from '../components/useAutoSave'
import { InvoicePDF } from '../invoice/InvoicePDF'
import { DEFAULT_TERMS, suggestInvoiceNumber, suggestInvoiceTitle } from '../invoice/numbering'
import {
    blobToBase64,
    deleteInvoicePdf,
    uploadInvoicePdf,
} from '../invoice/storage'
import {
    attachInvoicePdf,
    createInvoice,
    deleteInvoice as deleteInvoiceDoc,
    sumInvoiceItems,
    updateInvoice,
} from '../firestore'
import { mailApi } from '../api'
import { formatEur } from '../utils'
import type { Invoice, InvoiceItem, InvoiceSource, InvoiceStatus } from '../types'

const MAX_PDF_BYTES = 10 * 1024 * 1024

const STATUS_OPTIONS: { value: InvoiceStatus; label: string; tone: 'mute' | 'klein' | 'tomato' | 'ink' }[] = [
    { value: 'draft', label: 'Brouillon', tone: 'mute' },
    { value: 'due', label: 'À régler', tone: 'klein' },
    { value: 'overdue', label: 'En retard', tone: 'tomato' },
    { value: 'paid', label: 'Payée', tone: 'ink' },
]

type Mode = 'new' | 'edit'

type EditableInvoice = {
    clientId: string
    projectId: string
    number: string
    title: string
    items: InvoiceItem[]
    terms: string[]
    status: InvoiceStatus
    issued: string
    due: string
    notes: string
    amount: number // only used when source='uploaded'
}

function isoToday(): string {
    return new Date().toISOString().slice(0, 10)
}

function isoPlusDays(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

function emptyItem(): InvoiceItem {
    return { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: '', amount: 0 }
}

function invoicesAreEqual(a: EditableInvoice, b: EditableInvoice): boolean {
    if (
        a.clientId !== b.clientId ||
        a.projectId !== b.projectId ||
        a.number !== b.number ||
        a.title !== b.title ||
        a.status !== b.status ||
        a.issued !== b.issued ||
        a.due !== b.due ||
        a.notes !== b.notes ||
        a.amount !== b.amount ||
        a.items.length !== b.items.length ||
        a.terms.length !== b.terms.length
    ) {
        return false
    }
    for (let i = 0; i < a.items.length; i++) {
        if (
            a.items[i].id !== b.items[i].id ||
            a.items[i].description !== b.items[i].description ||
            a.items[i].amount !== b.items[i].amount
        ) return false
    }
    for (let i = 0; i < a.terms.length; i++) {
        if (a.terms[i] !== b.terms[i]) return false
    }
    return true
}

function buildPreviewInvoice(draft: EditableInvoice, id: string, source: InvoiceSource): Invoice {
    return {
        id,
        clientId: draft.clientId,
        number: draft.number || 'BROUILLON',
        projectId: draft.projectId,
        title: draft.title,
        items: draft.items,
        terms: draft.terms,
        amount: source === 'uploaded' ? draft.amount : sumInvoiceItems(draft.items),
        status: draft.status,
        issued: draft.issued,
        due: draft.due,
        source,
        notes: draft.notes,
    }
}

export default function InvoiceDetail() {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { invoices, clients, projects, findClient } = useDashboardData()

    const isAdmin = user?.role === 'admin'
    const mode: Mode = id ? 'edit' : 'new'
    const existing = mode === 'edit' ? invoices.find((inv) => inv.id === id) : undefined

    // ── Mode tab (only matters in 'new' mode); for 'edit' it's locked to the existing invoice's source
    const requestedMode = searchParams.get('mode')
    const requestedTab: InvoiceSource = requestedMode === 'uploaded' ? 'uploaded' : 'generated'

    const [tab, setTab] = useState<InvoiceSource>(existing?.source ?? requestedTab)
    useEffect(() => {
        if (existing) {
            setTab(existing.source)
            return
        }
        if (mode === 'new') setTab(requestedTab)
    }, [existing, mode, requestedTab])

    const [draft, setDraft] = useState<EditableInvoice>(() => {
        if (existing) {
            return {
                clientId: existing.clientId,
                projectId: existing.projectId,
                number: existing.number,
                title: existing.title,
                items: existing.items.length > 0 ? existing.items : [emptyItem()],
                terms: existing.terms.length > 0 ? existing.terms : DEFAULT_TERMS,
                status: existing.status,
                issued: existing.issued || isoToday(),
                due: existing.due || isoPlusDays(30),
                notes: existing.notes ?? '',
                amount: existing.amount,
            }
        }
        const prefilledClient = searchParams.get('client') ?? ''
        const prefilledProject = searchParams.get('project') ?? ''
        return {
            clientId: prefilledClient || clients[0]?.id || '',
            projectId: prefilledProject,
            number: '',
            title: '',
            items: [emptyItem()],
            terms: [...DEFAULT_TERMS],
            status: 'draft',
            issued: isoToday(),
            due: isoPlusDays(30),
            notes: '',
            amount: 0,
        }
    })

    // ── Upload mode state (only relevant when tab='uploaded' and mode='new')
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [actionRunning, setActionRunning] = useState<null | 'send' | 'pay' | 'download' | 'delete' | 'upload'>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Auto-fill number/title for new generated invoices
    useEffect(() => {
        if (mode !== 'new' || tab !== 'generated') return
        if (!draft.clientId) return
        const client = clients.find((c) => c.id === draft.clientId)
        if (!client) return
        if (!draft.number) {
            const next = suggestInvoiceNumber({ client, issued: draft.issued, invoices })
            setDraft((prev) => ({ ...prev, number: next }))
        }
        if (!draft.title) {
            const t = suggestInvoiceTitle({ issued: draft.issued })
            setDraft((prev) => ({ ...prev, title: t }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.clientId, draft.issued, mode, tab])

    // ── Adopt server state when snapshot changes (existing invoice updated remotely)
    useEffect(() => {
        if (!existing) return
        setDraft({
            clientId: existing.clientId,
            projectId: existing.projectId,
            number: existing.number,
            title: existing.title,
            items: existing.items.length > 0 ? existing.items : [emptyItem()],
            terms: existing.terms.length > 0 ? existing.terms : DEFAULT_TERMS,
            status: existing.status,
            issued: existing.issued || isoToday(),
            due: existing.due || isoPlusDays(30),
            notes: existing.notes ?? '',
            amount: existing.amount,
        })
    }, [existing])

    const previewInvoice = useMemo(
        () => buildPreviewInvoice(draft, existing?.id ?? 'preview', existing?.source ?? tab),
        [draft, existing?.id, existing?.source, tab],
    )
    const previewClient = findClient(draft.clientId) ?? null

    // ── Live PDF preview (only for generated invoices and in edit-mode with generated source)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const showLivePreview = (existing?.source ?? tab) === 'generated'
    useEffect(() => {
        if (!showLivePreview) {
            setPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
            return
        }
        let revoked = false
        let currentUrl: string | null = null
        const handle = setTimeout(async () => {
            try {
                const blob = await pdf(<InvoicePDF invoice={previewInvoice} client={previewClient} />).toBlob()
                if (revoked) return
                currentUrl = URL.createObjectURL(blob)
                setPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return currentUrl
                })
            } catch (err) {
                console.error('[invoice-preview] failed', err)
            }
        }, 600)

        return () => {
            revoked = true
            clearTimeout(handle)
            if (currentUrl) URL.revokeObjectURL(currentUrl)
        }
    }, [previewInvoice, previewClient, showLivePreview])

    const { state: saveState, errorMessage: saveError, adopt: adoptDraft } = useAutoSave<EditableInvoice>({
        value: draft,
        enabled: isAdmin && mode === 'edit' && Boolean(existing),
        isEqual: invoicesAreEqual,
        onSave: async (next) => {
            if (!existing) return
            await updateInvoice(existing.id, {
                clientId: next.clientId,
                projectId: next.projectId || undefined,
                number: next.number,
                title: next.title,
                items: next.items,
                terms: next.terms,
                status: next.status,
                issued: next.issued,
                due: next.due,
                source: existing.source,
                amount: existing.source === 'uploaded' ? next.amount : undefined,
                notes: next.notes,
            })
        },
    })

    useEffect(() => {
        if (existing) {
            adoptDraft({
                clientId: existing.clientId,
                projectId: existing.projectId,
                number: existing.number,
                title: existing.title,
                items: existing.items.length > 0 ? existing.items : [emptyItem()],
                terms: existing.terms.length > 0 ? existing.terms : DEFAULT_TERMS,
                status: existing.status,
                issued: existing.issued || isoToday(),
                due: existing.due || isoPlusDays(30),
                notes: existing.notes ?? '',
                amount: existing.amount,
            })
        }
    }, [adoptDraft, existing])

    if (!isAdmin) {
        return (
            <div className="dash-card">
                <h2 className="dash-h2">Accès admin uniquement</h2>
                <Link to="/invoices" className="dash-btn" style={{ alignSelf: 'flex-start', marginTop: 12 }}>
                    ← Retour
                </Link>
            </div>
        )
    }

    if (mode === 'edit' && !existing) {
        return (
            <div className="dash-card">
                <span className="dash-kicker">Facture introuvable</span>
                <h1 className="dash-h2">Cette facture n'existe pas (encore).</h1>
                <Link to="/invoices" className="dash-btn" style={{ alignSelf: 'flex-start', marginTop: 12 }}>
                    ← Retour aux factures
                </Link>
            </div>
        )
    }

    const totalHT = sumInvoiceItems(draft.items)
    const projectsForClient = projects.filter((p) => p.clientId === draft.clientId)
    const breadcrumbClient = findClient(draft.clientId)
    const breadcrumbProject = projects.find((p) => p.id === draft.projectId)

    const patch = (p: Partial<EditableInvoice>) => setDraft((prev) => ({ ...prev, ...p }))

    const updateItem = (idx: number, p: Partial<InvoiceItem>) => {
        setDraft((prev) => ({
            ...prev,
            items: prev.items.map((item, i) => (i === idx ? { ...item, ...p } : item)),
        }))
    }
    const addItem = () => setDraft((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
    const removeItem = (idx: number) => {
        setDraft((prev) => ({
            ...prev,
            items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== idx) : prev.items,
        }))
    }
    const updateTerm = (idx: number, value: string) => {
        setDraft((prev) => ({ ...prev, terms: prev.terms.map((t, i) => (i === idx ? value : t)) }))
    }
    const addTerm = () => setDraft((prev) => ({ ...prev, terms: [...prev.terms, ''] }))
    const removeTerm = (idx: number) => {
        setDraft((prev) => ({ ...prev, terms: prev.terms.filter((_, i) => i !== idx) }))
    }

    const generateBlob = async (invoice: Invoice): Promise<Blob> => {
        return pdf(<InvoicePDF invoice={invoice} client={previewClient} />).toBlob()
    }

    // ── New: validate generated invoice (create + upload + send)
    const onValidateAndSend = async () => {
        setActionError(null)
        if (!draft.clientId) { setActionError('Choisis un client.'); return }
        if (!draft.number.trim() || !draft.title.trim()) { setActionError('Numéro et titre requis.'); return }

        setActionRunning('send')
        try {
            let invoiceId = existing?.id
            if (!invoiceId) {
                invoiceId = await createInvoice({
                    clientId: draft.clientId,
                    projectId: draft.projectId || undefined,
                    number: draft.number,
                    title: draft.title,
                    items: draft.items,
                    terms: draft.terms,
                    status: 'due',
                    issued: draft.issued,
                    due: draft.due,
                    source: 'generated',
                    notes: draft.notes,
                })
            } else {
                await updateInvoice(invoiceId, {
                    clientId: draft.clientId,
                    projectId: draft.projectId || undefined,
                    number: draft.number,
                    title: draft.title,
                    items: draft.items,
                    terms: draft.terms,
                    status: 'due',
                    issued: draft.issued,
                    due: draft.due,
                    source: 'generated',
                    notes: draft.notes,
                })
            }

            const finalInvoice: Invoice = { ...buildPreviewInvoice(draft, invoiceId, 'generated'), status: 'due' }
            const blob = await generateBlob(finalInvoice)
            const stored = await uploadInvoicePdf({ clientId: draft.clientId, invoiceId, blob })
            await attachInvoicePdf(invoiceId, {
                pdfUrl: stored.pdfUrl,
                storagePath: stored.storagePath,
                source: 'generated',
            })

            const client = findClient(draft.clientId)
            const to = client?.billingEmail || client?.contactEmail
            if (to) {
                const pdfBase64 = await blobToBase64(blob)
                await mailApi.invoice({
                    to,
                    contactName: client?.contactName ?? client?.name ?? '',
                    clientName: client?.name ?? '',
                    invoiceNumber: finalInvoice.number,
                    invoiceTitle: finalInvoice.title,
                    amount: finalInvoice.amount,
                    dueDate: finalInvoice.due,
                    items: finalInvoice.items,
                    pdfBase64,
                })
            } else {
                setActionError('Aucun email de facturation. PDF stocké, pas envoyé.')
            }

            patch({ status: 'due' })
            if (mode === 'new') navigate(`/invoices/${invoiceId}`, { replace: true })
        } catch (err) {
            console.error('[invoice/validate-and-send]', err)
            setActionError(err instanceof Error ? err.message : 'Échec.')
        } finally {
            setActionRunning(null)
        }
    }

    const onSaveDraft = async () => {
        setActionError(null)
        if (!draft.clientId) { setActionError('Choisis un client.'); return }
        if (!draft.number.trim() || !draft.title.trim()) { setActionError('Numéro et titre requis.'); return }
        try {
            const newId = await createInvoice({
                clientId: draft.clientId,
                projectId: draft.projectId || undefined,
                number: draft.number,
                title: draft.title,
                items: draft.items,
                terms: draft.terms,
                status: 'draft',
                issued: draft.issued,
                due: draft.due,
                source: 'generated',
                notes: draft.notes,
            })
            navigate(`/invoices/${newId}`, { replace: true })
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Échec.')
        }
    }

    const onMarkPaid = async () => {
        if (!existing) return
        setActionRunning('pay')
        setActionError(null)
        try {
            await updateInvoice(existing.id, {
                clientId: draft.clientId,
                projectId: draft.projectId || undefined,
                number: draft.number,
                title: draft.title,
                items: draft.items,
                terms: draft.terms,
                status: 'paid',
                issued: draft.issued,
                due: draft.due,
                source: existing.source,
                amount: existing.source === 'uploaded' ? draft.amount : undefined,
                notes: draft.notes,
            })
            patch({ status: 'paid' })
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Échec.')
        } finally {
            setActionRunning(null)
        }
    }

    const onDelete = async () => {
        if (!existing) return
        if (!confirm(`Supprimer la facture ${existing.number} ? Cette action est définitive.`)) return
        setActionRunning('delete')
        try {
            await deleteInvoiceDoc({ id: existing.id, storagePath: existing.storagePath })
            navigate('/invoices', { replace: true })
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Suppression échouée.')
            setActionRunning(null)
        }
    }

    // ── Upload PDF flow (creates an 'uploaded' invoice)
    const setSelectedFile = (next: File | null) => {
        if (!next) { setUploadFile(null); return }
        if (next.type !== 'application/pdf') { setActionError('Seuls les PDF sont acceptés.'); return }
        if (next.size > MAX_PDF_BYTES) { setActionError('PDF trop lourd (10 Mo max).'); return }
        setActionError(null)
        setUploadFile(next)
    }
    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault(); setDragOver(false)
        setSelectedFile(event.dataTransfer.files?.[0] ?? null)
    }
    const onDragOver = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragOver(true) }
    const onFile = (event: ChangeEvent<HTMLInputElement>) => setSelectedFile(event.target.files?.[0] ?? null)

    const onUploadSubmit = async () => {
        setActionError(null)
        if (!uploadFile) { setActionError('Dépose un PDF.'); return }
        if (!draft.clientId) { setActionError('Choisis un client.'); return }
        if (!draft.number.trim()) { setActionError('Numéro requis.'); return }
        if (!Number.isFinite(draft.amount) || draft.amount < 0) { setActionError('Montant invalide.'); return }

        setActionRunning('upload')
        try {
            const newId = await createInvoice({
                clientId: draft.clientId,
                projectId: draft.projectId || undefined,
                number: draft.number,
                title: draft.title || `Facture ${draft.number}`,
                items: [],
                terms: [],
                status: draft.status,
                issued: draft.issued,
                due: draft.due,
                source: 'uploaded',
                amount: draft.amount,
                notes: draft.notes,
            })
            const stored = await uploadInvoicePdf({
                clientId: draft.clientId,
                invoiceId: newId,
                blob: uploadFile,
            })
            await attachInvoicePdf(newId, {
                pdfUrl: stored.pdfUrl,
                storagePath: stored.storagePath,
                source: 'uploaded',
            })
            navigate(`/invoices/${newId}`, { replace: true })
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Échec upload.')
        } finally {
            setActionRunning(null)
        }
    }

    const onReplaceUploadedPdf = async () => {
        if (!existing || !uploadFile) return
        setActionRunning('upload')
        setActionError(null)
        try {
            if (existing.storagePath) await deleteInvoicePdf(existing.storagePath)
            const stored = await uploadInvoicePdf({
                clientId: draft.clientId,
                invoiceId: existing.id,
                blob: uploadFile,
            })
            await attachInvoicePdf(existing.id, {
                pdfUrl: stored.pdfUrl,
                storagePath: stored.storagePath,
                source: 'uploaded',
            })
            setUploadFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Échec MAJ PDF.')
        } finally {
            setActionRunning(null)
        }
    }

    return (
        <div className="dash-stack-lg">
            <header className="dash-page-head">
                <Link to="/invoices" className="dash-kicker" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                    ← Toutes les factures
                </Link>
                <div className="dash-row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
                    {breadcrumbClient && (
                        <Link to={`/clients/${breadcrumbClient.id}`} className="dash-kicker" style={{ textDecoration: 'underline' }}>
                            {breadcrumbClient.name}
                        </Link>
                    )}
                    {breadcrumbProject && (
                        <>
                            <span className="dash-kicker">›</span>
                            <Link to={`/projects/${breadcrumbProject.id}`} className="dash-kicker" style={{ textDecoration: 'underline' }}>
                                {breadcrumbProject.name}
                            </Link>
                        </>
                    )}
                    <span className="dash-kicker">›</span>
                    <span className="dash-kicker">{mode === 'new' ? 'Nouvelle facture' : draft.number}</span>
                </div>
                <div className="dash-row-between" style={{ marginTop: 8 }}>
                    <h1 className="dash-h1">
                        {mode === 'new' ? (
                            tab === 'uploaded'
                                ? <>Importer une <span className="serif-italic">facture existante.</span></>
                                : <>Créer une <span className="serif-italic">nouvelle facture.</span></>
                        ) : (
                            draft.title || 'Facture'
                        )}
                    </h1>
                    {mode === 'edit' && (
                        <div className="dash-row" style={{ gap: 12 }}>
                            <InvoiceStatusPill status={draft.status} />
                            <SaveIndicator state={saveState} errorMessage={saveError} />
                        </div>
                    )}
                </div>
            </header>

            {mode === 'new' && (
                <div className="dash-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'generated'}
                        className={`dash-tab${tab === 'generated' ? ' is-active' : ''}`}
                        onClick={() => setTab('generated')}
                    >
                        Créer une nouvelle facture
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'uploaded'}
                        className={`dash-tab${tab === 'uploaded' ? ' is-active' : ''}`}
                        onClick={() => setTab('uploaded')}
                    >
                        Uploader une ancienne facture
                    </button>
                </div>
            )}

            <div className="dash-invoice-editor">
                <div className="dash-edit">
                    {/* ── Common: client + project pickers */}
                    <div className="dash-stack-sm">
                        <span className="dash-label">Client</span>
                        <select
                            className="dash-input"
                            value={draft.clientId}
                            onChange={(e) => patch({ clientId: e.target.value, projectId: '' })}
                        >
                            <option value="">— Choisir —</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {projectsForClient.length > 0 && (
                        <div className="dash-stack-sm">
                            <span className="dash-label">Projet (optionnel)</span>
                            <select
                                className="dash-input"
                                value={draft.projectId}
                                onChange={(e) => patch({ projectId: e.target.value })}
                            >
                                <option value="">—</option>
                                {projectsForClient.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ── Upload-specific: drop zone */}
                    {(existing?.source === 'uploaded' || (mode === 'new' && tab === 'uploaded')) && (
                        <div className="dash-stack-sm">
                            <div className="dash-note" style={{ marginBottom: 4 }}>
                                Le PDF reste la source de vérité. Les champs ci-dessous servent à archiver la facture dans la base:
                                client, numéro, dates, montant et statut.
                            </div>
                            <span className="dash-label">{existing ? 'Remplacer le PDF' : 'Fichier PDF'}</span>
                            <label
                                htmlFor="invoice-pdf"
                                className={`dash-dropzone${dragOver ? ' is-drag' : ''}`}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={() => setDragOver(false)}
                            >
                                <p className="dash-dropzone__title">
                                    {uploadFile ? uploadFile.name : existing?.pdfUrl ? 'Glisse un nouveau PDF pour remplacer' : 'Dépose un PDF ici'}
                                </p>
                                <p className="dash-note" style={{ margin: 0 }}>
                                    {uploadFile
                                        ? `${(uploadFile.size / 1024).toFixed(0)} Ko · cliquer pour changer`
                                        : 'ou clique pour parcourir — 10 Mo max'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    id="invoice-pdf"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={onFile}
                                />
                            </label>
                            {existing?.pdfUrl && (
                                <a href={existing.pdfUrl} target="_blank" rel="noreferrer" className="dash-kicker" style={{ textDecoration: 'underline' }}>
                                    Voir le PDF actuel ↗
                                </a>
                            )}
                        </div>
                    )}

                    <div className="dash-grid dash-grid--2">
                        <div className="dash-stack-sm">
                            <span className="dash-label">Numéro</span>
                            <input
                                className="dash-input"
                                value={draft.number}
                                onChange={(e) => patch({ number: e.target.value })}
                            />
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Émise</span>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.issued}
                                onChange={(e) => patch({ issued: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="dash-stack-sm">
                        <span className="dash-label">{(existing?.source ?? tab) === 'uploaded' ? 'Titre (optionnel)' : 'Titre'}</span>
                        <input
                            className="dash-input"
                            value={draft.title}
                            onChange={(e) => patch({ title: e.target.value })}
                            placeholder={tab === 'uploaded' ? `Facture ${draft.number || ''}` : ''}
                        />
                    </div>

                    <div className="dash-grid dash-grid--2">
                        <div className="dash-stack-sm">
                            <span className="dash-label">Échéance</span>
                            <input
                                type="date"
                                className="dash-input"
                                value={draft.due}
                                onChange={(e) => patch({ due: e.target.value })}
                            />
                        </div>
                        <div className="dash-stack-sm">
                            <span className="dash-label">Statut</span>
                            <div className="dash-status-picker">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => patch({ status: opt.value })}
                                        className={`dash-status-pick tone-${opt.tone}${draft.status === opt.value ? ' is-active' : ''}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Generated-only: line items + terms */}
                    {(existing?.source ?? tab) === 'generated' ? (
                        <>
                            <div className="dash-stack-sm">
                                <span className="dash-label">Lignes</span>
                                {draft.items.map((item, idx) => (
                                    <div key={item.id} className="dash-invoice-row">
                                        <input
                                            className="dash-input"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateItem(idx, { description: e.target.value })}
                                        />
                                        <input
                                            className="dash-input"
                                            type="number"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={item.amount}
                                            onChange={(e) => updateItem(idx, { amount: Number(e.target.value) || 0 })}
                                        />
                                        <button
                                            type="button"
                                            className="dash-milestone-edit__remove"
                                            onClick={() => removeItem(idx)}
                                            disabled={draft.items.length === 1}
                                            title="Supprimer la ligne"
                                        >×</button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--ghost"
                                    style={{ height: 40, fontSize: 12, padding: '0 16px', alignSelf: 'flex-start' }}
                                    onClick={addItem}
                                >+ Ligne</button>
                            </div>

                            <div className="dash-row-between" style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 12 }}>
                                <span className="dash-kicker">Total HT</span>
                                <span className="dash-h2" style={{ fontSize: 22 }}>{formatEur(totalHT)}</span>
                            </div>

                            <div className="dash-stack-sm">
                                <span className="dash-label">Termes & conditions</span>
                                {draft.terms.map((term, idx) => (
                                    <div key={`term-${idx}`} className="dash-row" style={{ gap: 6 }}>
                                        <input
                                            className="dash-input"
                                            style={{ flex: 1 }}
                                            value={term}
                                            onChange={(e) => updateTerm(idx, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="dash-milestone-edit__remove"
                                            onClick={() => removeTerm(idx)}
                                        >×</button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--ghost"
                                    style={{ height: 40, fontSize: 12, padding: '0 16px', alignSelf: 'flex-start' }}
                                    onClick={addTerm}
                                >+ Terme</button>
                            </div>
                        </>
                    ) : (
                        <div className="dash-stack-sm">
                            <span className="dash-label">Montant TTC (€)</span>
                            <input
                                className="dash-input"
                                type="number"
                                inputMode="decimal"
                                value={draft.amount}
                                onChange={(e) => patch({ amount: Number(e.target.value) || 0 })}
                            />
                        </div>
                    )}

                    <div className="dash-stack-sm">
                        <span className="dash-label">Notes internes</span>
                        <textarea
                            className="dash-inline-textarea"
                            value={draft.notes}
                            onChange={(e) => patch({ notes: e.target.value })}
                            placeholder="Visible uniquement par toi"
                        />
                    </div>

                    {/* ── Actions */}
                    <div className="dash-row" style={{ gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                        {mode === 'new' ? (
                            tab === 'generated' ? (
                                <>
                                    <button
                                        type="button"
                                        className="dash-btn"
                                        onClick={onValidateAndSend}
                                        disabled={actionRunning !== null}
                                    >
                                        {actionRunning === 'send' ? 'Envoi…' : 'Créer et envoyer'}
                                    </button>
                                    <button
                                        type="button"
                                        className="dash-btn dash-btn--ghost"
                                        onClick={onSaveDraft}
                                        disabled={actionRunning !== null}
                                    >
                                        Enregistrer en brouillon
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="dash-btn"
                                        onClick={onUploadSubmit}
                                        disabled={actionRunning !== null || !uploadFile}
                                    >
                                        {actionRunning === 'upload' ? 'Upload…' : 'Archiver cette facture'}
                                    </button>
                                    <Link to="/invoices" className="dash-btn dash-btn--ghost">Annuler</Link>
                                </>
                            )
                        ) : (
                            <>
                                {existing?.source === 'generated' && draft.status !== 'paid' && (
                                    <button
                                        type="button"
                                        className="dash-btn"
                                        onClick={onValidateAndSend}
                                        disabled={actionRunning !== null}
                                    >
                                        {actionRunning === 'send' ? 'Envoi…' : 'Envoyer au client'}
                                    </button>
                                )}
                                {existing?.source === 'uploaded' && uploadFile && (
                                    <button
                                        type="button"
                                        className="dash-btn"
                                        onClick={onReplaceUploadedPdf}
                                        disabled={actionRunning !== null}
                                    >
                                        {actionRunning === 'upload' ? 'Upload…' : 'Remplacer le PDF'}
                                    </button>
                                )}
                                {draft.status !== 'paid' && (
                                    <button
                                        type="button"
                                        className="dash-btn dash-btn--ghost"
                                        onClick={onMarkPaid}
                                        disabled={actionRunning !== null}
                                    >
                                        {actionRunning === 'pay' ? 'MAJ…' : 'Marquer payée'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="dash-btn dash-btn--tomato"
                                    style={{ background: 'transparent', color: 'var(--color-tomato)' }}
                                    onClick={onDelete}
                                    disabled={actionRunning !== null}
                                >
                                    {actionRunning === 'delete' ? 'Suppression…' : 'Supprimer'}
                                </button>
                            </>
                        )}
                    </div>

                    {actionError && <div className="login__error">{actionError}</div>}
                </div>

                <div className="dash-invoice-preview">
                    <div className="dash-invoice-preview__head">
                        <span>Aperçu PDF</span>
                        {existing?.pdfUrl && (
                            <a
                                href={existing.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                                PDF stocké ↗
                            </a>
                        )}
                    </div>
                    {showLivePreview ? (
                        previewUrl ? (
                            <iframe title="Aperçu facture" src={previewUrl} />
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-mute)' }}>
                                Génération de l'aperçu…
                            </div>
                        )
                    ) : existing?.pdfUrl ? (
                        <iframe title="PDF importé" src={existing.pdfUrl} />
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-mute)', padding: 24, textAlign: 'center' }}>
                            Dépose un PDF puis valide l'import — il s'affichera ici.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
