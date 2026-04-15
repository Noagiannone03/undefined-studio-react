import { useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * BrandMark — radial vortex moment.
 * 24 chevrons explode outward in a circle, rotate as a constellation,
 * cycle through brand colors, then implode into a single mark at the
 * centre. Pinned, scrubbed, dramatic. A real transition experience.
 */

const COUNT = 24
const RING_RADIUS = 44 // vmin — final distance from centre

export default function BrandMark() {
    const ref = useRef<HTMLElement>(null)

    // Pre-compute positions once
    const chevrons = useMemo(() => {
        return Array.from({ length: COUNT }, (_, i) => {
            const angle = (i / COUNT) * Math.PI * 2
            const palette = ['var(--color-ink)', 'var(--color-klein)', 'var(--color-tomato)']
            return {
                angle,
                x: Math.cos(angle) * RING_RADIUS,
                y: Math.sin(angle) * RING_RADIUS,
                rotationDeg: (angle * 180) / Math.PI,
                baseColor: palette[i % 3],
                delay: i * 0.02,
            }
        })
    }, [])

    useLayoutEffect(() => {
        const section = ref.current
        if (!section) return

        const ctx = gsap.context(() => {
            const stage = section.querySelector<HTMLDivElement>('.vx-stage')
            const centreMark = section.querySelector<SVGSVGElement>('.vx-centre')
            const centreChevrons = section.querySelectorAll('.vx-centre .mark-chev')
            const ring = section.querySelector<HTMLDivElement>('.vx-ring')
            const satellites = section.querySelectorAll<HTMLDivElement>('.vx-satellite')
            const word = section.querySelector<HTMLHeadingElement>('.vx-word')
            const wordChars = section.querySelectorAll('.vx-word .c')
            const caption = section.querySelector<HTMLParagraphElement>('.vx-caption')
            const meta = section.querySelectorAll<HTMLElement>('.vx-meta')

            // Initial state — all satellites collapsed at centre, invisible
            gsap.set(satellites, {
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
                rotation: 0,
            })
            gsap.set(centreMark, { scale: 1, opacity: 1 })
            gsap.set(centreChevrons, { strokeDashoffset: 80 })
            gsap.set(word, { opacity: 0, scale: 0.92 })
            gsap.set(wordChars, { yPercent: 130, opacity: 0 })
            gsap.set(caption, { opacity: 0, y: 20 })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=300%',
                    scrub: 1.1,
                    pin: true,
                    anticipatePin: 1,
                },
            })

            // --- PHASE 1 — draw centre mark, flip bg to ink ---
            tl.to(centreChevrons, {
                strokeDashoffset: 0,
                duration: 1,
                ease: 'power2.out',
                stagger: 0.15,
            }, 0)
                .to(stage, {
                    backgroundColor: '#0E0E0C',
                    duration: 1,
                    ease: 'none',
                }, 0.6)
                .to(centreChevrons, {
                    stroke: '#EFEBDD',
                    duration: 0.8,
                    ease: 'none',
                }, 0.6)
                .to(meta, {
                    color: 'rgba(239,235,221,0.45)',
                    duration: 0.8,
                    ease: 'none',
                }, 0.6)

            // --- PHASE 2 — satellites EXPLODE outward ---
            satellites.forEach((sat, i) => {
                const { x, y, rotationDeg } = chevrons[i]
                tl.to(sat, {
                    x: `${x}vmin`,
                    y: `${y}vmin`,
                    scale: 1,
                    opacity: 1,
                    rotation: rotationDeg,
                    duration: 1.1,
                    ease: 'expo.out',
                }, 1.2 + i * 0.018)
            })
            // Centre mark pulses as they fly
            tl.to(centreMark, {
                scale: 1.25,
                duration: 0.6,
                ease: 'sine.inOut',
            }, 1.4)
                .to(centreMark, {
                    scale: 1,
                    duration: 0.5,
                    ease: 'sine.inOut',
                }, 2.0)

            // --- PHASE 3 — the constellation rotates, colours cycle ---
            tl.to(ring, {
                rotation: 180,
                duration: 2.2,
                ease: 'sine.inOut',
                transformOrigin: 'center center',
            }, 2.4)
            // Colour cycle on satellites — stagger rainbow
            tl.to(satellites, {
                keyframes: [
                    { color: 'var(--color-tomato)', duration: 0.4 },
                    { color: 'var(--color-klein)', duration: 0.4 },
                    { color: 'var(--color-paper)', duration: 0.4 },
                ],
                stagger: { each: 0.04, from: 'random' },
                ease: 'none',
            }, 2.6)

            // --- PHASE 4 — IMPLODE. satellites rush back to centre ---
            tl.to(satellites, {
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
                rotation: '+=180',
                duration: 0.9,
                ease: 'expo.in',
                stagger: { each: 0.012, from: 'edges' },
            }, 4.7)

            // Centre mark FLASHES at impact
            tl.to(centreMark, {
                scale: 1.8,
                duration: 0.25,
                ease: 'power4.out',
            }, 5.2)
                .to(centreChevrons, {
                    stroke: (_, target) => {
                        const path = target as SVGPathElement
                        return path.classList.contains('mark-chev-1')
                            ? '#E84A2A'
                            : '#1D1DBF'
                    },
                    duration: 0.2,
                    ease: 'none',
                }, 5.2)
                .to(centreMark, {
                    scale: 1,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.55)',
                }, 5.45)

            // --- PHASE 5 — wordmark + caption reveal ---
            tl.to(word, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'power3.out',
            }, 5.5)
                .to(wordChars, {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.9,
                    stagger: 0.035,
                    ease: 'expo.out',
                }, 5.55)
                .to(caption, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                }, 6.0)
        }, ref)

        return () => {
            ctx.revert()
            ScrollTrigger.refresh()
        }
    }, [chevrons])

    const splitWord = (s: string) =>
        s.split('').map((ch, i) => (
            <span
                key={i}
                className="c"
                style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            >
                {ch === ' ' ? '\u00A0' : ch}
            </span>
        ))

    return (
        <section
            ref={ref}
            id="brand-mark"
            aria-label="Undefined — vortex"
            style={{ position: 'relative' }}
        >
            <div
                className="vx-stage"
                style={{
                    height: '100vh',
                    width: '100%',
                    background: 'var(--color-paper)',
                    position: 'relative',
                    overflow: 'hidden',
                    willChange: 'background-color',
                }}
            >
                <div className="grain" />

                {/* Meta corners */}
                <span
                    className="vx-meta mono"
                    style={{
                        position: 'absolute',
                        top: 'clamp(24px, 4vw, 40px)',
                        left: 'var(--side-spacing)',
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        color: 'rgba(14,14,12,0.4)',
                        zIndex: 10,
                    }}
                >
                    — LA SIGNATURE
                </span>
                <span
                    className="vx-meta mono"
                    style={{
                        position: 'absolute',
                        top: 'clamp(24px, 4vw, 40px)',
                        right: 'var(--side-spacing)',
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        color: 'rgba(14,14,12,0.4)',
                        zIndex: 10,
                    }}
                >
                    ( {String(COUNT).padStart(2, '0')} CHEVRONS )
                </span>
                <span
                    className="vx-meta mono"
                    style={{
                        position: 'absolute',
                        bottom: 'clamp(24px, 4vw, 40px)',
                        left: 'var(--side-spacing)',
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        color: 'rgba(14,14,12,0.3)',
                        zIndex: 10,
                    }}
                >
                    ↓ DÉFILER
                </span>
                <span
                    className="vx-meta mono"
                    style={{
                        position: 'absolute',
                        bottom: 'clamp(24px, 4vw, 40px)',
                        right: 'var(--side-spacing)',
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        color: 'rgba(14,14,12,0.3)',
                        zIndex: 10,
                    }}
                >
                    UNDEFINED · 2026
                </span>

                {/* The stage — satellite ring + centre mark + wordmark */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                    }}
                >
                    {/* Rotating ring of satellite chevrons */}
                    <div
                        className="vx-ring"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 0,
                            height: 0,
                            transformOrigin: 'center center',
                            willChange: 'transform',
                            zIndex: 1,
                        }}
                    >
                        {chevrons.map((c, i) => (
                            <div
                                key={i}
                                className="vx-satellite"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    transform: 'translate(-50%, -50%)',
                                    willChange: 'transform, opacity, color',
                                    color: c.baseColor,
                                }}
                            >
                                <Chev size={48} color="currentColor" />
                            </div>
                        ))}
                    </div>

                    {/* Centre mark */}
                    <svg
                        className="vx-centre"
                        viewBox="0 0 40 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: 'clamp(160px, 22vw, 320px)',
                            height: 'auto',
                            position: 'relative',
                            zIndex: 3,
                            overflow: 'visible',
                            willChange: 'transform',
                        }}
                        aria-hidden
                    >
                        <path
                            className="mark-chev mark-chev-1"
                            d="M2 2L16 14L2 26"
                            stroke="var(--color-ink)"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ strokeDasharray: 80, strokeDashoffset: 80 }}
                        />
                        <path
                            className="mark-chev mark-chev-2"
                            d="M18 2L32 14L18 26"
                            stroke="var(--color-ink)"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ strokeDasharray: 80, strokeDashoffset: 80 }}
                        />
                    </svg>

                    {/* Wordmark under the centre mark — revealed at end */}
                    <h2
                        className="vx-word display"
                        style={{
                            position: 'absolute',
                            top: 'calc(50% + clamp(100px, 14vw, 200px))',
                            left: '50%',
                            transform: 'translate(-50%, 0)',
                            fontSize: 'clamp(44px, 7vw, 112px)',
                            letterSpacing: '-0.05em',
                            lineHeight: 1,
                            margin: 0,
                            color: 'var(--color-paper)',
                            whiteSpace: 'nowrap',
                            zIndex: 4,
                            overflow: 'hidden',
                            padding: '0 0.1em',
                            willChange: 'transform, opacity',
                        }}
                    >
                        {splitWord('UNDEFINED STUDIO')}
                    </h2>
                </div>

                {/* Caption */}
                <p
                    className="vx-caption serif-italic"
                    style={{
                        position: 'absolute',
                        bottom: 'clamp(80px, 12vw, 140px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 'clamp(15px, 1.4vw, 20px)',
                        color: 'rgba(239,235,221,0.65)',
                        textAlign: 'center',
                        margin: 0,
                        zIndex: 5,
                        maxWidth: 500,
                        lineHeight: 1.4,
                        willChange: 'transform, opacity',
                    }}
                >
                    Un signe. Une direction.
                </p>
            </div>
        </section>
    )
}

function Chev({ size = 48, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg
            width={size}
            height={Math.round(size * 0.7)}
            viewBox="0 0 40 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
            aria-hidden
        >
            <path
                d="M2 2L16 14L2 26"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18 2L32 14L18 26"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
