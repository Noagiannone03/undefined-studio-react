import { useRef } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
    useSpring,
} from 'motion/react'

const SCROLL_VH = 300

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    })

    const s = useSpring(scrollYProgress, { stiffness: 55, damping: 22, restDelta: 0.0001 })

    // ── Background: ink → paper ──────────────────────────────────────────
    const bgR = useTransform(s, [0.58, 0.86], [14, 239])
    const bgG = useTransform(s, [0.58, 0.86], [14, 235])
    const bgB = useTransform(s, [0.58, 0.86], [12, 221])
    const bgColor = useMotionTemplate`rgb(${bgR}, ${bgG}, ${bgB})`

    // ── Text: paper → ink (follows bg) ───────────────────────────────────
    const tR = useTransform(s, [0.58, 0.86], [239, 14])
    const tG = useTransform(s, [0.58, 0.86], [235, 14])
    const tB = useTransform(s, [0.58, 0.86], [221, 12])
    const textColor = useMotionTemplate`rgb(${tR}, ${tG}, ${tB})`

    // ── Neo-brutal shadow: Klein → Tomato → Ink ───────────────────────────
    const shR = useTransform(s, [0.14, 0.44, 0.70, 0.88], [29, 232, 232, 14])
    const shG = useTransform(s, [0.14, 0.44, 0.70, 0.88], [29, 74, 74, 14])
    const shB = useTransform(s, [0.14, 0.44, 0.70, 0.88], [191, 42, 42, 12])
    const shadowColor = useMotionTemplate`rgb(${shR}, ${shG}, ${shB})`

    // ── Frame shadow offset ────────────────────────────────────────────────
    const shX = useTransform(s, [0.14, 0.32], [0, 10])
    const shY = useTransform(s, [0.14, 0.32], [0, 10])
    const frameBoxShadow = useMotionTemplate`${shX}px ${shY}px 0 ${shadowColor}`
    const frameOp = useTransform(s, [0.12, 0.26], [0, 1])

    // ── Accent bars ────────────────────────────────────────────────────────
    const kleinScX  = useTransform(s, [0.04, 0.18], [0, 1])
    const kleinOp   = useTransform(s, [0.04, 0.14, 0.54, 0.66], [0, 1, 1, 0])
    const tomatoScX = useTransform(s, [0.07, 0.22], [0, 1])
    const tomatoOp  = useTransform(s, [0.07, 0.18, 0.54, 0.66], [0, 1, 1, 0])

    // ── Giant U ────────────────────────────────────────────────────────────
    const uClip = useTransform(s, [0.02, 0.16], [100, 0])
    const uClipPath = useMotionTemplate`inset(0 0 ${uClip}% 0)`
    const uOp   = useTransform(s, [0.02, 0.15, 0.58, 0.80], [0, 1, 1, 0])
    const uSc   = useTransform(s, [0.02, 0.20, 0.55, 0.78], [0.90, 1, 1, 1.06])

    // ── Wordmark ────────────────────────────────────────────────────────────
    const undefX  = useTransform(s, [0.18, 0.34], [-60, 0])
    const undefOp = useTransform(s, [0.18, 0.32, 0.58, 0.78], [0, 1, 1, 0])
    const studioY = useTransform(s, [0.26, 0.40], [28, 0])
    const studioOp = useTransform(s, [0.26, 0.38, 0.58, 0.78], [0, 1, 1, 0])

    // ── Rule ───────────────────────────────────────────────────────────────
    const ruleScX = useTransform(s, [0.34, 0.46], [0, 1])
    const ruleOp  = useTransform(s, [0.34, 0.44, 0.58, 0.76], [0, 1, 1, 0])

    // ── Tagline ────────────────────────────────────────────────────────────
    const tagOp = useTransform(s, [0.42, 0.52, 0.58, 0.76], [0, 1, 1, 0])
    const tagY  = useTransform(s, [0.42, 0.52], [18, 0])

    // ── Meta ───────────────────────────────────────────────────────────────
    const metaOp = useTransform(s, [0.48, 0.56, 0.58, 0.76], [0, 1, 1, 0])

    // ── Corner marks ───────────────────────────────────────────────────────
    const cornerOp = useTransform(s, [0.36, 0.48, 0.58, 0.76], [0, 1, 1, 0])

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

                {/* Klein accent — bottom bar */}
                <motion.div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 4, background: 'var(--color-klein)',
                    scaleX: kleinScX, transformOrigin: 'left',
                    opacity: kleinOp, zIndex: 10,
                }} />

                {/* Tomato accent — top bar */}
                <motion.div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 4, background: 'var(--color-tomato)',
                    scaleX: tomatoScX, transformOrigin: 'right',
                    opacity: tomatoOp, zIndex: 10,
                }} />

                {/* ── Main composition ── */}
                <div style={{
                    position: 'relative',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    userSelect: 'none',
                }}>

                    {/* Giant U with neo-brutal frame */}
                    <motion.div style={{
                        position: 'relative',
                        opacity: uOp,
                        scale: uSc,
                    }}>
                        <motion.span
                            className="display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(140px, 30vw, 520px)',
                                color: textColor,
                                letterSpacing: '-0.06em',
                                lineHeight: 0.80,
                                clipPath: uClipPath,
                            }}
                        >
                            U
                        </motion.span>

                        {/* Neo-brutal border + hard offset shadow */}
                        <motion.div style={{
                            position: 'absolute',
                            inset: 'clamp(-8px, -0.8vw, -14px)',
                            border: '2px solid',
                            borderColor: textColor,
                            opacity: frameOp,
                            boxShadow: frameBoxShadow,
                            pointerEvents: 'none',
                        }} />
                    </motion.div>

                    {/* UNDEFINED + studio. */}
                    <div style={{
                        marginTop: 'clamp(22px, 3.2vw, 52px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'clamp(2px, 0.4vw, 6px)',
                    }}>
                        <motion.span
                            className="display"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(18px, 3.4vw, 58px)',
                                color: textColor,
                                letterSpacing: '0.30em',
                                lineHeight: 1.0,
                                x: undefX,
                                opacity: undefOp,
                            }}
                        >
                            UNDEFINED
                        </motion.span>

                        <motion.span
                            className="serif-italic"
                            style={{
                                display: 'block',
                                fontSize: 'clamp(14px, 2.4vw, 40px)',
                                color: textColor,
                                letterSpacing: '0.42em',
                                lineHeight: 1.1,
                                y: studioY,
                                opacity: studioOp,
                            }}
                        >
                            studio.
                        </motion.span>
                    </div>

                    {/* Separator */}
                    <motion.div style={{
                        width: 'clamp(36px, 5vw, 88px)',
                        height: 1,
                        background: textColor,
                        scaleX: ruleScX,
                        transformOrigin: 'center',
                        opacity: ruleOp,
                        marginTop: 'clamp(18px, 2.6vw, 40px)',
                    }} />

                    {/* Tagline */}
                    <motion.p
                        className="serif-italic"
                        style={{
                            fontSize: 'clamp(12px, 1.3vw, 19px)',
                            color: textColor,
                            opacity: tagOp,
                            y: tagY,
                            marginTop: 'clamp(14px, 2vw, 30px)',
                            marginBottom: 0,
                            letterSpacing: '0.01em',
                            lineHeight: 1.55,
                        }}
                    >
                        Design radical.{' '}
                        Technologie pointue.{' '}
                        <motion.span style={{ color: 'var(--color-tomato)' }}>
                            Zéro compromis.
                        </motion.span>
                    </motion.p>

                    {/* Meta */}
                    <motion.span
                        className="mono"
                        style={{
                            fontSize: 9,
                            letterSpacing: '0.28em',
                            color: textColor,
                            opacity: metaOp,
                            marginTop: 'clamp(10px, 1.6vw, 22px)',
                            display: 'block',
                        }}
                    >
                        PARIS — DESIGN · CODE · MOTION — 2024
                    </motion.span>
                </div>

                {/* ── Registration corner marks ── */}
                {([
                    { style: { top: 'clamp(18px,2.8vw,34px)', left: 'var(--side-spacing)' },   d: 'M0 12 L0 0 L12 0' },
                    { style: { top: 'clamp(18px,2.8vw,34px)', right: 'var(--side-spacing)' },  d: 'M16 12 L16 0 L4 0' },
                    { style: { bottom: 'clamp(18px,2.8vw,34px)', left: 'var(--side-spacing)' },  d: 'M0 4 L0 16 L12 16' },
                    { style: { bottom: 'clamp(18px,2.8vw,34px)', right: 'var(--side-spacing)' }, d: 'M16 4 L16 16 L4 16' },
                ] as const).map(({ style, d }, i) => (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute',
                            ...style,
                            opacity: cornerOp,
                            zIndex: 5,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d={d} stroke="rgba(239,235,221,0.22)" strokeWidth="1.2" strokeLinecap="square" />
                        </svg>
                    </motion.div>
                ))}

                {/* Bottom labels */}
                <motion.div style={{
                    position: 'absolute',
                    bottom: 'clamp(20px,3vw,36px)',
                    left: 'var(--side-spacing)',
                    opacity: cornerOp,
                    zIndex: 5,
                }}>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: '0.24em', color: 'rgba(239,235,221,0.20)' }}>
                        EST. 2024
                    </span>
                </motion.div>
                <motion.div style={{
                    position: 'absolute',
                    bottom: 'clamp(20px,3vw,36px)',
                    right: 'var(--side-spacing)',
                    opacity: cornerOp,
                    zIndex: 5,
                }}>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: '0.24em', color: 'rgba(239,235,221,0.20)' }}>
                        UNDEFINED.CO
                    </span>
                </motion.div>
            </motion.div>
        </section>
    )
}
