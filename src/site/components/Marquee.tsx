/**
 * Marquee — neo-brutal scrolling strip.
 * Paper background, display font, Mark separators bicolores (blue / orange).
 */
import Mark from './Mark'

const ITEMS = ["UTILE D'ABORD", 'FAIT MAIN', 'APPS iOS · WEB', 'MARSEILLE', 'LA TECH AU SERVICE', 'DU CODE QUI DURE', 'SANS BULLSHIT', '2024 —']

export default function Marquee() {
    return (
        <section
            aria-label="brand marquee"
            style={{
                background: 'var(--color-paper)',
                borderTop: '2px solid var(--color-ink)',
                borderBottom: '2px solid var(--color-ink)',
                overflow: 'hidden',
                padding: 'clamp(14px, 2vw, 22px) 0',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    width: 'max-content',
                    animation: 'marq 50s linear infinite',
                    alignItems: 'center',
                }}
            >
                {[0, 1].map((copy) => (
                    <span key={copy} style={{ display: 'flex', alignItems: 'center' }}>
                        {ITEMS.map((item, i) => (
                            <span
                                key={i}
                                style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                                <span
                                    className="display"
                                    style={{
                                        fontSize: 'clamp(22px, 3vw, 44px)',
                                        letterSpacing: '-0.04em',
                                        padding: '0 clamp(18px, 2.5vw, 36px)',
                                        color: 'var(--color-ink)',
                                        lineHeight: 1,
                                    }}
                                >
                                    {item}
                                </span>
                                <Mark
                                    size={i % 2 === 0 ? 26 : 22}
                                    color={i % 2 === 0 ? 'var(--color-klein)' : 'var(--color-tomato)'}
                                    color2={i % 2 === 0 ? 'var(--color-tomato)' : 'var(--color-klein)'}
                                />
                            </span>
                        ))}
                    </span>
                ))}
            </div>
        </section>
    )
}
