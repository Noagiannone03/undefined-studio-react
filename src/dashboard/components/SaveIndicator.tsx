export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const LABELS: Record<SaveState, string> = {
    idle: 'Prêt',
    saving: 'Sauvegarde…',
    saved: 'Enregistré ✓',
    error: 'Erreur',
}

export function SaveIndicator({ state, errorMessage }: { state: SaveState; errorMessage?: string | null }) {
    const className = `dash-save-indicator dash-save-indicator--${state}`
    return (
        <span className={className} role="status" aria-live="polite">
            <span className="dash-save-indicator__dot" />
            {state === 'error' && errorMessage ? errorMessage : LABELS[state]}
        </span>
    )
}
