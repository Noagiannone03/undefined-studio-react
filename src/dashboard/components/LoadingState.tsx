import type { ButtonHTMLAttributes, ReactNode } from 'react'

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean
    loadingLabel?: string
    children: ReactNode
}

export function LoadingButton({ loading = false, loadingLabel, children, className, disabled, ...props }: LoadingButtonProps) {
    return (
        <button
            {...props}
            className={className}
            disabled={disabled || loading}
            aria-busy={loading}
        >
            {loading && <span className="dash-loader-dot" aria-hidden />}
            <span className="dash-loader-label">{loading ? loadingLabel ?? children : children}</span>
        </button>
    )
}

export function FullPageLoader({ label = 'Chargement du compte' }: { label?: string }) {
    return (
        <div className="dash-root dash-loading-page" aria-busy="true" aria-live="polite">
            <div className="dash-loading-card">
                <span className="dash-kicker">Connexion sécurisée</span>
                <div className="dash-loading-mark" aria-hidden>
                    <span />
                    <span />
                    <span />
                </div>
                <h1>{label}</h1>
                <div className="dash-loading-bar" aria-hidden />
            </div>
        </div>
    )
}

export function DashboardSkeleton({ label = 'Chargement du dashboard' }: { label?: string }) {
    return (
        <div className="dash-stack-lg dash-skeleton-wrap" aria-busy="true" aria-live="polite">
            <header className="dash-page-head">
                <span className="dash-kicker">{label}</span>
                <div className="dash-skeleton dash-skeleton--title" />
                <div className="dash-skeleton dash-skeleton--text" />
            </header>

            <section className="dash-grid dash-grid--4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="dash-card dash-skeleton-card">
                        <div className="dash-skeleton dash-skeleton--kicker" />
                        <div className="dash-skeleton dash-skeleton--metric" />
                    </div>
                ))}
            </section>

            <div className="dash-overview-layout">
                <div className="dash-overview-main">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="dash-card dash-skeleton-panel">
                            <div className="dash-skeleton dash-skeleton--row-title" />
                            <div className="dash-skeleton dash-skeleton--text" />
                            <div className="dash-skeleton dash-skeleton--line" />
                        </div>
                    ))}
                </div>
                <aside className="dash-overview-side">
                    <div className="dash-card dash-skeleton-panel">
                        <div className="dash-skeleton dash-skeleton--row-title" />
                        <div className="dash-skeleton dash-skeleton--text" />
                        <div className="dash-skeleton dash-skeleton--text short" />
                    </div>
                </aside>
            </div>
        </div>
    )
}
