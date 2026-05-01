import type { ProjectStatus } from './types'

export type ProjectStatusGroup = 'active' | 'done' | 'paused' | 'waiting'
type Tone = 'mute' | 'klein' | 'tomato' | 'ink'

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatusGroup; label: string; tone: Tone }[] = [
    { value: 'active', label: 'En cours', tone: 'klein' },
    { value: 'done', label: 'Terminé', tone: 'ink' },
    { value: 'paused', label: 'En pause', tone: 'mute' },
    { value: 'waiting', label: 'En attente', tone: 'tomato' },
]

export function projectStatusGroup(status: ProjectStatus): ProjectStatusGroup {
    if (status === 'done' || status === 'live') return 'done'
    if (status === 'paused') return 'paused'
    if (status === 'waiting' || status === 'discovery') return 'waiting'
    return 'active'
}

export function projectStatusLabel(status: ProjectStatus): string {
    const group = projectStatusGroup(status)
    return PROJECT_STATUS_OPTIONS.find((option) => option.value === group)?.label ?? 'En cours'
}

export function isProjectActive(status: ProjectStatus): boolean {
    return projectStatusGroup(status) === 'active'
}

export function isProjectDone(status: ProjectStatus): boolean {
    return projectStatusGroup(status) === 'done'
}

export function isProjectPaused(status: ProjectStatus): boolean {
    return projectStatusGroup(status) === 'paused'
}

export function isProjectWaiting(status: ProjectStatus): boolean {
    return projectStatusGroup(status) === 'waiting'
}
