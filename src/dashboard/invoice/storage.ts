import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from 'firebase/storage'
import { storage } from '../firebase'

const INVOICES_PREFIX = 'invoices'

function invoicePath(clientId: string, invoiceId: string) {
    return `${INVOICES_PREFIX}/${clientId}/${invoiceId}.pdf`
}

export type StoredInvoiceFile = {
    pdfUrl: string
    storagePath: string
}

export async function uploadInvoicePdf(opts: {
    clientId: string
    invoiceId: string
    blob: Blob
}): Promise<StoredInvoiceFile> {
    const path = invoicePath(opts.clientId, opts.invoiceId)
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, opts.blob, {
        contentType: 'application/pdf',
    })
    const pdfUrl = await getDownloadURL(storageRef)
    return { pdfUrl, storagePath: path }
}

export async function deleteInvoicePdf(storagePath: string) {
    if (!storagePath) return
    try {
        await deleteObject(ref(storage, storagePath))
    } catch (err) {
        const code = (err as { code?: string })?.code
        if (code === 'storage/object-not-found') return
        throw err
    }
}

export async function getInvoicePdfUrl(storagePath: string): Promise<string> {
    return getDownloadURL(ref(storage, storagePath))
}

export async function blobToBase64(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize)
        binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
}
