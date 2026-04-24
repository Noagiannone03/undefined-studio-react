import type { Invoice, Project, Ticket } from './types'

/**
 * Mock data. Replace with live fetches when the backend is wired.
 * Kept as plain exported arrays so components can import, filter, and
 * find by id without a context or a query layer.
 */

export const PROJECTS: Project[] = [
    {
        id: 'vago-ios',
        name: 'VAGO',
        tagline: "App iOS — habitudes & streaks.",
        status: 'build',
        progress: 62,
        accent: 'var(--color-klein)',
        kickoff: '2026-01-12',
        delivery: '2026-05-30',
        milestones: [
            { id: 'm1', label: 'Cadrage & architecture', status: 'done', date: '2026-01-28' },
            { id: 'm2', label: 'Système graphique', status: 'done', date: '2026-02-18' },
            { id: 'm3', label: 'Dev SwiftUI — V1', status: 'current', date: '2026-04-12' },
            { id: 'm4', label: 'Tests internes', status: 'upcoming', date: '2026-05-02' },
            { id: 'm5', label: 'Release TestFlight', status: 'upcoming', date: '2026-05-20' },
            { id: 'm6', label: 'App Store', status: 'upcoming', date: '2026-05-30' },
        ],
        updates: [
            {
                id: 'u3',
                date: '2026-04-18',
                title: 'Écrans streak + no-trip livrés',
                body: "Les vues streak et état vide sont en place. L'animation de transition entre les deux est plus sobre que la première version — on a retiré la bascule pour garder le rythme.",
                author: 'Noa',
            },
            {
                id: 'u2',
                date: '2026-04-04',
                title: 'Revue DA validée',
                body: "Tu as validé la DA (bleu Klein + tomato), on est partis sur cette base. Le système graphique est posé en composants réutilisables.",
                author: 'Noa',
            },
            {
                id: 'u1',
                date: '2026-03-12',
                title: 'Architecture SwiftUI en place',
                body: 'Structure du projet, navigation, state management via @Observable. On peut commencer à brancher les écrans.',
                author: 'Noa',
            },
        ],
    },
    {
        id: 'whisp-identity',
        name: 'WHISP',
        tagline: "Identité & UX — réseau social vocal.",
        status: 'review',
        progress: 88,
        accent: 'var(--color-tomato)',
        kickoff: '2025-11-04',
        delivery: '2026-04-30',
        milestones: [
            { id: 'm1', label: 'Recherche & positionnement', status: 'done', date: '2025-11-22' },
            { id: 'm2', label: 'Identité visuelle', status: 'done', date: '2025-12-18' },
            { id: 'm3', label: 'Parcours principal', status: 'done', date: '2026-02-10' },
            { id: 'm4', label: 'Écrans secondaires', status: 'done', date: '2026-03-28' },
            { id: 'm5', label: 'Revue finale', status: 'current', date: '2026-04-22' },
            { id: 'm6', label: 'Handoff dev', status: 'upcoming', date: '2026-04-30' },
        ],
        updates: [
            {
                id: 'u1',
                date: '2026-04-20',
                title: 'Revue finale en cours',
                body: "Dernière passe sur les états d'erreur et les micro-interactions. On livre le handoff Figma la semaine prochaine.",
                author: 'Noa',
            },
        ],
    },
]

export const TICKETS: Ticket[] = [
    {
        id: 't-004',
        subject: 'Export Figma — plan des composants',
        body: "Est-ce que tu peux me sortir un plan Figma des composants réutilisables pour la passation à notre équipe tech ?",
        status: 'answered',
        priority: 'normal',
        createdAt: '2026-04-15',
        project: 'whisp-identity',
        messages: [
            {
                id: 'm1',
                from: 'client',
                body: "Est-ce que tu peux me sortir un plan Figma des composants réutilisables pour la passation à notre équipe tech ?",
                at: '2026-04-15T10:14:00',
            },
            {
                id: 'm2',
                from: 'studio',
                body: "Oui, je te prépare un board dédié avec les composants taggés (atoms / molecules). Livraison vendredi.",
                at: '2026-04-15T14:42:00',
            },
        ],
    },
    {
        id: 't-003',
        subject: 'Question sur le TestFlight',
        body: "Comment ça se passe quand on voudra inviter les premiers testeurs externes ?",
        status: 'resolved',
        priority: 'low',
        createdAt: '2026-04-02',
        project: 'vago-ios',
        messages: [
            {
                id: 'm1',
                from: 'client',
                body: "Comment ça se passe quand on voudra inviter les premiers testeurs externes ?",
                at: '2026-04-02T09:00:00',
            },
            {
                id: 'm2',
                from: 'studio',
                body: "Je t'ajoute sur App Store Connect en tant que manager, tu pourras inviter tes testeurs par email directement. Jusqu'à 10 000 testeurs externes.",
                at: '2026-04-02T11:20:00',
            },
        ],
    },
]

export const INVOICES: Invoice[] = [
    {
        id: 'inv-2026-004',
        number: 'F-2026-004',
        project: 'vago-ios',
        amount: 4800,
        status: 'due',
        issued: '2026-04-15',
        due: '2026-05-15',
    },
    {
        id: 'inv-2026-003',
        number: 'F-2026-003',
        project: 'vago-ios',
        amount: 3200,
        status: 'paid',
        issued: '2026-03-02',
        due: '2026-04-02',
    },
    {
        id: 'inv-2026-002',
        number: 'F-2026-002',
        project: 'whisp-identity',
        amount: 5400,
        status: 'paid',
        issued: '2026-02-14',
        due: '2026-03-14',
    },
    {
        id: 'inv-2026-001',
        number: 'F-2026-001',
        project: 'whisp-identity',
        amount: 2800,
        status: 'paid',
        issued: '2026-01-10',
        due: '2026-02-10',
    },
]

export function findProject(id: string | undefined) {
    return PROJECTS.find((p) => p.id === id)
}
export function findTicket(id: string | undefined) {
    return TICKETS.find((t) => t.id === id)
}
export function findInvoice(id: string | undefined) {
    return INVOICES.find((i) => i.id === id)
}
