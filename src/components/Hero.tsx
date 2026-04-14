import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Mark from './Mark'

/**
 * Hero — soft-pop neo-brutalist opener.
 * Massive stacked display headline, klein caption box, bottom meta row.
 * Registration of ScrollTrigger happens in App.tsx.
 */
export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.hero-topbar > *', {
                y: -20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.08,
            })

            gsap.from('.hero-line', {
                yPercent: 110,
                duration: 1.2,
                stagger: 0.12,
                ease: 'expo.out',
                delay: 0.2,
            })

            gsap.from('.hero-caption', {
                y: 30,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.8,
            })

            gsap.from('.hero-bottom > *', {
                opacity: 0,
                y: 10,
                duration: 0.7,
                stagger: 0.06,
                ease: 'power2.out',
                delay: 1.1,
            })

            gsap.to('.hero-headline', {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            })

            // Silence unused-import warning; ScrollTrigger is registered globally
            void ScrollTrigger
        },
        { scope: containerRef }
    )

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-screen flex flex-col container-x overflow-hidden"
        >
            <div className="grain" />

            <div className="hero-topbar flex items-center justify-between pt-8 pb-0 relative z-10">
                <span
                    className="mono"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    UNDEFINED
                    <Mark size={14} animate />
                </span>
                <div className="flex items-center gap-6">
                    <span
                        style={{
                            border: '2px solid var(--color-ink)',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                        }}
                    >
                        STUDIO
                    </span>
                    <span className="mono label-soft">2026</span>
                </div>
            </div>

            <div
                className="flex-1 flex flex-col justify-center relative z-10"
                style={{ paddingTop: 'clamp(40px, 6vw, 80px)' }}
            >
                <h1
                    className="hero-headline"
                    style={{
                        marginBottom: 'clamp(32px, 4vw, 64px)',
                    }}
                >
                    {/* Line 1 — brutal display */}
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span
                            className="reveal-line hero-line display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(72px, 14vw, 210px)',
                                lineHeight: 0.88,
                                letterSpacing: '-0.045em',
                            }}
                        >
                            WE BUILD
                        </span>
                    </span>
                    {/* Line 2 — serif italic contrast */}
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span
                            className="reveal-line hero-line serif-italic"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(68px, 13vw, 195px)',
                                lineHeight: 0.92,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            things
                        </span>
                    </span>
                    {/* Line 3 — brutal display with tomato accent */}
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span
                            className="reveal-line hero-line display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(72px, 14vw, 210px)',
                                lineHeight: 0.88,
                                letterSpacing: '-0.045em',
                            }}
                        >
                            THAT{' '}
                            <span style={{ color: 'var(--color-tomato)' }}>MOVE.</span>
                        </span>
                    </span>
                </h1>

                <div
                    className="hero-caption"
                    style={{
                        border: '2px solid var(--color-klein)',
                        boxShadow: '5px 5px 0 var(--color-klein)',
                        padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 32px)',
                        maxWidth: 'clamp(300px, 40vw, 560px)',
                        marginBottom: 'clamp(40px, 6vw, 80px)',
                        background: 'var(--color-paper)',
                    }}
                >
                    <p
                        className="serif"
                        style={{
                            fontSize: 'clamp(16px, 1.8vw, 24px)',
                            lineHeight: 1.35,
                            margin: 0,
                        }}
                    >
                        Digital experiences at the intersection of design &amp; technology.
                    </p>
                </div>
            </div>

            <div className="hero-bottom flex items-center justify-between pb-8 hair-t pt-5 relative z-10">
                <div className="flex items-center gap-6">
                    {['DESIGN', 'MOTION', 'CODE', 'BRAND'].map((tag, i) => (
                        <span key={tag} className="mono label-soft">
                            {tag}
                            {i < 3 ? (
                                <span style={{ color: 'var(--color-klein)', marginLeft: 10 }}>
                                    ★
                                </span>
                            ) : null}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-3 mono">
                    <span
                        className="blink"
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--color-tomato)',
                            display: 'inline-block',
                        }}
                    />
                    SCROLL ↓
                </div>
            </div>
        </section>
    )
}
