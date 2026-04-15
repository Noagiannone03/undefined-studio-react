import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Currently — studio availability & live status.
 * Replaces the (gratuitous) process section with something useful:
 * is the studio open, what are we on, when can we start.
 */

type Row = { label: string; value: string; accent?: string }

const ROWS: Row[] = [
    { label: 'Statut', value: 'Ouvert aux projets', accent: 'var(--color-klein)' },
    { label: 'Prochain créneau', value: 'Juin 2026' },
    { label: 'Projets actifs', value: '2 · Product & Brand' },
    { label: 'Base', value: 'Paris — on se déplace' },
    { label: 'Réponse', value: 'Sous 48h, toujours' },
]

export default function Currently() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.cu-header > *', {
                y: 28,
                opacity: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    once: true,
                },
            })

            gsap.from('.cu-row', {
                y: 24,
                opacity: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    once: true,
                },
            })

            gsap.from('.cu-cta', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.5,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    once: true,
                },
            })

            void ScrollTrigger
        },
        { scope: sectionRef }
    )

    return (
        <section
            ref={sectionRef}
            id="currently"
            className="container-x"
            style={{
                background: 'var(--color-paper)',
                paddingTop: 'clamp(100px, 12vw, 180px)',
                paddingBottom: 'clamp(100px, 12vw, 180px)',
                borderTop: '1px solid var(--color-hair)',
            }}
        >
            {/* Header */}
            <div
                className="cu-header"
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 24,
                    marginBottom: 'clamp(48px, 6vw, 80px)',
                }}
            >
                <div>
                    <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                        ( 03 ) — En ce moment
                    </span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(44px, 6.5vw, 96px)',
                            lineHeight: 0.9,
                            margin: 0,
                            letterSpacing: '-0.045em',
                        }}
                    >
                        LE STUDIO{' '}
                        <span className="serif-italic">vit.</span>
                    </h2>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 14px',
                        border: '1px solid var(--color-hair)',
                        borderRadius: 999,
                    }}
                >
                    <span
                        className="blink"
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--color-klein)',
                        }}
                    />
                    <span
                        className="mono"
                        style={{ fontSize: 11, letterSpacing: '0.2em' }}
                    >
                        LIVE
                    </span>
                </div>
            </div>

            {/* Rows table */}
            <div
                style={{
                    borderTop: '1px solid var(--color-hair)',
                    marginBottom: 'clamp(48px, 6vw, 80px)',
                }}
            >
                {ROWS.map((row) => (
                    <div
                        key={row.label}
                        className="cu-row"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'clamp(140px, 18vw, 220px) 1fr auto',
                            gap: 'clamp(16px, 3vw, 32px)',
                            alignItems: 'center',
                            padding: 'clamp(18px, 2.2vw, 28px) 0',
                            borderBottom: '1px solid var(--color-hair)',
                        }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                letterSpacing: '0.22em',
                                color: 'var(--color-ink-mute)',
                            }}
                        >
                            {row.label}
                        </span>
                        <span
                            className="display"
                            style={{
                                fontSize: 'clamp(22px, 2.6vw, 36px)',
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                                color: row.accent ?? 'var(--color-ink)',
                            }}
                        >
                            {row.value}
                        </span>
                        <span
                            className="serif-italic"
                            style={{
                                fontSize: 'clamp(13px, 1.1vw, 15px)',
                                color: 'var(--color-ink-mute)',
                            }}
                        >
                            →
                        </span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div
                className="cu-cta"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 24,
                }}
            >
                <p
                    className="serif"
                    style={{
                        fontSize: 'clamp(18px, 1.6vw, 24px)',
                        lineHeight: 1.4,
                        maxWidth: '42ch',
                        margin: 0,
                        color: 'var(--color-ink)',
                    }}
                >
                    Un projet en tête ? Racontez-le en deux phrases.
                    On lit tout.
                </p>
                <a
                    href="mailto:hello@undefined.co"
                    className="u-draw display"
                    style={{
                        fontSize: 'clamp(24px, 3vw, 44px)',
                        letterSpacing: '-0.03em',
                        color: 'var(--color-tomato)',
                        textDecoration: 'none',
                    }}
                >
                    hello@undefined.co →
                </a>
            </div>
        </section>
    )
}
