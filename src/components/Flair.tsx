import type { CSSProperties, SVGProps } from 'react'

type Props = Omit<SVGProps<SVGSVGElement>, 'color'> & {
    color?: string
    size?: number
}

const merge = (size?: number, color?: string, style?: CSSProperties): CSSProperties => ({
    width: size ?? 48,
    height: size ?? 48,
    color: color ?? 'currentColor',
    ...style,
})

export function FlairStar({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <path d="M50 0 L58 38 L96 42 L66 62 L78 98 L50 76 L22 98 L34 62 L4 42 L42 38 Z" />
        </svg>
    )
}

export function FlairCross({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <rect x="42" y="0" width="16" height="100" />
            <rect x="0" y="42" width="100" height="16" />
        </svg>
    )
}

export function FlairCircle({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="none" stroke="currentColor" strokeWidth="6" aria-hidden {...rest}>
            <circle cx="50" cy="50" r="44" />
        </svg>
    )
}

export function FlairDisc({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <circle cx="50" cy="50" r="48" />
        </svg>
    )
}

export function FlairBolt({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <path d="M58 2 L14 56 L42 56 L36 98 L84 40 L54 40 L62 2 Z" />
        </svg>
    )
}

export function FlairSquiggle({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 120 40" style={merge(size, color, style)} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" aria-hidden {...rest}>
            <path d="M6 20 Q 22 2, 38 20 T 70 20 T 114 20" />
        </svg>
    )
}

export function FlairWindmill({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <path d="M50 50 C 50 10, 30 10, 30 30 C 30 50, 50 50, 50 50 Z" />
            <path d="M50 50 C 90 50, 90 30, 70 30 C 50 30, 50 50, 50 50 Z" />
            <path d="M50 50 C 50 90, 70 90, 70 70 C 70 50, 50 50, 50 50 Z" />
            <path d="M50 50 C 10 50, 10 70, 30 70 C 50 70, 50 50, 50 50 Z" />
        </svg>
    )
}

export function FlairArrow({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
            <path d="M18 50 L82 50" />
            <path d="M58 26 L82 50 L58 74" />
        </svg>
    )
}

export function FlairDots({ color, size, style, ...rest }: Props) {
    return (
        <svg viewBox="0 0 100 100" style={merge(size, color, style)} fill="currentColor" aria-hidden {...rest}>
            <circle cx="14" cy="14" r="8" />
            <circle cx="50" cy="14" r="8" />
            <circle cx="86" cy="14" r="8" />
            <circle cx="14" cy="50" r="8" />
            <circle cx="50" cy="50" r="8" />
            <circle cx="86" cy="50" r="8" />
            <circle cx="14" cy="86" r="8" />
            <circle cx="50" cy="86" r="8" />
            <circle cx="86" cy="86" r="8" />
        </svg>
    )
}
