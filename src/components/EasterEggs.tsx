import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function EasterEggs() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useEffect(() => {
        if (cursorRef.current) {
            gsap.to(cursorRef.current, { x: cursorPos.x, y: cursorPos.y, duration: 0.1, ease: "power1.out" })
        }
    }, [cursorPos])

    return (
        <>
            {/* CURSOR - DESIGNER ARROW */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-100 mix-blend-normal"
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <svg width="30" height="30" viewBox="0 0 24 24" className="fill-black stroke-white stroke-1">
                        <path d="M3 3l18 9-9 3-3 9z" />
                    </svg>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        body, a, button, canvas { cursor: none !important; }
      `}} />
        </>
    )
}
