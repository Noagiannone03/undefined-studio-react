import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    documentId,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
    type FirestoreError,
    type QueryConstraint,
} from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    signOut,
    type User as FirebaseUser,
} from 'firebase/auth'
import { db, getSecondaryAdminAuth, isBootstrapAdmin } from './firebase'
import { derivedName, createReadableId, slugify, sortByDateAsc, sortByDateDesc, toIsoDate } from './utils'
import type {
    Client,
    ClientStatus,
    Invoice,
    InvoiceItem,
    InvoiceSource,
    InvoiceStatus,
    Milestone,
    Project,
    ProjectStatus,
    ProjectUpdate,
    Ticket,
    TicketMessage,
    TicketPriority,
    TicketStatus,
    UserProfile,
} from './types'
import { deleteInvoicePdf } from './invoice/storage'

type Unsubscribe = () => void

type SnapshotCallback<T> = (value: T[]) => void
type ErrorCallback = (error: FirestoreError) => void

type CreateClientInput = {
    name: string
    contactName: string
    contactEmail: string
    billingEmail: string
    notes?: string
}

type UpdateClientInput = {
    name: string
    status: ClientStatus
    contactName: string
    contactEmail: string
    billingEmail: string
    notes?: string
}

type CreateClientAccountInput = {
    clientId: string
    email: string
    name: string
    temporaryPassword: string
}

type CreateProjectInput = {
    clientId: string
    name: string
    tagline: string
    status: ProjectStatus
    progress: number
    accent: string
    kickoff: string
    delivery: string
    summary?: string
}

type UpdateProjectInput = {
    status: ProjectStatus
    progress: number
    summary?: string
    kickoff: string
    delivery: string
    milestones?: Milestone[]
}

type CreateProjectUpdateInput = {
    clientId: string
    projectId: string
    title: string
    body: string
    authorName: string
    milestoneId?: string
    milestoneLabel?: string
}

type CreateTicketInput = {
    clientId: string
    projectId?: string
    subject: string
    body: string
    priority: TicketPriority
    createdByUid: string
    createdByName: string
}

type ReplyToTicketInput = {
    ticket: Ticket
    body: string
    from: TicketMessage['from']
    authorName: string
}

type CreateInvoiceInput = {
    clientId: string
    projectId?: string
    number: string
    title: string
    items: InvoiceItem[]
    terms: string[]
    status: InvoiceStatus
    issued: string
    due: string
    source: InvoiceSource
    amount?: number // explicit override for uploaded invoices (no items)
    notes?: string
}

type UpdateInvoiceInput = CreateInvoiceInput

type AttachInvoicePdfInput = {
    pdfUrl: string
    storagePath: string
    source?: InvoiceSource
}

const USERS = 'users'
const CLIENTS = 'clients'
const PROJECTS = 'projects'
const PROJECT_UPDATES = 'projectUpdates'
const TICKETS = 'tickets'
const INVOICES = 'invoices'

function isoNow() {
    return new Date().toISOString()
}

function asClientStatus(value: unknown): ClientStatus {
    return value === 'lead' || value === 'archived' ? value : 'active'
}

function asProjectStatus(value: unknown): ProjectStatus {
    return value === 'active' ||
        value === 'done' ||
        value === 'waiting' ||
        value === 'paused' ||
        value === 'discovery' ||
        value === 'design' ||
        value === 'build' ||
        value === 'review' ||
        value === 'live'
        ? value
        : 'active'
}

function asTicketStatus(value: unknown): TicketStatus {
    return value === 'answered' || value === 'resolved' ? value : 'open'
}

function asTicketPriority(value: unknown): TicketPriority {
    return value === 'low' || value === 'high' ? value : 'normal'
}

function asInvoiceStatus(value: unknown): InvoiceStatus {
    return value === 'due' || value === 'overdue' || value === 'draft' ? value : 'paid'
}

function asInvoiceSource(value: unknown): InvoiceSource {
    return value === 'uploaded' ? 'uploaded' : 'generated'
}

