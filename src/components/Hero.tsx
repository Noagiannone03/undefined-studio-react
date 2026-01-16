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

// New Button Style: "Double Frame"
const GraphicButton = ({ children, color = "bg-white", textColor = "text-black", className = "", href = "#" }: any) => (
    <a
        href={href}
        className={`group relative inline-block transition-transform active:scale-95 ${className}`}
    >
        {/* Shadow Layer */}
        <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-xl group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
        {/* Main Layer */}
        <div className={`relative ${color} ${textColor} border-4 border-black px-10 py-5 rounded-xl font-display font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`}>
            {children}
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] group-hover:rotate-45 transition-transform">↗</div>
        </div>
    </a>
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
                        x: xPos * 60 * depth,
                        y: yPos * 60 * depth,
                        duration: 1.2,
                        ease: "power2.out"
                    })
                })

                gsap.to('.hero-title-main', {
                    x: xPos * 25,
                    y: yPos * 25,
                    duration: 1.5,
                    ease: "power3.out"
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
                scale: 0.8,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power4.out",
                delay: 0.2
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-screen w-full relative bg-[#B8F4D4] overflow-hidden border-b-4 border-black flex flex-col items-center justify-center font-display">

            {/* 1. BACKGROUND COMPLEXITY (Bauhaus Style) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* DOT GRID */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle, #000 1.5px, transparent 1.5px)`,
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* NOISE OVERLAY */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                {/* GRAPHIC CIRCLES & RINGS */}
                <GraphicCircle color="fill-peach opacity-40" className="top-[-10%] left-[-10%]" size="w-[80vh] h-[80vh]" depth={0.2} />
                <GraphicCircle color="text-black" className="top-[10%] left-[20%]" size="w-[60vh] h-[60vh]" depth={0.1} dotted={true} />

                <GraphicCircle color="fill-lemon opacity-30" className="bottom-[-15%] right-[-10%]" size="w-[90vh] h-[90vh]" depth={0.3} />
                <GraphicCircle color="text-black" className="bottom-[5%] right-[10%]" size="w-[70vh] h-[70vh]" depth={0.15} dotted={true} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-10">
                    <svg viewBox="0 0 100 100" className="w-[80vh] h-[80vh] text-black">
                        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.2" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
                    </svg>
                </div>
            </div>

            {/* 2. MAIN TYPOGRAPHY */}
            <div className="hero-title-main relative z-10 text-center select-none pointer-events-none mb-4">
                <h1 className="text-[20vw] font-black text-black leading-[0.8] tracking-tighter drop-shadow-[15px_15px_0px_white]">
                    UNDE<br />FINED
                </h1>
                {/* STUDIO LABEL */}
                <div className="absolute -bottom-4 right-0 md:-right-12 transform rotate-[-5deg]">
                    <div className="bg-black text-white px-6 py-2 border-4 border-white shadow-hard">
                        <span className="text-4xl md:text-6xl font-black italic tracking-widest">STUDIO</span>
                    </div>
                </div>
            </div>

            {/* 3. STRUCTURED MOODBOARD COLLAGE */}
            <div className="absolute inset-0 z-20 pointer-events-none">

                {/* Tagline Display (Repositioned) */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 reveal-item">
                    <div className="bg-black text-[#B8F4D4] px-8 py-2 border-2 border-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-hard">
                        DESIGN RADICAL. IMPACT RÉEL.
                    </div>
                </div>

                {/* Top Left: Studio Badge */}
                <PaperCard rotate={-8} className="top-24 left-16 reveal-item float-ui" color="bg-lemon" depth={1.2}>
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] font-bold border-b-2 border-black pb-1 mb-1">M123 / STUDIO</span>
                        <h4 className="text-2xl font-black italic">VOLUME 02</h4>
                    </div>
                </PaperCard>

                {/* Top Right: Visual Anchor */}
                <PaperCard rotate={5} className="top-32 right-20 reveal-item float-ui" color="bg-white" depth={0.8}>
                    <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center text-white p-6 overflow-hidden">
                        <div className="relative text-center">
                            <span className="text-4xl font-black block leading-none">DA.</span>
                            <span className="text-[10px] font-mono font-bold mt-2 block opacity-50 uppercase">Visual Identity</span>
                        </div>
                    </div>
                </PaperCard>

                {/* Bottom Left: Detail Card */}
                <PaperCard rotate={-3} className="bottom-40 left-32 reveal-item float-ui hidden md:flex" color="bg-peach" depth={1.1}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-black rounded-full" />
                            <span className="text-sm font-black uppercase">Creative Tech</span>
                        </div>
                        <p className="font-mono text-[10px] leading-tight font-bold max-w-[120px]">
                            EXPLORING NEW FRONTIERS IN INTERACTIVE DESIGN.
                        </p>
                    </div>
                </PaperCard>

                {/* Bottom Right: Stamp */}
                <div className="absolute bottom-40 right-40 reveal-item hidden md:block" data-depth={1.4}>
                    <div className="w-32 h-32 border-4 border-black rounded-full flex items-center justify-center rotate-12 bg-white/40 backdrop-blur-sm">
                        <div className="text-center">
                            <span className="font-display font-black text-xs block mb-1">APPROVED</span>
                            <div className="w-12 h-1 bg-black mx-auto mb-1" />
                            <span className="font-mono text-[9px] font-bold">STUDIO-24</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 4. BOTTOM ACTION UI */}
            <div className="absolute bottom-16 w-full flex flex-col items-center gap-12 z-40">

                <div className="max-w-2xl text-center reveal-item">
                    <p className="font-display font-black text-2xl md:text-3xl leading-none uppercase italic text-black">
                        L'AUDACE CRÉATIVE AU SERVICE DE VOTRE IMPACT.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 pointer-events-auto reveal-item">
                    <GraphicButton color="bg-white" href="#services">
                        NOS OFFRES
                    </GraphicButton>
                    <GraphicButton color="bg-black" textColor="text-white">
                        CONTACT
                    </GraphicButton>
                </div>
            </div>

        </section>
    )
}


