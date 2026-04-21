import { useRef } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
    useSpring,
} from 'motion/react'

const SCROLL_VH = 260

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    })

    const s = useSpring(scrollYProgress, { stiffness: 50, damping: 22, restDelta: 0.0001 })

    // ── Chevrons ─────────────────────────────────────────────────────────
    const chevLX  = useTransform(s, [0.02, 0.18], [-300, 0])
    const chevLOp = useTransform(s, [0.02, 0.16], [0, 1])
    const chevRX  = useTransform(s, [0.05, 0.22], [300, 0])
    const chevROp = useTransform(s, [0.05, 0.20], [0, 1])

    // glow intensity
    const glowL = useTransform(s, [0.05, 0.30, 0.70], [0, 0.8, 0.5])
    const glowR = useTransform(s, [0.08, 0.34, 0.70], [0, 0.8, 0.5])
    const filterL = useMotionTemplate`drop-shadow(0 0 40px rgba(29,29,191,${glowL}))`
    const filterR = useMotionTemplate`drop-shadow(0 0 40px rgba(232,74,42,${glowR}))`

    // ── "CE QU'ON" — arrive de gauche, hors écran ─────────────────────────
    const line1X  = useTransform(s, [0.20, 0.40], ['-110vw', '0vw'])
    const line1Op = useTransform(s, [0.20, 0.36], [0, 1])

    // ── "a fait." — arrive de droite ──────────────────────────────────────
    const line2X  = useTransform(s, [0.28, 0.48], ['110vw', '0vw'])
    const line2Op = useTransform(s, [0.28, 0.44], [0, 1])

    // ── Label bas ─────────────────────────────────────────────────────────
    const labelOp = useTransform(s, [0.42, 0.56], [0, 1])
    const labelY  = useTransform(s, [0.42, 0.56], [14, 0])

    return (
        <section
            ref={wrapperRef}
            id="brand-mark"
            style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}
        >
            <div style={{
                position: 'sticky',
                top: 0,
                minHeight: '100vh',
                overflow: 'hidden',
                background: 'var(--color-ink)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Grain */}
                <div className="grain" style={{ opacity: 0.05, zIndex: 1, pointerEvents: 'none' }} />

                <div style={{
                    position: 'relative',
                    zIndex: 5,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'clamp(12px, 2vw, 32px)',
                    userSelect: 'none',
                }}>

                    {/* ── >> Chevrons ── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(4px, 1vw, 18px)',
                    }}>
                        <motion.svg
                            viewBox="0 0 28 40" fill="none" overflow="visible"
                            style={{
                                width: 'clamp(36px, 6.5vw, 100px)',
                                x: chevLX,
                                opacity: chevLOp,
                                filter: filterL,
                            }}
                        >
                            <path d="M4 4L22 20L4 36" stroke="#1D1DBF" strokeWidth="3.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>

                        <motion.svg
                            viewBox="0 0 28 40" fill="none" overflow="visible"
                            style={{
                                width: 'clamp(36px, 6.5vw, 100px)',
                                x: chevRX,
                                opacity: chevROp,
                                filter: filterR,
                            }}
                        >
                            <path d="M4 4L22 20L4 36" stroke="#E84A2A" strokeWidth="3.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                    </div>

                    {/* ── Ligne 1 : CE QU'ON — déboule depuis la gauche ── */}
                    <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' }}>
                        <motion.span
                            className="display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(64px, 16vw, 240px)',
                                color: 'var(--color-paper)',
                                letterSpacing: '-0.048em',
                                lineHeight: 0.88,
                                x: line1X,
                                opacity: line1Op,
                            }}
                        >
                            CE QU'ON
                        </motion.span>
                    </div>

                    {/* ── Ligne 2 : a fait. — déboule depuis la droite ── */}
                    <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' }}>
                        <motion.span
                            className="serif-italic"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(60px, 15vw, 220px)',
                                color: 'var(--color-paper)',
                                letterSpacing: '-0.03em',
                                lineHeight: 0.90,
                                x: line2X,
                                opacity: line2Op,
                            }}
                        >
                            a fait.
                        </motion.span>
                    </div>

                    {/* ── Label de transition ── */}
                    <motion.span
                        className="mono label-soft"
                        style={{
                            fontSize: 10,
                            letterSpacing: '0.28em',
                            color: 'var(--color-paper)',
                            opacity: labelOp,
                            y: labelY,
                            marginTop: 'clamp(8px, 1.4vw, 20px)',
                        }}
                    >
                        — Nos projets
                    </motion.span>
                </div>
            </div>
        </section>
    )
}