function normalizeMilestones(value: unknown): Milestone[] {
    if (!Array.isArray(value)) return []

    return value.map((item, index) => {
        const raw = item as Partial<Milestone> | undefined
        const status =
            raw?.status === 'done' || raw?.status === 'current' || raw?.status === 'upcoming'
                ? raw.status
                : 'upcoming'

        return {
            id: raw?.id ?? `milestone-${index + 1}`,
            label: raw?.label?.trim() || `Étape ${index + 1}`,
            status,
            date: raw?.date,
            note: raw?.note,
        }
    })
}

function normalizeMessages(value: unknown): TicketMessage[] {
    if (!Array.isArray(value)) return []

    return value.map((item, index) => {
        const raw = item as Partial<TicketMessage> | undefined
        return {
            id: raw?.id ?? `message-${index + 1}`,
            from: raw?.from === 'studio' ? 'studio' : 'client',
            authorName: raw?.authorName,
            body: raw?.body?.trim() || '',
            at: raw?.at ?? isoNow(),
        }
    })
}

function defaultMilestones(kickoff: string, delivery: string): Milestone[] {
    return [
        {
            id: 'm1',
            label: 'Cadrage',
            status: 'current',
            date: kickoff,
        },
        {
            id: 'm2',
            label: 'Production',
            status: 'upcoming',
        },
        {
            id: 'm3',
            label: 'Livraison',
            status: 'upcoming',
            date: delivery,
        },
    ]
}

function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
    const clientIds = Array.isArray(data.clientIds)
        ? data.clientIds.filter((value): value is string => typeof value === 'string' && value.length > 0)
        : []

    // Backward compat: old docs stored a single clientId string
    const resolvedClientIds =
        clientIds.length > 0
            ? clientIds
            : typeof data.clientId === 'string' && data.clientId
                ? [data.clientId]
                : []

    return {
        uid: id,
        email: typeof data.email === 'string' ? data.email : '',
        name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Utilisateur',
        role: data.role === 'admin' ? 'admin' : 'client',
        clientId: resolvedClientIds[0] ?? null,
        clientIds: resolvedClientIds,
        mustChangePassword: Boolean(data.mustChangePassword),
        isActive: data.isActive !== false,
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
    }
}

function mapClient(id: string, data: Record<string, unknown>): Client {
    // Backward compat: old docs used primaryContactName/Email
    const contactName =
        typeof data.contactName === 'string' ? data.contactName
        : typeof data.primaryContactName === 'string' ? data.primaryContactName
        : ''
    const contactEmail =
        typeof data.contactEmail === 'string' ? data.contactEmail
        : typeof data.primaryContactEmail === 'string' ? data.primaryContactEmail
        : ''

    return {
        id,
        slug: typeof data.slug === 'string' ? data.slug : id,
        name: typeof data.name === 'string' ? data.name : 'Client',
        status: asClientStatus(data.status),
        contactName,
        contactEmail,
        billingEmail:
            typeof data.billingEmail === 'string' ? data.billingEmail : contactEmail,
        notes: typeof data.notes === 'string' ? data.notes : undefined,
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
    }
}

function mapProject(id: string, data: Record<string, unknown>): Project {
    return {
        id,
        clientId: typeof data.clientId === 'string' ? data.clientId : '',
        name: typeof data.name === 'string' ? data.name : 'Projet',
        tagline: typeof data.tagline === 'string' ? data.tagline : '',
        status: asProjectStatus(data.status),
        progress: typeof data.progress === 'number' ? Math.max(0, Math.min(100, data.progress)) : 0,
        accent: typeof data.accent === 'string' ? data.accent : 'var(--color-klein)',
        kickoff: typeof data.kickoff === 'string' ? data.kickoff : '',
        delivery: typeof data.delivery === 'string' ? data.delivery : '',
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        milestones: normalizeMilestones(data.milestones),
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
    }
}

