import { NavLink, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth'
import { TICKETS } from '../data'

/**
 * Left-rail navigation for desktop, also rendered inside the mobile sheet.
 * Kept stateless — the sheet open/close is controlled by its parent.
 */

function Item({
    to,
    icon,
    label,
    count,
    onClick,
    end,
}: {
    to: string
    icon: ReactNode
    label: string
    count?: number
    onClick?: () => void
    end?: boolean
}) {
    return (
        <li>
            <NavLink
                to={to}
                end={end}
                onClick={onClick}
                className={({ isActive }) => `dash-nav__item${isActive ? ' is-active' : ''}`}
            >
                <span className="dash-nav__icon" aria-hidden>
                    {icon}
                </span>
                <span>{label}</span>
                {typeof count === 'number' && count > 0 && <span className="dash-nav__count">{count}</span>}
            </NavLink>
        </li>
    )
}

function Initials({ name }: { name: string }) {
    const parts = name.trim().split(/\s+/)
    const a = parts[0]?.[0] ?? ''
    const b = parts[1]?.[0] ?? ''
    return <span className="dash-avatar">{(a + b).toUpperCase() || '–'}</span>
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
    const { user, logout } = useAuth()
    const openTickets = TICKETS.filter((t) => t.status !== 'resolved').length

    return (
        <>
            <Link to="/" className="dash-brand" onClick={onNavigate}>
                undefined<span className="serif-italic">.</span>
            </Link>

            <ul className="dash-nav">
                <Item
                    to="/"
                    end
                    onClick={onNavigate}
                    label="Aperçu"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                    }
                />
                <Item
                    to="/projects"
                    onClick={onNavigate}
                    label="Projets"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4" />
                        </svg>
                    }
                />
                <Item
                    to="/tickets"
                    onClick={onNavigate}
                    label="Tickets"
                    count={openTickets}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M4 6h16v4a2 2 0 000 4v4H4v-4a2 2 0 000-4V6z" />
                            <path d="M10 6v12" strokeDasharray="2 3" />
                        </svg>
                    }
                />
                <Item
                    to="/invoices"
                    onClick={onNavigate}
                    label="Factures"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
                            <path d="M9 8h6M9 12h6M9 16h4" />
                        </svg>
                    }
                />
            </ul>

            <div className="dash-sidebar__foot">
                <div className="dash-sidebar__user">
                    <Initials name={user?.name ?? '?'} />
                    <div style={{ minWidth: 0 }}>
                        <div className="dash-sidebar__user-name">{user?.name ?? 'Invité'}</div>
                        <div className="dash-sidebar__user-email">{user?.email}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        logout()
                        onNavigate?.()
                    }}
                    className="dash-btn dash-btn--ghost"
                    style={{ height: 42, fontSize: 13 }}
                >
                    Se déconnecter
                </button>
            </div>
        </>
    )
}

export function Sidebar() {
    return (
        <aside className="dash-sidebar">
            <SidebarBody />
        </aside>
    )
}
