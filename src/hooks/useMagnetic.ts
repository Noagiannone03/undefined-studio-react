import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.35) {
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect()
            const x = e.clientX - r.left - r.width / 2
            const y = e.clientY - r.top - r.height / 2
            gsap.to(el, { x: x * strength, y: y * strength * 0.8, duration: 0.5, ease: 'power3.out' })
        }
        const onLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
        }
        el.addEventListener('mousemove', onMove)
        el.addEventListener('mouseleave', onLeave)
        return () => {
            el.removeEventListener('mousemove', onMove)
            el.removeEventListener('mouseleave', onLeave)
        }
    }, [ref, strength])
}
