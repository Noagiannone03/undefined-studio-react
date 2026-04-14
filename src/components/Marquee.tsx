/**
 * Marquee — dark infinite scrolling band.
 * Uses the existing CSS `marq` keyframes from index.css.
 * Two identical track halves for a seamless loop.
 */

const ITEMS = [
    'DESIGN',
    'MOTION',
    'CODE',
    'BRAND',
    'EXPERIENCE',
    'DIGITAL',
    'UNDEFINED',
]

function Track() {
    return (
        <div className="flex items-center shrink-0">
            {ITEMS.map((item) => (
                <span
                    key={item}
                    className="mono flex items-center"
                    style={{
                        padding: '0 28px',
                        fontSize: 13,
                        letterSpacing: '0.22em',
                        color: 'var(--color-paper)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item}
                    <span
                        aria-hidden
                        style={{
                            color: 'var(--color-klein)',
                            marginLeft: 28,
                            fontSize: 14,
                        }}
                    >
                        ★
                    </span>
                </span>
            ))}
        </div>
    )
}

export default function Marquee() {
    return (
        <section
            aria-label="brand marquee"
            style={{
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
                height: 48,
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <div className="marq flex" style={{ width: 'max-content' }}>
                <Track />
                <Track />
            </div>
        </section>
    )
}
