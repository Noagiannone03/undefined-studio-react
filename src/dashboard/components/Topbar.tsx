import { useMatches } from 'react-router-dom'
import { useAuth } from '../auth'

type HandleWithTitle = { title?: string }

export function Topbar({ onMenu }: { onMenu: () => void }) {
    const matches = useMatches()
    const { user } = useAuth()
    const last = matches[matches.length - 1]
    const title =
        (last?.handle as HandleWithTitle | undefined)?.title ?? 'Aperçu'

    const initials = (user?.name ?? '?')
        .split(/\s+/)
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className="dash-topbar">
            <div className="dash-row" style={{ minWidth: 0 }}>
                <button type="button" onClick={onMenu} className="dash-menu-btn" aria-label="Menu">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" width="18" height="18">
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>
                <h1 className="dash-topbar__title">{title}</h1>
            </div>

            <div className="dash-topbar__user">
                <span className="dash-avatar" aria-hidden>
                    {initials || '–'}
                </span>
            </div>
        </header>
    )
}
