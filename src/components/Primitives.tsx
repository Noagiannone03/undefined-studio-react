import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef, type ReactNode, type MouseEvent, type CSSProperties } from 'react'

export function MagneticButton({
    children,
    className = '',
    strength = 0.3,
    onClick,
    style,
    as = 'button',
    href,
}: {
    children: ReactNode
    className?: string
    strength?: number
    onClick?: () => void
    style?: CSSProperties
    as?: 'button' | 'a'
    href?: string
}) {
    const ref = useRef<HTMLElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 220, damping: 14, mass: 0.25 })
    const sy = useSpring(y, { stiffness: 220, damping: 14, mass: 0.25 })

    const onMove = (e: MouseEvent<HTMLElement>) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const onLeave = () => { x.set(0); y.set(0) }

    const Comp = as === 'a' ? motion.a : motion.button
    return (
        <Comp
            ref={ref as never}
            href={href}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={onClick}
            style={{ x: sx, y: sy, ...style }}
            className={className}
        >
            {children}
        </Comp>
    )
}

export function Reveal({
    children,
    delay = 0,
    y = 32,
    className,
    once = true,
}: {
    children: ReactNode
    delay?: number
    y?: number
    className?: string
    once?: boolean
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount: 0.25 }}
            transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    )
}

export function WordReveal({
    text,
    className,
    wordClassName,
    delay = 0,
    stagger = 0.07,
}: {
    text: string
    className?: string
    wordClassName?: string
    delay?: number
    stagger?: number
}) {
    const words = text.split(' ')
    return (
        <span className={className}>
            {words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                    <motion.span
                        className={'inline-block ' + (wordClassName ?? '')}
                        initial={{ y: '112%' }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {w}
                    </motion.span>
                </span>
            ))}
            <span className="sr-only">{text}</span>
        </span>
    )
}

export function Marquee({
    children,
    speed = 40,
    className = '',
    direction = 'left',
}: {
    children: ReactNode
    speed?: number
    className?: string
    direction?: 'left' | 'right'
}) {
    const dir = direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
    return (
        <div className={'overflow-hidden whitespace-nowrap ' + className}>
            <motion.div
                className="inline-flex gap-10 items-center"
                animate={{ x: dir }}
                transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
            >
                <div className="inline-flex gap-10 items-center">{children}</div>
                <div className="inline-flex gap-10 items-center">{children}</div>
            </motion.div>
        </div>
    )
}

export function ParallaxTilt({
    children,
    className = '',
    max = 6,
}: {
    children: ReactNode
    className?: string
    max?: number
}) {
    const ref = useRef<HTMLDivElement>(null)
    const rx = useMotionValue(0)
    const ry = useMotionValue(0)
    const srx = useSpring(rx, { stiffness: 120, damping: 14 })
    const sry = useSpring(ry, { stiffness: 120, damping: 14 })
    const rotateX = useTransform(srx, v => `${v}deg`)
    const rotateY = useTransform(sry, v => `${v}deg`)

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * max)
        rx.set(-py * max)
    }
    const onLeave = () => { rx.set(0); ry.set(0) }

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1200 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/* Small geometric mark used sparingly (not illustrations, just a logo-mark) */
export function AsteriskMark({ className = '', color = '#111' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <g stroke={color} strokeWidth="2.4" strokeLinecap="round">
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="4.5" y1="7.5" x2="19.5" y2="16.5" />
                <line x1="4.5" y1="16.5" x2="19.5" y2="7.5" />
            </g>
        </svg>
    )
}
