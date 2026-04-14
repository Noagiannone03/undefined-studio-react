// Mark.tsx — The studio typographic mark.
// The mark is an underscore `_` — a nod to "Undefined" (unused variable
// in code), the blinking cursor of motion, and the geometry of a baseline.
// Usage: <Mark size={48} color="var(--color-ink)" animate />

type MarkProps = {
    size?: number | string
    color?: string
    className?: string
    animate?: boolean
}

export default function Mark({
    size = 32,
    color = 'var(--color-ink)',
    className = '',
    animate = false,
}: MarkProps) {
    return (
        <span
            className={`${animate ? 'blink' : ''} ${className}`.trim()}
            aria-hidden
            style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: typeof size === 'number' ? `${size}px` : size,
                color,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                display: 'inline-block',
                userSelect: 'none',
            }}
        >
            _
        </span>
    )
}
