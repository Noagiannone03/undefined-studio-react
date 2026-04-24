// Mark.tsx — The studio typographic mark.
// `>>` — double chevron. Speed, direction, forward motion.

type MarkProps = {
    size?: number | string
    color?: string
    color2?: string
    className?: string
    strokeWidth?: number
    drawable?: boolean
}

export default function Mark({
    size = 32,
    color = 'var(--color-ink)',
    color2,
    className = '',
    strokeWidth = 3,
    drawable = false,
}: MarkProps) {
    const px = typeof size === 'number' ? size : 32
    const c2 = color2 ?? color

    // When drawable is true, the paths are stroke-dashed so GSAP can animate
    // stroke-dashoffset from pathLength → 0 for a draw-in effect.
    const drawStyle: React.CSSProperties | undefined = drawable
        ? { strokeDasharray: 80, strokeDashoffset: 80 }
        : undefined

    return (
        <svg
            width={px}
            height={Math.round(px * 0.7)}
            viewBox="0 0 40 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                userSelect: 'none',
                flexShrink: 0,
                overflow: 'visible',
            }}
        >
            <path
                className="mark-chev mark-chev-1"
                d="M2 2L16 14L2 26"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={drawStyle}
            />
            <path
                className="mark-chev mark-chev-2"
                d="M18 2L32 14L18 26"
                stroke={c2}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={drawStyle}
            />
        </svg>
    )
}
