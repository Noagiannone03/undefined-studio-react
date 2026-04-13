import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function Cursor() {
    const x = useMotionValue(-100)
    const y = useMotionValue(-100)
    const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 })
    const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 })

    const [mode, setMode] = useState<'idle' | 'link' | 'cta' | 'text'>('idle')
    const [label, setLabel] = useState<string>('')
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            x.set(e.clientX)
            y.set(e.clientY)
            if (!visible) setVisible(true)
        }
        const onOver = (e: MouseEvent) => {
            const t = e.target as HTMLElement
            if (!t) return
            const cta = t.closest<HTMLElement>('[data-cursor="cta"]')
            const link = t.closest<HTMLElement>('a,button,[role="button"]')
            const textSel = t.closest<HTMLElement>('p,h1,h2,h3,h4,span.serif-italic')
            if (cta) {
                setMode('cta')
                setLabel(cta.dataset.cursorLabel || '')
            } else if (link) {
                setMode('link')
                setLabel('')
            } else if (textSel) {
                setMode('text')
                setLabel('')
            } else {
                setMode('idle')
                setLabel('')
            }
        }
        const onLeave = () => setVisible(false)

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseover', onOver)
        window.addEventListener('mouseleave', onLeave)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseover', onOver)
            window.removeEventListener('mouseleave', onLeave)
        }
    }, [x, y, visible])

    const size = mode === 'cta' ? 78 : mode === 'link' ? 36 : mode === 'text' ? 4 : 10
    const bg = mode === 'cta' ? '#E84A2A' : mode === 'link' ? '#0E0E0C' : '#0E0E0C'
    const color = mode === 'cta' ? '#EFEBDD' : '#0E0E0C'

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block"
            style={{ x: sx, y: sy }}
            animate={{ width: size, height: size, opacity: visible ? 1 : 0 }}
            transition={{ width: { duration: 0.35, ease: [0.2, 0.9, 0.3, 1] }, height: { duration: 0.35 }, opacity: { duration: 0.15 } }}
        >
            <div
                className="rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest"
                style={{ width: '100%', height: '100%', background: bg, color }}
            >
                {mode === 'cta' && label}
            </div>
        </motion.div>
    )
}
