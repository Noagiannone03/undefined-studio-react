import { useEffect, useRef } from 'react'

export default function EasterEggs() {
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
            }
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <>
            {/* CURSOR - DESIGNER ARROW */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-normal"
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <svg width="30" height="30" viewBox="0 0 24 24" className="fill-black stroke-white stroke-1">
                        <path d="M3 3l18 9-9 3-3 9z" />
                    </svg>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        *, *::before, *::after { cursor: none !important; }
      `}} />
        </>
    )
}