function mapProjectUpdate(id: string, data: Record<string, unknown>): ProjectUpdate {
    return {
        id,
        projectId: typeof data.projectId === 'string' ? data.projectId : '',
        clientId: typeof data.clientId === 'string' ? data.clientId : '',
        date: typeof data.date === 'string' ? data.date : toIsoDate(data.createdAt) ?? isoNow(),
        title: typeof data.title === 'string' ? data.title : 'Mise à jour',
        body: typeof data.body === 'string' ? data.body : '',
        authorName: typeof data.authorName === 'string' ? data.authorName : 'Undefined',
        milestoneId: typeof data.milestoneId === 'string' && data.milestoneId ? data.milestoneId : undefined,
        milestoneLabel: typeof data.milestoneLabel === 'string' && data.milestoneLabel ? data.milestoneLabel : undefined,
    }
}

function mapTicket(id: string, data: Record<string, unknown>): Ticket {
    const messages = normalizeMessages(data.messages)
    // Backward compat: old docs used 'project', new ones use 'projectId'
    const projectId =
        typeof data.projectId === 'string' && data.projectId ? data.projectId
        : typeof data.project === 'string' && data.project ? data.project
        : undefined
    return {
        id,
        clientId: typeof data.clientId === 'string' ? data.clientId : '',
        subject: typeof data.subject === 'string' ? data.subject : 'Ticket',
        body: typeof data.body === 'string' ? data.body : messages[0]?.body ?? '',
        status: asTicketStatus(data.status),
        priority: asTicketPriority(data.priority),
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : isoNow(),
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
        projectId,
        createdByUid: typeof data.createdByUid === 'string' ? data.createdByUid : undefined,
        createdByName: typeof data.createdByName === 'string' ? data.createdByName : undefined,
        messages,
    }
}

function normalizeInvoiceItems(value: unknown): InvoiceItem[] {
    if (!Array.isArray(value)) return []

    return value.map((item, index) => {
        const raw = item as Partial<InvoiceItem> | undefined
        return {
            id: raw?.id ?? `item-${index + 1}`,
            description: typeof raw?.description === 'string' ? raw.description : '',
            amount: typeof raw?.amount === 'number' ? raw.amount : 0,
        }
    })
}

function normalizeStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
}

export function sumInvoiceItems(items: InvoiceItem[]): number {
    return items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0)
}

function mapInvoice(id: string, data: Record<string, unknown>): Invoice {
    // Backward compat: old docs used 'project', new ones use 'projectId'
    const projectId =
        typeof data.projectId === 'string' ? data.projectId
        : typeof data.project === 'string' ? data.project
        : ''
    const items = normalizeInvoiceItems(data.items)
    const computedAmount = sumInvoiceItems(items)
    const source = asInvoiceSource(data.source)
    return {
        id,
        clientId: typeof data.clientId === 'string' ? data.clientId : '',
        number: typeof data.number === 'string' ? data.number : id.toUpperCase(),
        projectId,
        title: typeof data.title === 'string' ? data.title : '',
        items,
        terms: normalizeStringList(data.terms),
        amount:
            source === 'generated' && items.length > 0
                ? computedAmount
                : typeof data.amount === 'number' ? data.amount : computedAmount,
        status: asInvoiceStatus(data.status),
        issued: typeof data.issued === 'string' ? data.issued : '',
        due: typeof data.due === 'string' ? data.due : '',
        source,
        pdfUrl: typeof data.pdfUrl === 'string' ? data.pdfUrl : undefined,
        storagePath: typeof data.storagePath === 'string' ? data.storagePath : undefined,
        notes: typeof data.notes === 'string' ? data.notes : undefined,
        sentAt: typeof data.sentAt === 'string' ? data.sentAt : undefined,
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
    }
}

function createClientScopedConstraints(profile: UserProfile): QueryConstraint[] {
    const clientIds = profile.clientIds.length > 0 ? profile.clientIds : profile.clientId ? [profile.clientId] : []

    if (clientIds.length === 0) return []
    if (clientIds.length === 1) return [where('clientId', '==', clientIds[0])]
    return [where('clientId', 'in', clientIds.slice(0, 10))]
}

