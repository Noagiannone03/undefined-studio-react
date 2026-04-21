import { useRef } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
    useSpring,
} from 'motion/react'

const SCROLL_VH = 280

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    })

    const s = useSpring(scrollYProgress, { stiffness: 52, damping: 24, restDelta: 0.0001 })

    // ── Background: ink → paper ──────────────────────────────────────────
    const bgR = useTransform(s, [0.56, 0.84], [14, 239])
    const bgG = useTransform(s, [0.56, 0.84], [14, 235])
    const bgB = useTransform(s, [0.56, 0.84], [12, 221])
    const bgColor = useMotionTemplate`rgb(${bgR}, ${bgG}, ${bgB})`

    // ── Chevron stroke colors ─────────────────────────────────────────────
    // Left (Klein) → Ink as bg lightens
    const chLR = useTransform(s, [0.56, 0.84], [29, 14])
    const chLG = useTransform(s, [0.56, 0.84], [29, 14])
    const chLB = useTransform(s, [0.56, 0.84], [191, 12])
    const chevLColor = useMotionTemplate`rgb(${chLR}, ${chLG}, ${chLB})`

    // Right (Tomato) → Ink as bg lightens
    const chRR = useTransform(s, [0.56, 0.84], [232, 14])
    const chRG = useTransform(s, [0.56, 0.84], [74, 14])
    const chRB = useTransform(s, [0.56, 0.84], [42, 12])
    const chevRColor = useMotionTemplate`rgb(${chRR}, ${chRG}, ${chRB})`

    // ── Text: paper → ink ─────────────────────────────────────────────────
    const tR = useTransform(s, [0.56, 0.84], [239, 14])
    const tG = useTransform(s, [0.56, 0.84], [235, 14])
    const tB = useTransform(s, [0.56, 0.84], [221, 12])
    const textColor = useMotionTemplate`rgb(${tR}, ${tG}, ${tB})`

    // ── Left chevron: slides in from left ────────────────────────────────
    const chevLX   = useTransform(s, [0.04, 0.22], [-220, 0])
    const chevLOp  = useTransform(s, [0.04, 0.20, 0.72, 0.88], [0, 1, 1, 0])
    const chevLSc  = useTransform(s, [0.04, 0.24], [0.72, 1])
    const chevLGlow = useTransform(s, [0.04, 0.28, 0.52, 0.72], [0, 0.7, 0.7, 0])

    // ── Right chevron: slides in from right ───────────────────────────────
    const chevRX   = useTransform(s, [0.08, 0.26], [220, 0])
    const chevROp  = useTransform(s, [0.08, 0.24, 0.72, 0.88], [0, 1, 1, 0])
    const chevRSc  = useTransform(s, [0.08, 0.28], [0.72, 1])
    const chevRGlow = useTransform(s, [0.08, 0.32, 0.52, 0.72], [0, 0.7, 0.7, 0])

    // ── UNDEFINED wordmark ────────────────────────────────────────────────
    const wordClip  = useTransform(s, [0.26, 0.40], [100, 0])
    const wordClipPath = useMotionTemplate`inset(0 0 ${wordClip}% 0)`
    const wordOp    = useTransform(s, [0.26, 0.38, 0.72, 0.86], [0, 1, 1, 0])

    // ── Separator ─────────────────────────────────────────────────────────
    const lineScX   = useTransform(s, [0.34, 0.46], [0, 1])
    const lineOp    = useTransform(s, [0.34, 0.44, 0.72, 0.86], [0, 1, 1, 0])

    // ── Transition statement ──────────────────────────────────────────────
    const stmtOp    = useTransform(s, [0.40, 0.52, 0.72, 0.86], [0, 1, 1, 0])
    const stmtY     = useTransform(s, [0.40, 0.52], [16, 0])

    return (
        <section
            ref={wrapperRef}
            id="brand-mark"
            style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}
        >
            <motion.div
                style={{
                    position: 'sticky',
                    top: 0,
                    minHeight: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bgColor,
                }}
            >
                {/* Grain */}
                <div className="grain" style={{ opacity: 0.04, zIndex: 1, pointerEvents: 'none' }} />

                {/* ── Composition ── */}
                <div style={{
                    position: 'relative',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    userSelect: 'none',
                }}>

                    {/* >> Chevrons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(6px, 1.6vw, 28px)',
                    }}>
                        {/* Left chevron — Klein blue */}
                        <motion.svg
                            viewBox="0 0 28 40"
                            fill="none"
                            overflow="visible"
                            style={{
                                width: 'clamp(52px, 10vw, 160px)',
                                x: chevLX,
                                opacity: chevLOp,
                                scale: chevLSc,
                                display: 'block',
                                filter: useMotionTemplate`drop-shadow(0 0 32px rgba(29,29,191,${chevLGlow}))`,
                            }}
                        >
                            <motion.path
                                d="M4 4L22 20L4 36"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                style={{ stroke: chevLColor }}
                            />
                        </motion.svg>

                        {/* Right chevron — Tomato */}
                        <motion.svg
                            viewBox="0 0 28 40"
                            fill="none"
                            overflow="visible"
                            style={{
                                width: 'clamp(52px, 10vw, 160px)',
                                x: chevRX,
                                opacity: chevROp,
                                scale: chevRSc,
                                display: 'block',
                                filter: useMotionTemplate`drop-shadow(0 0 32px rgba(232,74,42,${chevRGlow}))`,
                            }}
                        >
                            <motion.path
                                d="M4 4L22 20L4 36"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                style={{ stroke: chevRColor }}
                            />
                        </motion.svg>
                    </div>

                    {/* UNDEFINED wordmark */}
                    <motion.div style={{
                        marginTop: 'clamp(20px, 3.2vw, 52px)',
                        overflow: 'hidden',
                    }}>
                        <motion.span
                            className="display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(22px, 4vw, 68px)',
                                color: textColor,
                                letterSpacing: '0.26em',
                                lineHeight: 1.0,
                                clipPath: wordClipPath,
                                opacity: wordOp,
                            }}
                        >
                            UNDEFINED
                        </motion.span>
                    </motion.div>

                    {/* Separator */}
                    <motion.div style={{
                        width: 'clamp(32px, 5vw, 80px)',
                        height: 1,
                        background: textColor,
                        scaleX: lineScX,
                        transformOrigin: 'center',
                        opacity: lineOp,
                        marginTop: 'clamp(16px, 2.4vw, 36px)',
                    }} />

                    {/* Transition statement */}
                    <motion.p
                        className="serif-italic"
                        style={{
                            fontSize: 'clamp(14px, 1.6vw, 22px)',
                            color: textColor,
                            opacity: stmtOp,
                            y: stmtY,
                            margin: 0,
                            marginTop: 'clamp(14px, 2vw, 28px)',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.5,
                        }}
                    >
                        Ce qu'on a construit, c'est juste après.
                    </motion.p>
                </div>
            </motion.div>
        </section>
    )
}
