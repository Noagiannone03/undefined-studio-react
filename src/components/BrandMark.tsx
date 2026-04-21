import { useRef } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
    useSpring,
} from 'motion/react'

const SCROLL_VH = 320

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    })

    const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.0001 })

    // Background: ink → paper
    const bgR = useTransform(smooth, [0.62, 0.92], [14, 239])
    const bgG = useTransform(smooth, [0.62, 0.92], [14, 235])
    const bgB = useTransform(smooth, [0.62, 0.92], [12, 221])
    const bgColor = useMotionTemplate`rgb(${bgR}, ${bgG}, ${bgB})`
    const grainOpacity = useTransform(smooth, [0.58, 0.92], [0.045, 0.0])

    // ── Crosshair alignment lines (appear first, ground the space) ──
    const lineHScaleX = useTransform(smooth, [0.01, 0.16], [0, 1])
    const lineVScaleY = useTransform(smooth, [0.03, 0.18], [0, 1])
    const crossOpacity = useTransform(smooth, [0.01, 0.10, 0.56, 0.72], [0, 1, 1, 0])

    // ── Background watermark "UNDEFINED" ──
    const wmOpacity = useTransform(smooth, [0.10, 0.24, 0.46, 0.62], [0, 0.036, 0.036, 0])
    const wmY = useTransform(smooth, [0.10, 0.24], [28, 0])

    // ── Chevron left (Klein blue) ──
    const chevLX  = useTransform(smooth, [0.13, 0.28, 0.66, 0.87], [-300, 0, 0, -44])
    const chevLOp = useTransform(smooth, [0.13, 0.24, 0.64, 0.87], [0, 1, 1, 0])
    const chevLSc = useTransform(smooth, [0.13, 0.30], [0.60, 1])

    // ── Chevron right (Tomato) ──
    const chevRX  = useTransform(smooth, [0.17, 0.32, 0.66, 0.87], [300, 0, 0, 44])
    const chevROp = useTransform(smooth, [0.17, 0.28, 0.64, 0.87], [0, 1, 1, 0])
    const chevRSc = useTransform(smooth, [0.17, 0.34], [0.60, 1])

    // ── "UNDEFINED" clip-path reveal (bottom curtain up) ──
    const undefClip = useTransform(smooth, [0.29, 0.41], [100, 0])
    const undefClipPath = useMotionTemplate`inset(0 0 ${undefClip}% 0)`
    const undefOp = useTransform(smooth, [0.29, 0.40, 0.62, 0.80], [0, 1, 1, 0])

    // ── "STUDIO" clip-path reveal (staggered) ──
    const studioClip = useTransform(smooth, [0.35, 0.46], [100, 0])
    const studioClipPath = useMotionTemplate`inset(0 0 ${studioClip}% 0)`
    const studioOp = useTransform(smooth, [0.35, 0.45, 0.62, 0.80], [0, 1, 1, 0])

    // ── Separator line ──
    const lineScX = useTransform(smooth, [0.40, 0.52, 0.62, 0.78], [0, 1, 1, 0])

    // ── Tagline — word by word ──
    const tg1Op = useTransform(smooth, [0.44, 0.52, 0.62, 0.78], [0, 1, 1, 0])
    const tg1Y  = useTransform(smooth, [0.44, 0.52], [20, 0])
    const tg2Op = useTransform(smooth, [0.47, 0.54, 0.62, 0.78], [0, 1, 1, 0])
    const tg2Y  = useTransform(smooth, [0.47, 0.54], [20, 0])
    const tg3Op = useTransform(smooth, [0.50, 0.56, 0.62, 0.78], [0, 1, 1, 0])
    const tg3Y  = useTransform(smooth, [0.50, 0.56], [20, 0])

    // ── Meta info ──
    const metaOp = useTransform(smooth, [0.52, 0.59, 0.62, 0.78], [0, 1, 1, 0])

    // ── Corner labels ──
    const cornerOp = useTransform(smooth, [0.50, 0.58, 0.62, 0.78], [0, 1, 1, 0])

    // ── Chevron stroke colors (Klein → ink when bg lightens) ──
    const chevLStrokeR = useTransform(smooth, [0.64, 0.92], [29, 14])
    const chevLStrokeG = useTransform(smooth, [0.64, 0.92], [29, 14])
    const chevLStrokeB = useTransform(smooth, [0.64, 0.92], [191, 12])
    const chevLStroke  = useMotionTemplate`rgb(${chevLStrokeR}, ${chevLStrokeG}, ${chevLStrokeB})`

    const chevRStrokeR = useTransform(smooth, [0.64, 0.92], [232, 14])
    const chevRStrokeG = useTransform(smooth, [0.64, 0.92], [74, 14])
    const chevRStrokeB = useTransform(smooth, [0.64, 0.92], [42, 12])
    const chevRStroke  = useMotionTemplate`rgb(${chevRStrokeR}, ${chevRStrokeG}, ${chevRStrokeB})`

    const taglines = [
        { text: 'Design radical.', op: tg1Op, y: tg1Y },
        { text: 'Technologie pointue.', op: tg2Op, y: tg2Y },
        { text: 'Zéro compromis.', op: tg3Op, y: tg3Y },
    ]

    return (
        <section
            ref={wrapperRef}
            id="brand-mark"
            style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}
        >
            <motion.div
                className="brand-mark-stage"
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
                <motion.div
                    className="grain"
                    style={{ opacity: grainOpacity, zIndex: 1, pointerEvents: 'none' }}
                />

                {/* ── Crosshair lines — register center of the composition ── */}
                <motion.div
                    style={{
                        position: 'absolute', top: '50%', left: 0, right: 0,
                        height: 1,
                        background: 'rgba(239,235,221,0.09)',
                        scaleX: lineHScaleX,
                        transformOrigin: 'center',
                        opacity: crossOpacity,
                        zIndex: 2,
                    }}
                />
                <motion.div
                    style={{
                        position: 'absolute', left: '50%', top: 0, bottom: 0,
                        width: 1,
                        background: 'rgba(239,235,221,0.09)',
                        scaleY: lineVScaleY,
                        transformOrigin: 'center',
                        opacity: crossOpacity,
                        zIndex: 2,
                    }}
                />

                {/* ── Watermark "UNDEFINED" — background typographic layer ── */}
                <motion.span
                    className="display"
                    style={{
                        position: 'absolute',
                        fontSize: 'clamp(72px, 22vw, 360px)',
                        letterSpacing: '-0.055em',
                        color: 'var(--color-paper)',
                        opacity: wmOpacity,
                        y: wmY,
                        userSelect: 'none',
                        pointerEvents: 'none',
                        zIndex: 2,
                        whiteSpace: 'nowrap',
                    }}
                >
                    UNDEFINED
                </motion.span>

                {/* ── Main centered composition ── */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'clamp(18px, 2.6vw, 40px)',
                        textAlign: 'center',
                        userSelect: 'none',
                    }}
                >
                    {/* Chevrons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.6vw, 42px)' }}>
                        <motion.svg
                            viewBox="0 0 24 28"
                            fill="none"
                            overflow="visible"
                            style={{
                                width: 'clamp(72px, 13vw, 220px)',
                                x: chevLX,
                                opacity: chevLOp,
                                scale: chevLSc,
                                display: 'block',
                                filter: 'drop-shadow(0 0 28px rgba(29,29,191,0.55))',
                            }}
                        >
                            <motion.path
                                d="M2 2L16 14L2 26"
                                strokeWidth="3.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                style={{ stroke: chevLStroke }}
                            />
                        </motion.svg>

                        <motion.svg
                            viewBox="0 0 24 28"
                            fill="none"
                            overflow="visible"
                            style={{
                                width: 'clamp(72px, 13vw, 220px)',
                                x: chevRX,
                                opacity: chevROp,
                                scale: chevRSc,
                                display: 'block',
                                filter: 'drop-shadow(0 0 28px rgba(232,74,42,0.55))',
                            }}
                        >
                            <motion.path
                                d="M2 2L16 14L2 26"
                                strokeWidth="3.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                style={{ stroke: chevRStroke }}
                            />
                        </motion.svg>
                    </div>

                    {/* Studio name — clip-path curtain reveal */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0,
                        }}
                    >
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                className="display"
                                style={{
                                    display: 'block',
                                    fontSize: 'clamp(28px, 5.6vw, 90px)',
                                    color: 'var(--color-paper)',
                                    letterSpacing: '0.22em',
                                    lineHeight: 1.08,
                                    opacity: undefOp,
                                    clipPath: undefClipPath,
                                }}
                            >
                                UNDEFINED
                            </motion.span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                className="display"
                                style={{
                                    display: 'block',
                                    fontSize: 'clamp(28px, 5.6vw, 90px)',
                                    color: 'var(--color-paper)',
                                    letterSpacing: '0.22em',
                                    lineHeight: 1.08,
                                    opacity: studioOp,
                                    clipPath: studioClipPath,
                                }}
                            >
                                STUDIO
                            </motion.span>
                        </div>
                    </div>

                    {/* Separator — draws in from center */}
                    <motion.div
                        style={{
                            width: 'clamp(48px, 8vw, 120px)',
                            height: '1px',
                            background: 'rgba(239,235,221,0.28)',
                            scaleX: lineScX,
                            transformOrigin: 'center',
                        }}
                    />

                    {/* Tagline — word by word, staggered scroll reveal */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '0.45em',
                            maxWidth: '30ch',
                        }}
                    >
                        {taglines.map(({ text, op, y }) => (
                            <span
                                key={text}
                                style={{ overflow: 'hidden', display: 'inline-block' }}
                            >
                                <motion.span
                                    className="serif-italic"
                                    style={{
                                        display: 'inline-block',
                                        opacity: op,
                                        y,
                                        color: 'rgba(239,235,221,0.72)',
                                        fontSize: 'clamp(14px, 1.5vw, 22px)',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {text}
                                </motion.span>
                            </span>
                        ))}
                    </div>

                    {/* Meta */}
                    <motion.span
                        className="mono"
                        style={{
                            opacity: metaOp,
                            color: 'rgba(239,235,221,0.28)',
                            fontSize: 10,
                            letterSpacing: '0.26em',
                        }}
                    >
                        PARIS — DESIGN · CODE · MOTION — 2024
                    </motion.span>
                </div>

                {/* Corner decorators */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: 'clamp(20px, 3vw, 36px)',
                        left: 'var(--side-spacing)',
                        opacity: cornerOp,
                        zIndex: 5,
                    }}
                >
                    <span
                        className="mono"
                        style={{
                            fontSize: 9,
                            letterSpacing: '0.24em',
                            color: 'rgba(239,235,221,0.20)',
                        }}
                    >
                        EST. 2024
                    </span>
                </motion.div>
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: 'clamp(20px, 3vw, 36px)',
                        right: 'var(--side-spacing)',
                        opacity: cornerOp,
                        zIndex: 5,
                    }}
                >
                    <span
                        className="mono"
                        style={{
                            fontSize: 9,
                            letterSpacing: '0.24em',
                            color: 'rgba(239,235,221,0.20)',
                        }}
                    >
                        UNDEFINED.CO
                    </span>
                </motion.div>
            </motion.div>
        </section>
    )
}
