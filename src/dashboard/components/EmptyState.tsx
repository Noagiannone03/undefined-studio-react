import type { ReactNode } from 'react'

export function EmptyState({
    title,
    body,
    action,
}: {
    title: string
    body?: string
    action?: ReactNode
}) {
    return (
        <div className="dash-empty">
            <span className="dash-kicker">— Rien ici</span>
            <h3 className="dash-h2">{title}</h3>
            {body && <p className="dash-sub">{body}</p>}
            {action}
        </div>
    )
}