function hasClientScope(profile: UserProfile) {
    return profile.clientIds.length > 0 || Boolean(profile.clientId)
}

function subscribeMappedCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    map: (id: string, data: Record<string, unknown>) => T,
    onNext: SnapshotCallback<T>,
    onError?: ErrorCallback,
) {
    const base = collection(db, collectionName)
    const ref = constraints.length ? query(base, ...constraints) : base

    return onSnapshot(
        ref,
        (snapshot) => {
            onNext(snapshot.docs.map((item) => map(item.id, item.data() as Record<string, unknown>)))
        },
        onError,
    )
}

export async function ensureUserProfile(user: FirebaseUser) {
    const ref = doc(db, USERS, user.uid)
    const snapshot = await getDoc(ref)
    const baseName = user.displayName?.trim() || derivedName(user.email ?? user.uid)
    const now = isoNow()

    if (!snapshot.exists()) {
        await setDoc(ref, {
            uid: user.uid,
            email: user.email ?? '',
            name: baseName,
            role: isBootstrapAdmin(user.uid) ? 'admin' : 'client',
            clientIds: [],
            mustChangePassword: false,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        })
        return
    }

    const current = snapshot.data() as Record<string, unknown>
    if (current.email !== user.email) {
        await updateDoc(ref, {
            email: user.email ?? '',
            updatedAt: now,
        })
    }
}

export function subscribeUserProfile(
    uid: string,
    onNext: (profile: UserProfile | null) => void,
    onError?: ErrorCallback,
): Unsubscribe {
    return onSnapshot(
        doc(db, USERS, uid),
        (snapshot) => {
            onNext(snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>) : null)
        },
        onError,
    )
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(doc(db, USERS, uid))
    return snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>) : null
}

export function subscribeUsers(
    profile: UserProfile,
    onNext: SnapshotCallback<UserProfile>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role !== 'admin') {
        onNext([profile])
        return () => undefined
    }

    return subscribeMappedCollection(
        USERS,
        [],
        mapUserProfile,
        (items) => onNext(sortByDateDesc(items, (item) => item.createdAt)),
        onError,
    )
}

export function subscribeClients(
    profile: UserProfile,
    onNext: SnapshotCallback<Client>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role === 'admin') {
        return subscribeMappedCollection(
            CLIENTS,
            [],
            mapClient,
            (items) => onNext(items.sort((a, b) => a.name.localeCompare(b.name, 'fr'))),
            onError,
        )
    }

    const clientIds = profile.clientIds.length > 0 ? profile.clientIds : profile.clientId ? [profile.clientId] : []
    if (clientIds.length === 0) {
        onNext([])
        return () => undefined
    }

    const constraints =
        clientIds.length === 1 ? [where(documentId(), '==', clientIds[0])] : [where(documentId(), 'in', clientIds.slice(0, 10))]

    return subscribeMappedCollection(
        CLIENTS,
        constraints,
        mapClient,
        (items) => onNext(items.sort((a, b) => a.name.localeCompare(b.name, 'fr'))),
        onError,
    )
}

export function subscribeProjects(
    profile: UserProfile,
    onNext: SnapshotCallback<Project>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role !== 'admin' && !hasClientScope(profile)) {
        onNext([])
        return () => undefined
    }

    return subscribeMappedCollection(
        PROJECTS,
        profile.role === 'admin' ? [] : createClientScopedConstraints(profile),
        mapProject,
        (items) => onNext(sortByDateAsc(items, (item) => item.delivery || item.kickoff)),
        onError,
    )
}

export function subscribeProjectUpdates(
    profile: UserProfile,
    onNext: SnapshotCallback<ProjectUpdate>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role !== 'admin' && !hasClientScope(profile)) {
        onNext([])
        return () => undefined
    }

    return subscribeMappedCollection(
        PROJECT_UPDATES,
        profile.role === 'admin' ? [] : createClientScopedConstraints(profile),
        mapProjectUpdate,
        (items) => onNext(sortByDateDesc(items, (item) => item.date)),
        onError,
    )
}

