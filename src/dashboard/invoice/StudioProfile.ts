/**
 * Émetteur (toi) — apparaît sur toutes les factures.
 * Édite ici si SIRET / adresse / téléphone changent.
 */
export const STUDIO_PROFILE = {
    name: 'GIANNONE NOA',
    phone: '06 22 92 29 60',
    email: 'noa.giannone@gmail.com',
    website: 'noagiannone.fr',
    address: '63 rue de lissandre, 13014 Marseille',
    legalForm: 'Auto-entrepreneur',
    siret: '98862364100012',
    vatMention: 'TVA non applicable, art. 293 B du CGI',
} as const

export type StudioProfile = typeof STUDIO_PROFILE
