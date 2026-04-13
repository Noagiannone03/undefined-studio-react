import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function Cursor() {
    const x = useMotionValue(-100)
    const y = useMotionValue(-100)
    const sx = useSpring(x, { stiffness: 500, damping: 35, mass: 0.4 })
    const sy = useSpring(y, { stiffness: 500, damping: 35, mass: 0.4 })

    const [hover, setHover] = useState(false)
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
            const interactive =
                t.closest('a,button,[role="button"],input,textarea,select,[data-cursor="hover"]')
            setHover(!!interactive)
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

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block"
            style={{
                x: sx,
                y: sy,
                mixBlendMode: 'difference',
            }}
            animate={{
                width: hover ? 56 : 14,
                height: hover ? 56 : 14,
                opacity: visible ? 1 : 0,
            }}
            transition={{ width: { duration: 0.25 }, height: { duration: 0.25 }, opacity: { duration: 0.15 } }}
        >
            <div
                className="bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ width: '100%', height: '100%' }}
            />
        </motion.div>
    )
}
