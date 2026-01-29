import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Marquee Component with Outline Support
const MarqueeLine = ({ text, direction = 'left', speed = 20, transparent = false }: { text: string, direction?: 'left' | 'right', speed?: number, transparent?: boolean }) => (
    <div className="w-full overflow-hidden whitespace-nowrap py-1 pointer-events-none select-none">
        <div className="inline-block" style={{
            animation: `marquee-${direction} ${speed}s linear infinite`
        }}>
            {[...Array(8)].map((_, i) => (
                <span key={i} className={`text-[6vh] font-display font-black mx-4 leading-none ${transparent ? 'text-transparent stroke-black' : 'text-black'}`}
                    style={transparent ? { WebkitTextStroke: '1px black' } : {}}>
                    {text} —
                </span>
            ))}
        </div>
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes marquee-right {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
        `}} />
    </div>
)

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const handleMouseMove = (e: MouseEvent) => {
                const { clientX, clientY } = e
                const xPos = (clientX / window.innerWidth - 0.5)
                const yPos = (clientY / window.innerHeight - 0.5)

                gsap.to('.hero-title-layer', {
                    x: xPos * 20,
                    y: yPos * 20,
                    duration: 0.6,
                    ease: "power2.out"
                })

                gsap.to('.hero-studio-badge', {
                    x: xPos * 30,
                    y: yPos * 30,
                    duration: 0.8,
                    ease: "power2.out"
                })
            }
            window.addEventListener('mousemove', handleMouseMove)
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-screen w-full bg-[#F4F4F0] flex flex-col font-display overflow-hidden border-b-4 border-black">

            {/* TOP ZONE - MARQUEES (15%) */}
            <div className="h-[20vh] border-b border-black flex flex-col justify-center bg-[#F4F4F0] relative z-0 overflow-hidden opacity-50">
                <MarqueeLine text="UNDEFINED STUDIO — EMPOWER THE WORLD WITH APPS" direction="left" speed={40} transparent={false} />
                <MarqueeLine text="DESIGN REBELLE" direction="right" speed={35} transparent={true} />
            </div>

            {/* CENTER ZONE - NEGATIVE SPACE (60%) */}
            <div className="flex-1 relative flex flex-col items-center justify-center z-10">

                {/* PARALLAX CONTAINER */}
                <div className="hero-title-layer flex flex-col items-center leading-[0.8] relative">
                    <h1 className="text-[22vw] font-black text-black tracking-tighter">
                        UNDE
                    </h1>
                    <h1 className="text-[22vw] font-black text-black tracking-tighter">
                        FINED
                    </h1>

                    {/* STUDIO STICKER BADGE */}
                    <div className="hero-studio-badge absolute bottom-[2%] right-[2%] transform translate-x-[25%] translate-y-[20%] rotate-[-12deg] z-20 hover:scale-105 transition-all duration-300 cursor-pointer origin-center">
                        <div className="bg-lemon border-4 border-black px-6 py-3 shadow-[6px_6px_0px_black] flex flex-col items-center">
                            <span className="text-4xl md:text-6xl font-black text-black tracking-tighter block leading-none">
                                STUDIO
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM ZONE - MARQUEES (15%) */}
            <div className="h-[20vh] border-t border-black flex flex-col justify-center bg-[#F4F4F0] relative z-0 overflow-hidden opacity-50">
                <MarqueeLine text="NO CORPORATE BS" direction="left" speed={45} transparent={true} />
                <MarqueeLine text="PURE IMPACT" direction="right" speed={40} transparent={false} />
            </div>

            {/* SCROLL INDICATOR */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-100 bg-white px-2 border border-black">Scroll</span>
            </div>

        </section>
    )
}
