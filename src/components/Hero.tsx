import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// --- COMPONENTS ---

const GraphicCircle = ({ color, className, size = "w-64 h-64", depth = 0.5, dotted = false }: any) => (
    <div
        className={`absolute ${size} ${className} pointer-events-none z-0`}
        data-depth={depth}
    >
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {dotted ? (
                <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2, 4"
                    className={`${color} opacity-60`}
                />
            ) : (
                <circle cx="50" cy="50" r="48" className={`${color} drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]`} />
            )}
        </svg>
    </div>
)

const PaperCard = ({ children, rotate = 0, color = "bg-white", className = "", depth = 1 }: any) => (
    <div
        className={`sticker absolute ${color} border-4 border-black shadow-[8px_8px_0px_black] p-4 md:p-8 flex flex-col rounded-2xl pointer-events-auto select-none z-20 ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
        data-depth={depth}
    >
        {children}
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

                const parallaxElements = document.querySelectorAll('[data-depth]')
                parallaxElements.forEach((el: any) => {
                    const depth = parseFloat(el.dataset.depth || "1")
                    gsap.to(el, {
                        x: xPos * 40 * depth,
                        y: yPos * 40 * depth,
                        duration: 0.3,
                        ease: "power1.out"
                    })
                })

                gsap.to('.hero-title-main', {
                    x: xPos * 15,
                    y: yPos * 15,
                    duration: 0.4,
                    ease: "power1.out"
                })
            }

            window.addEventListener('mousemove', handleMouseMove)

            gsap.to('.float-ui', {
                y: "random(-12, 12)",
                rotation: "random(-3, 3)",
                duration: "random(3, 5)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })

            gsap.from('.reveal-item', {
                scale: 0,
                duration: 1,
                stagger: 0.1,
                ease: "elastic.out(1, 0.5)",
                delay: 0.2
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-screen w-full relative bg-[#FFF8E7] overflow-hidden border-b-4 border-black flex flex-col items-center justify-center font-display">

            {/* TOP MARQUEE */}
            <div className="absolute top-0 left-0 w-full z-50 bg-black text-white border-b-4 border-black py-2 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block font-mono text-sm md:text-base font-bold tracking-widest">
                    <span>UNDEFINED STUDIO © • DESIGN REBELLE • PURE IMPACT • NO CORPORATE BS • WEB • MOBILE • AI • </span>
                    <span>UNDEFINED STUDIO © • DESIGN REBELLE • PURE IMPACT • NO CORPORATE BS • WEB • MOBILE • AI • </span>
                    <span>UNDEFINED STUDIO © • DESIGN REBELLE • PURE IMPACT • NO CORPORATE BS • WEB • MOBILE • AI • </span>
                </div>
            </div>

            {/* 1. BACKGROUND COMPLEXITY (Bauhaus Style) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mt-10">
                {/* DOT GRID */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle, #000 1.5px, transparent 1.5px)`,
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* NOISE OVERLAY */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                <GraphicCircle color="fill-mint opacity-50" className="top-[-10%] left-[-10%]" size="w-[80vh] h-[80vh]" depth={0.2} />
                <GraphicCircle color="text-black" className="top-[10%] left-[20%]" size="w-[60vh] h-[60vh]" depth={0.1} dotted={true} />

                <GraphicCircle color="fill-peach opacity-40" className="bottom-[-15%] right-[-10%]" size="w-[90vh] h-[90vh]" depth={0.3} />
                <GraphicCircle color="text-mint" className="bottom-[5%] right-[10%]" size="w-[70vh] h-[70vh]" depth={0.15} dotted={true} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-[0.08]">
                    <svg viewBox="0 0 100 100" className="w-[85vh] h-[85vh] text-black">
                        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1, 2" />
                    </svg>
                </div>
                <GraphicCircle color="fill-mint opacity-50" className="top-[-10%] left-[-10%]" size="w-[80vh] h-[80vh]" depth={0.2} />
                <GraphicCircle color="text-lemon" className="top-[10%] left-[20%]" size="w-[60vh] h-[60vh]" depth={0.1} dotted={true} />

                <GraphicCircle color="fill-lemon opacity-40" className="bottom-[-15%] right-[-10%]" size="w-[90vh] h-[90vh]" depth={0.3} />
                <GraphicCircle color="text-peach" className="bottom-[5%] right-[10%]" size="w-[70vh] h-[70vh]" depth={0.15} dotted={true} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-[0.08]">
                    <svg viewBox="0 0 100 100" className="w-[85vh] h-[85vh] text-black">
                        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1, 2" />
                    </svg>
                </div>
            </div>

            {/* 2. MAIN TYPOGRAPHY */}
            <div className="hero-title-main relative z-10 text-center select-none pointer-events-none mb-4 mt-20">
                <h1 className="text-[20vw] font-black text-black leading-[0.8] tracking-tighter drop-shadow-[15px_15px_0px_white]">
                    UNDE<br />FINED
                </h1>
                {/* STUDIO LABEL */}
                <div className="absolute -bottom-4 right-0 md:-right-12 transform rotate-[-5deg]">
                    <div className="bg-black text-white px-6 py-2 border-4 border-mint shadow-hard">
                        <span className="text-4xl md:text-6xl font-black italic tracking-widest">STUDIO</span>
                    </div>
                </div>
            </div>

            {/* 3. STRUCTURED MOODBOARD COLLAGE */}
            <div className="absolute inset-0 z-20 pointer-events-none mt-10">

                {/* Top Left: Credo Badge */}
                <PaperCard rotate={-8} className="top-24 left-8 md:left-16 reveal-item" color="bg-lemon" depth={1.2}>
                    <div className="flex flex-col items-start gap-1 max-w-[140px]">
                        <span className="font-mono text-[9px] font-bold bg-black text-white px-1 py-0.5 mb-1">MISSION // 01</span>
                        <h4 className="text-xl md:text-2xl font-black leading-[0.9] uppercase break-words">
                            EMPOWER<br />THE WORLD<br />WITH APPS.
                        </h4>
                    </div>
                </PaperCard>





                {/* Bottom Right: Stamp */}
                <div className="absolute bottom-10 right-10 md:bottom-32 md:right-40 reveal-item hidden lg:block" data-depth={1.4}>
                    <div className="w-32 h-32 border-4 border-black rounded-full flex items-center justify-center rotate-12 bg-peach shadow-hard">
                        <div className="text-center">
                            <span className="font-display font-black text-xs block mb-1">NO CRAP</span>
                            <div className="w-12 h-1 bg-black mx-auto mb-1 opacity-20" />
                            <span className="font-mono text-[9px] font-bold">JUST CODE</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}