export function subscribeTickets(
    profile: UserProfile,
    onNext: SnapshotCallback<Ticket>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role !== 'admin' && !hasClientScope(profile)) {
        onNext([])
        return () => undefined
    }

    return subscribeMappedCollection(
        TICKETS,
        profile.role === 'admin' ? [] : createClientScopedConstraints(profile),
        mapTicket,
        (items) => onNext(sortByDateDesc(items, (item) => item.updatedAt ?? item.createdAt)),
        onError,
    )
}

export function subscribeInvoices(
    profile: UserProfile,
    onNext: SnapshotCallback<Invoice>,
    onError?: ErrorCallback,
): Unsubscribe {
    if (profile.role !== 'admin' && !hasClientScope(profile)) {
        onNext([])
        return () => undefined
    }

    return subscribeMappedCollection(
        INVOICES,
        profile.role === 'admin' ? [] : createClientScopedConstraints(profile),
        mapInvoice,
        (items) => onNext(sortByDateDesc(items, (item) => item.issued)),
        onError,
    )
}

export async function createClient(input: CreateClientInput) {
    const id = createReadableId('client', input.name)
    const now = isoNow()

    await setDoc(doc(db, CLIENTS, id), {
        slug: slugify(input.name),
        name: input.name.trim(),
        status: 'active',
        contactName: input.contactName.trim(),
        contactEmail: input.contactEmail.trim().toLowerCase(),
        billingEmail: input.billingEmail.trim().toLowerCase(),
        notes: input.notes?.trim() || '',
        createdAt: now,
        updatedAt: now,
    })

    return id
}

export async function updateClient(clientId: string, input: UpdateClientInput) {
    await updateDoc(doc(db, CLIENTS, clientId), {
        name: input.name.trim(),
        status: input.status,
        contactName: input.contactName.trim(),
        contactEmail: input.contactEmail.trim().toLowerCase(),
        billingEmail: input.billingEmail.trim().toLowerCase(),
        notes: input.notes?.trim() || '',
        updatedAt: isoNow(),
    })
}

export async function deleteClient(clientId: string) {
    const batch = writeBatch(db)

    const [projectsSnap, updatesSnap, ticketsSnap, invoicesSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, PROJECTS), where('clientId', '==', clientId))),
        getDocs(query(collection(db, PROJECT_UPDATES), where('clientId', '==', clientId))),
        getDocs(query(collection(db, TICKETS), where('clientId', '==', clientId))),
        getDocs(query(collection(db, INVOICES), where('clientId', '==', clientId))),
        getDocs(query(collection(db, USERS), where('clientIds', 'array-contains', clientId))),
    ])

    await Promise.all(
        invoicesSnap.docs.map((item) => {
            const data = item.data() as Record<string, unknown>
            return typeof data.storagePath === 'string' && data.storagePath ? deleteInvoicePdf(data.storagePath) : undefined
        }),
    )

    projectsSnap.docs.forEach((item) => batch.delete(item.ref))
    updatesSnap.docs.forEach((item) => batch.delete(item.ref))
    ticketsSnap.docs.forEach((item) => batch.delete(item.ref))
    invoicesSnap.docs.forEach((item) => batch.delete(item.ref))
    usersSnap.docs.forEach((item) => {
        const profile = mapUserProfile(item.id, item.data() as Record<string, unknown>)
        const nextClientIds = profile.clientIds.filter((id) => id !== clientId)
        batch.update(item.ref, {
            clientIds: nextClientIds,
            clientId: nextClientIds[0] ?? '',
            isActive: nextClientIds.length > 0,
            updatedAt: isoNow(),
        })
    })
    batch.delete(doc(db, CLIENTS, clientId))

    await batch.commit()
}

export async function updateUserAccess(uid: string, input: { isActive: boolean }) {
    await updateDoc(doc(db, USERS, uid), {
        isActive: input.isActive,
        updatedAt: isoNow(),
    })
}

