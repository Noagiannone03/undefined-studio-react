import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function EasterEggs() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    const [showTerminal, setShowTerminal] = useState(false)
    const cursorRef = useRef<HTMLDivElement>(null)
    const repulsorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY })
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 't' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setShowTerminal(prev => !prev)
            }
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    useEffect(() => {
        if (cursorRef.current && repulsorRef.current) {
            gsap.to(cursorRef.current, { x: cursorPos.x, y: cursorPos.y, duration: 0.15, ease: "power2.out" })
            gsap.set(repulsorRef.current, { x: cursorPos.x, y: cursorPos.y })
        }
    }, [cursorPos])

    return (
        <>
            {/* REPULSOR CIRCLE */}
            <div
                ref={repulsorRef}
                className="fixed top-0 left-0 w-24 h-24 border-2 border-dashed border-black rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9998] opacity-30 transition-transform duration-200 animate-spin-slow"
                style={{ transformOrigin: 'center center' }}
            />

            {/* CURSOR LABEL */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 pointer-events-none mix-blend-normal"
            >
                <div className="bg-lemon text-black text-[10px] font-black px-2 py-1 border-2 border-black rotate-3 transform -translate-x-1/2 -translate-y-8 whitespace-nowrap shadow-hard-sm">
                    CHAOS MODE
                </div>
            </div>

            {/* CONSOLE SECRÈTE */}
            {showTerminal && (
                <div className="fixed inset-0 z-[10000] bg-black/98 p-10 font-mono text-mint flex flex-col items-start gap-4">
                    <div className="flex justify-between w-full border-b border-mint pb-4">
                        <span className="font-bold">UNDEFINED_TERMINAL</span>
                        <button onClick={() => setShowTerminal(false)} className="hover:text-white">[ X ]</button>
                    </div>
                    <p className="animate-pulse">{`> BRUTE_FORCE_INIT...`}</p>
                    <p className="text-white/50">{`> RUPTURE DU STANDARD... COMPLETE`}</p>
                    <p className="text-lemon font-bold text-4xl mt-10">REJOIGNEZ L'ÉMEUTE.</p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        body, a, button, canvas { cursor: none !important; }
      `}} />
        </>
    )
}
