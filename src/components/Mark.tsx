// Mark.tsx — The studio typographic mark.
// `>>` — double chevron. Speed, direction, forward motion.
// References: right-shift operator, fast-forward, stream syntax.
// Usage: <Mark size={48} color="var(--color-ink)" />

type MarkProps = {
    size?: number | string
    color?: string
    color2?: string
    className?: string
    animate?: boolean
}

export default function Mark({
    size = 32,
    color = 'var(--color-ink)',
    color2,
    className = '',
    animate = false,
}: MarkProps) {
    const px = typeof size === 'number' ? size : 32
    const c2 = color2 ?? color
    return (
        <svg
            width={px}
            height={Math.round(px * 0.7)}
            viewBox="0 0 40 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${animate ? 'blink' : ''} ${className}`.trim()}
            aria-hidden
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                userSelect: 'none',
                flexShrink: 0,
            }}
        >
            {/* First chevron */}
            <path
                d="M2 2L16 14L2 26"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Second chevron */}
            <path
                d="M18 2L32 14L18 26"
                stroke={c2}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
