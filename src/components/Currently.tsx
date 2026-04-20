import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

            gsap.from('.cu-block', {
                y: 24,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.cu-grid',
                    start: 'top 80%',
                    once: true,
                },
            })

            gsap.from('.cu-cta', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.cu-cta',
                    start: 'top 88%',
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
                style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}
            >
                <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                    ( 05 ) — Parlons
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
                    PROCHAIN{' '}
                    <span className="serif-italic">projet ?</span>
                </h2>
            </div>

            {/* Info grid */}
            <div
                className="cu-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 0,
                    borderTop: '1px solid var(--color-hair)',
                    marginBottom: 'clamp(56px, 7vw, 96px)',
                }}
            >
                <InfoBlock
                    label="Statut"
                    value="Ouvert aux projets"
                    accent="var(--color-klein)"
                />
                <InfoBlock
                    label="Prochain créneau"
                    value="Juin 2026"
                />
                <InfoBlock
                    label="Localisation"
                    value="Paris · Remote · On se déplace"
                />
                <InfoBlock
                    label="Réponse"
                    value="Sous 48h, toujours"
                />
            </div>

            {/* CTA */}
            <div
                className="cu-cta"
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'clamp(24px, 4vw, 48px)',
                }}
            >
                <div style={{ maxWidth: '38ch' }}>
                    <p
                        className="serif"
                        style={{
                            fontSize: 'clamp(18px, 1.8vw, 26px)',
                            lineHeight: 1.4,
                            margin: 0,
                            color: 'var(--color-ink)',
                        }}
                    >
                        Un projet en tête, une idée à concrétiser,
                        un truc à construire — on en parle.
                    </p>
                </div>
                <a
                    href="mailto:hello@undefined.co"
                    className="u-draw display"
                    style={{
                        fontSize: 'clamp(28px, 4vw, 56px)',
                        letterSpacing: '-0.03em',
                        color: 'var(--color-tomato)',
                        textDecoration: 'none',
                        lineHeight: 1,
                    }}
                >
                    hello@undefined.co →
                </a>
            </div>
        </section>
    )
}

function InfoBlock({
    label,
    value,
    accent,
}: {
    label: string
    value: string
    accent?: string
}) {
    return (
        <div
            className="cu-block"
            style={{
                padding: 'clamp(20px, 2.5vw, 32px) clamp(16px, 2vw, 28px)',
                borderBottom: '1px solid var(--color-hair)',
                borderRight: '1px solid var(--color-hair)',
            }}
        >
            <span
                className="mono"
                style={{
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: 'var(--color-ink-mute)',
                    display: 'block',
                    marginBottom: 'clamp(10px, 1.2vw, 16px)',
                }}
            >
                {label}
            </span>
            <span
                className="display"
                style={{
                    fontSize: 'clamp(20px, 2.2vw, 32px)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: accent ?? 'var(--color-ink)',
                }}
            >
                {value}
            </span>
        </div>
    )
}
