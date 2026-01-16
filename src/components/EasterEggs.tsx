import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function EasterEggs() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    const [showTerminal, setShowTerminal] = useState(false)
    const stickerRef = useRef<HTMLDivElement>(null)

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
        if (stickerRef.current) {
            gsap.to(stickerRef.current, {
                x: cursorPos.x,
                y: cursorPos.y,
                duration: 0.1,
                ease: "power2.out"
            })
        }
    }, [cursorPos])

    return (
        <>
            {/* CURSEUR MAGNÉTIQUE (Easter Egg) */}
            <div
                ref={stickerRef}
                className="fixed top-0 left-0 pointer-events-none z-[100] transition-opacity duration-300 pointer-events-none mix-blend-difference"
            >
                <div className="bg-lemon text-black text-[9px] font-black px-2 py-1 border-2 border-black -rotate-12 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap shadow-hard-sm">
                    MODE : CRÉATIF
                </div>
            </div>

            {/* CONSOLE SECRÈTE */}
            {showTerminal && (
                <div className="fixed inset-0 z-[200] bg-black/95 p-10 font-mono text-mint flex flex-col items-start gap-4">
                    <div className="flex justify-between w-full border-b border-mint pb-4">
                        <span className="font-bold">UNDEFINED_TERMINAL_v2.0.debug</span>
                        <button onClick={() => setShowTerminal(false)} className="hover:text-white">[ FERMER ]</button>
                    </div>
                    <p className="animate-pulse">{`> CONNEXION ÉTABLIE...`}</p>
                    <p className="text-white/50">{`> CHARGEMENT DES PROTOCOLES D'IMPACT... OK`}</p>
                    <p className="text-white/50">{`> OPTIMISATION DE L'EXPÉRIENCE... OK`}</p>
                    <p className="text-lemon">{`> STATUS: REBELLE AU STANDARD`}</p>
                    <div className="bg-mint text-black px-2 mt-4 font-bold">ACCÈS AU NIVEAU ALPHA AUTORISÉ</div>
                    <p className="text-white mt-8 leading-relaxed max-w-2xl">
                        Félicitations. Vous avez trouvé la porte dérobée. <br />
                        Chez Undefined, on pense que la curiosité est le moteur de l'innovation. <br />
                        Nous sommes des artisans du code, des architectes de l'émotion.
                        <br /><br />
                        Impact Numérique. Expérience Humaine.
                    </p>
                </div>
            )}

            {/* SUBTILE INTERACTION AU SURVOL DES TITRES h2/h3 (Global style injection) */}
            <style dangerouslySetInnerHTML={{
                __html: `
        h2:hover, h3:hover {
          filter: skewX(-5deg);
          transition: filter 0.3s ease;
        }
      `}} />
        </>
    )
}