export async function removeClientAccess(uid: string, clientId: string) {
    const ref = doc(db, USERS, uid)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return

    const profile = mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>)
    const nextClientIds = profile.clientIds.filter((id) => id !== clientId)
    await updateDoc(ref, {
        clientIds: nextClientIds,
        clientId: nextClientIds[0] ?? '',
        isActive: nextClientIds.length > 0 ? profile.isActive : false,
        updatedAt: isoNow(),
    })
}

export async function createClientAccount(input: CreateClientAccountInput) {
    const secondaryAuth = getSecondaryAdminAuth()
    const created = await createUserWithEmailAndPassword(
        secondaryAuth,
        input.email.trim().toLowerCase(),
        input.temporaryPassword,
    )

    const now = isoNow()
    await setDoc(doc(db, USERS, created.user.uid), {
        uid: created.user.uid,
        email: input.email.trim().toLowerCase(),
        name: input.name.trim(),
        role: 'client',
        clientIds: [input.clientId],
        mustChangePassword: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    })

    await signOut(secondaryAuth)

    return created.user.uid
}

export async function markPasswordChangeCompleted(uid: string) {
    await updateDoc(doc(db, USERS, uid), {
        mustChangePassword: false,
        updatedAt: isoNow(),
    })
}

export async function createProject(input: CreateProjectInput) {
    const id = createReadableId('project', input.name)
    const now = isoNow()

    await setDoc(doc(db, PROJECTS, id), {
        clientId: input.clientId,
        slug: slugify(input.name),
        name: input.name.trim(),
        tagline: input.tagline.trim(),
        status: input.status,
        progress: Math.max(0, Math.min(100, input.progress)),
        accent: input.accent,
        kickoff: input.kickoff,
        delivery: input.delivery,
        summary: input.summary?.trim() || '',
        milestones: defaultMilestones(input.kickoff, input.delivery),
        createdAt: now,
        updatedAt: now,
    })

    return id
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
    const patch: Record<string, unknown> = {
        status: input.status,
        progress: Math.max(0, Math.min(100, input.progress)),
        summary: input.summary?.trim() || '',
        kickoff: input.kickoff,
        delivery: input.delivery,
        updatedAt: isoNow(),
    }

    if (input.milestones) {
        patch.milestones = input.milestones.map((m) => ({
            id: m.id,
            label: m.label.trim(),
            status: m.status,
            ...(m.date ? { date: m.date } : {}),
            ...(m.note ? { note: m.note.trim() } : {}),
        }))
    }

    await updateDoc(doc(db, PROJECTS, projectId), patch)
}

export async function deleteProject(projectId: string) {
    const batch = writeBatch(db)

    const [updatesSnap, ticketsSnap, invoicesSnap] = await Promise.all([
        getDocs(query(collection(db, PROJECT_UPDATES), where('projectId', '==', projectId))),
        getDocs(query(collection(db, TICKETS), where('projectId', '==', projectId))),
        getDocs(query(collection(db, INVOICES), where('projectId', '==', projectId))),
    ])

    updatesSnap.docs.forEach((item) => batch.delete(item.ref))
    ticketsSnap.docs.forEach((item) => batch.update(item.ref, { projectId: '', updatedAt: isoNow() }))
    invoicesSnap.docs.forEach((item) => batch.update(item.ref, { projectId: '', updatedAt: isoNow() }))
    batch.delete(doc(db, PROJECTS, projectId))

    await batch.commit()
}

export async function createProjectUpdate(input: CreateProjectUpdateInput) {
    const now = isoNow()
    await addDoc(collection(db, PROJECT_UPDATES), {
        clientId: input.clientId,
        projectId: input.projectId,
        title: input.title.trim(),
        body: input.body.trim(),
        authorName: input.authorName.trim(),
        ...(input.milestoneId ? { milestoneId: input.milestoneId } : {}),
        ...(input.milestoneLabel ? { milestoneLabel: input.milestoneLabel.trim() } : {}),
        date: now,
        createdAt: now,
    })
}

