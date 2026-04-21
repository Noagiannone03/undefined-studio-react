import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS_L1 = ['CE', "QU'ON"]
const WORDS_L2 = ['a', 'fait.']

export default function BrandMark() {
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!sectionRef.current) return

        const ctx = gsap.context(() => {
            // ── SVG stroke draw ──────────────────────────────────────────
            gsap.set('.bm-path', {
                strokeDasharray: 54,
                strokeDashoffset: 54,
                opacity: 1,
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 72%',
                    toggleActions: 'play none none none',
                },
                defaults: { ease: 'expo.out' },
            })

            // 1. Chevron gauche dessine (Klein)
            tl.to('.bm-path-l', {
                strokeDashoffset: 0,
                duration: 0.9,
            })
            // 2. Chevron droit dessine (Tomato) — légèrement décalé
            tl.to('.bm-path-r', {
                strokeDashoffset: 0,
                duration: 0.9,
            }, '-=0.6')

            // 3. Ligne 1 — chaque mot sort de son masque, direction alternée
            tl.from('.bm-w1', {
                yPercent: 115,
                duration: 1.05,
                stagger: 0.07,
            }, '-=0.45')

            // 4. Ligne 2 — arrive en sens inverse (yPercent: -115) + léger skew
            tl.from('.bm-w2', {
                yPercent: -115,
                skewY: -4,
                duration: 1.10,
                stagger: 0.07,
            }, '-=0.75')

            // 5. Trait horizontal sweep
            tl.fromTo('.bm-rule', {
                scaleX: 0,
                transformOrigin: 'left center',
            }, {
                scaleX: 1,
                duration: 0.9,
                ease: 'power4.out',
            }, '-=0.5')

            // 6. Label fade
            tl.from('.bm-label', {
                opacity: 0,
                y: 10,
                duration: 0.7,
                ease: 'power3.out',
            }, '-=0.5')

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="brand-mark"
            style={{
                background: 'var(--color-ink)',
                padding: 'clamp(80px, 12vw, 160px) var(--side-spacing)',
                overflow: 'hidden',
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'clamp(20px, 3.5vw, 56px)',
                userSelect: 'none',
            }}>

                {/* ── >> Chevrons ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 14px)' }}>
                    <svg
                        viewBox="0 0 28 40" fill="none" overflow="visible"
                        style={{
                            width: 'clamp(28px, 4.5vw, 68px)',
                            display: 'block',
                            filter: 'drop-shadow(0 0 28px rgba(29,29,191,0.7))',
                        }}
                    >
                        <path className="bm-path bm-path-l"
                            d="M4 4L22 20L4 36"
                            stroke="#1D1DBF" strokeWidth="3.4"
                            strokeLinecap="round" strokeLinejoin="round"
                            fill="none"
                        />
                    </svg>
                    <svg
                        viewBox="0 0 28 40" fill="none" overflow="visible"
                        style={{
                            width: 'clamp(28px, 4.5vw, 68px)',
                            display: 'block',
                            filter: 'drop-shadow(0 0 28px rgba(232,74,42,0.7))',
                        }}
                    >
                        <path className="bm-path bm-path-r"
                            d="M4 4L22 20L4 36"
                            stroke="#E84A2A" strokeWidth="3.4"
                            strokeLinecap="round" strokeLinejoin="round"
                            fill="none"
                        />
                    </svg>
                </div>

                {/* ── Texte principal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                    {/* Ligne 1 : CE QU'ON — slide depuis le bas */}
                    <div style={{ display: 'flex', gap: 'clamp(16px, 2.6vw, 48px)', flexWrap: 'wrap' }}>
                        {WORDS_L1.map((w) => (
                            <div key={w} style={{ overflow: 'hidden', lineHeight: 0.86 }}>
                                <span
                                    className="display bm-w1"
                                    style={{
                                        display: 'block',
                                        fontSize: 'clamp(72px, 17vw, 260px)',
                                        color: 'var(--color-paper)',
                                        letterSpacing: '-0.048em',
                                        lineHeight: 0.86,
                                    }}
                                >
                                    {w}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Ligne 2 : a fait. — slide depuis le haut (direction opposée) */}
                    <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 36px)', flexWrap: 'wrap' }}>
                        {WORDS_L2.map((w) => (
                            <div key={w} style={{ overflow: 'hidden', lineHeight: 0.92 }}>
                                <span
                                    className="serif-italic bm-w2"
                                    style={{
                                        display: 'block',
                                        fontSize: 'clamp(66px, 15.5vw, 240px)',
                                        color: 'var(--color-paper)',
                                        letterSpacing: '-0.03em',
                                        lineHeight: 0.92,
                                    }}
                                >
                                    {w}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Trait + label ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 28px)', width: '100%' }}>
                    <div
                        className="bm-rule"
                        style={{
                            flex: 1,
                            height: 1,
                            background: 'rgba(239,235,221,0.18)',
                        }}
                    />
                    <span
                        className="mono label-soft bm-label"
                        style={{
                            fontSize: 10,
                            letterSpacing: '0.26em',
                            color: 'var(--color-paper)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                    >
                        — Nos projets
                    </span>
                </div>
            </div>
        </section>
    )
}
