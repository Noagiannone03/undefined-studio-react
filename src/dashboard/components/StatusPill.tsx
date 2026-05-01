import type { AppRole, ClientStatus, InvoiceStatus, ProjectStatus, TicketStatus } from '../types'
import { projectStatusGroup, projectStatusLabel } from '../projectStatus'

type Tone = 'ink' | 'klein' | 'tomato' | 'mute' | 'neutral'

const PROJECT_TONES: Record<ProjectStatus, { label: string; tone: Tone }> = {
    active: { label: 'En cours', tone: 'klein' },
    done: { label: 'Terminé', tone: 'ink' },
    waiting: { label: 'En attente', tone: 'tomato' },
    paused: { label: 'En pause', tone: 'mute' },
    discovery: { label: 'En attente', tone: 'tomato' },
    design: { label: 'En cours', tone: 'klein' },
    build: { label: 'En cours', tone: 'klein' },
    review: { label: 'En cours', tone: 'klein' },
    live: { label: 'Terminé', tone: 'ink' },
}

const INVOICE_TONES: Record<InvoiceStatus, { label: string; tone: Tone }> = {
    paid: { label: 'Payée', tone: 'ink' },
    due: { label: 'À régler', tone: 'klein' },
    overdue: { label: 'En retard', tone: 'tomato' },
    draft: { label: 'Brouillon', tone: 'mute' },
}

const TICKET_TONES: Record<TicketStatus, { label: string; tone: Tone }> = {
    open: { label: 'Ouvert', tone: 'tomato' },
    answered: { label: 'Répondu', tone: 'klein' },
    resolved: { label: 'Résolu', tone: 'ink' },
}

const CLIENT_TONES: Record<ClientStatus, { label: string; tone: Tone }> = {
    active: { label: 'Actif', tone: 'ink' },
    lead: { label: 'Lead', tone: 'klein' },
    archived: { label: 'Archivé', tone: 'mute' },
}

const ROLE_TONES: Record<AppRole, { label: string; tone: Tone }> = {
    admin: { label: 'Admin', tone: 'tomato' },
    client: { label: 'Client', tone: 'klein' },
}

function toneClass(tone: Tone) {
    if (tone === 'klein') return 'dash-pill dash-pill--klein'
    if (tone === 'tomato') return 'dash-pill dash-pill--tomato'
    if (tone === 'ink') return 'dash-pill dash-pill--ink'
    if (tone === 'mute') return 'dash-pill dash-pill--mute'
    return 'dash-pill'
}

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
    const { tone } = PROJECT_TONES[status] ?? PROJECT_TONES[projectStatusGroup(status)]
    const label = projectStatusLabel(status)
    return <span className={toneClass(tone)}>{label}</span>
}

export function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
    const { label, tone } = INVOICE_TONES[status]
    return <span className={toneClass(tone)}>{label}</span>
}

export function TicketStatusPill({ status }: { status: TicketStatus }) {
    const { label, tone } = TICKET_TONES[status]
    return <span className={toneClass(tone)}>{label}</span>
}

export function ClientStatusPill({ status }: { status: ClientStatus }) {
    const { label, tone } = CLIENT_TONES[status]
    return <span className={toneClass(tone)}>{label}</span>
}

export function RolePill({ role }: { role: AppRole }) {
    const { label, tone } = ROLE_TONES[role]
    return <span className={toneClass(tone)}>{label}</span>
}