export async function createTicket(input: CreateTicketInput) {
    const now = isoNow()
    await addDoc(collection(db, TICKETS), {
        clientId: input.clientId,
        subject: input.subject.trim(),
        body: input.body.trim(),
        status: 'open',
        priority: input.priority,
        createdAt: now,
        updatedAt: now,
        projectId: input.projectId || '',
        createdByUid: input.createdByUid,
        createdByName: input.createdByName,
        messages: [
            {
                id: createReadableId('msg', input.subject),
                from: 'client',
                authorName: input.createdByName,
                body: input.body.trim(),
                at: now,
            },
        ],
    })
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    await updateDoc(doc(db, TICKETS, ticketId), {
        status,
        updatedAt: isoNow(),
    })
}

function buildInvoicePayload(input: CreateInvoiceInput) {
    const items = input.items.map((item, index) => ({
        id: item.id || `item-${index + 1}`,
        description: item.description.trim(),
        amount: Number.isFinite(item.amount) ? Number(item.amount) : 0,
    }))

    const computed = sumInvoiceItems(items)
    const amount =
        input.source === 'uploaded'
            ? Number.isFinite(input.amount) ? Number(input.amount) : computed
            : computed

    return {
        clientId: input.clientId,
        projectId: input.projectId || '',
        number: input.number.trim(),
        title: input.title.trim(),
        items,
        terms: input.terms.map((line) => line.trim()).filter(Boolean),
        amount,
        status: input.status,
        issued: input.issued,
        due: input.due,
        source: input.source,
        notes: input.notes?.trim() || '',
    }
}

export async function createInvoice(input: CreateInvoiceInput) {
    const id = createReadableId('invoice', input.number || input.title || input.clientId)
    const now = isoNow()

    await setDoc(doc(db, INVOICES, id), {
        ...buildInvoicePayload(input),
        createdAt: now,
        updatedAt: now,
    })

    return id
}

export async function updateInvoice(invoiceId: string, input: UpdateInvoiceInput) {
    await updateDoc(doc(db, INVOICES, invoiceId), {
        ...buildInvoicePayload(input),
        updatedAt: isoNow(),
    })
}

export async function attachInvoicePdf(invoiceId: string, input: AttachInvoicePdfInput) {
    const patch: Record<string, unknown> = {
        pdfUrl: input.pdfUrl,
        storagePath: input.storagePath,
        updatedAt: isoNow(),
    }
    if (input.source) patch.source = input.source
    await updateDoc(doc(db, INVOICES, invoiceId), patch)
}

export async function markInvoiceSent(invoiceId: string) {
    await updateDoc(doc(db, INVOICES, invoiceId), {
        sentAt: isoNow(),
        updatedAt: isoNow(),
    })
}

export async function deleteInvoice(invoice: Pick<Invoice, 'id' | 'storagePath'>) {
    if (invoice.storagePath) {
        await deleteInvoicePdf(invoice.storagePath)
    }
    await deleteDoc(doc(db, INVOICES, invoice.id))
}

export async function replyToTicket(input: ReplyToTicketInput) {
    const nextMessage: TicketMessage = {
        id: createReadableId('msg', input.ticket.subject),
        from: input.from,
        authorName: input.authorName,
        body: input.body.trim(),
        at: isoNow(),
    }

    const nextMessages = [...input.ticket.messages, nextMessage]
    const nextStatus = input.from === 'studio' ? 'answered' : 'open'

    await updateDoc(doc(db, TICKETS, input.ticket.id), {
        messages: nextMessages,
        body: input.ticket.body,
        status: nextStatus,
        updatedAt: nextMessage.at,
    })
}

export type {
    CreateClientInput,
    UpdateClientInput,
    CreateClientAccountInput,
    CreateProjectInput,
    UpdateProjectInput,
    CreateProjectUpdateInput,
    CreateTicketInput,
    CreateInvoiceInput,
    UpdateInvoiceInput,
    AttachInvoicePdfInput,
    ReplyToTicketInput,
}
