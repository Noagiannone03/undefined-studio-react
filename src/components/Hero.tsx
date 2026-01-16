import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// --- COMPONENTS ---

const PaperCard = ({ children, rotate = 0, color = "bg-white", className = "", depth = 1 }: any) => (
    <div
        className={`sticker absolute ${color} border-4 border-black shadow-[8px_8px_0px_black] p-4 md:p-8 flex flex-col rounded-2xl pointer-events-auto select-none z-20 ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
        data-depth={depth}
    >
        {children}
    </div>
)

const Burst = ({ color, className, rotate = 0, size = "w-64 h-64", depth = 0.5 }: any) => (
    <div
        className={`absolute ${size} ${className} pointer-events-none z-0`}
        style={{ transform: `rotate(${rotate}deg)` }}
        data-depth={depth}
    >
        <svg viewBox="0 0 200 200" className={`w-full h-full ${color} drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]`}>
            <path d="M100,0 L115,35 L150,20 L135,55 L170,60 L145,85 L180,100 L145,115 L170,140 L135,145 L150,180 L115,165 L100,200 L85,165 L50,180 L65,145 L30,140 L55,115 L20,100 L55,85 L30,60 L65,55 L50,20 L85,35 Z" />
        </svg>
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

                // Parallax effect on all elements with data-depth
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

                // Title subtle movement
                gsap.to('.hero-title-main', {
                    x: xPos * 25,
                    y: yPos * 25,
                    duration: 1.5,
                    ease: "power3.out"
                })
            }

            window.addEventListener('mousemove', handleMouseMove)

            // Floating animations for cards
            gsap.to('.float-ui', {
                y: "random(-10, 10)",
                rotation: "random(-2, 2)",
                duration: "random(2.5, 4.5)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })

            // Reveal animations
            gsap.from('.reveal-item', {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "back.out(1.7)",
                delay: 0.5
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-screen w-full relative bg-[#B8F4D4] overflow-hidden border-b-4 border-black flex flex-col items-center justify-center font-display">

            {/* 1. BACKGROUND COMPLEXITY */}
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

                {/* GRAPHIC BURSTS */}
                <Burst color="fill-[#FFD1B8]" className="top-[10%] left-[5%] opacity-60" rotate={15} size="w-[60vh] h-[60vh]" depth={0.2} />
                <Burst color="fill-[#F0F4B8]" className="bottom-[5%] right-[-5%] opacity-40" rotate={-20} size="w-[80vh] h-[80vh]" depth={0.3} />
                <Burst color="fill-[#6BD4B2]" className="top-[40%] right-[10%] opacity-30" rotate={45} size="w-[40vh] h-[40vh]" depth={0.1} />
            </div>

            {/* 2. MAIN TYPOGRAPHY */}
            <div className="hero-title-main relative z-10 text-center select-none pointer-events-none mb-12">
                <h1 className="text-[20vw] font-black text-black leading-[0.8] tracking-tighter drop-shadow-[12px_12px_0px_white]">
                    UNDE<br />FINED
                </h1>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none opacity-20">
                    <span className="text-[20vw] font-black text-transparent stroke-black stroke-2" style={{ WebkitTextStroke: '2px black' }}>UNDE<br />FINED</span>
                </div>
            </div>

            {/* 3. STRUCTURED MOODBOARD COLLAGE */}
            <div className="absolute inset-0 z-20 pointer-events-none">

                {/* Top Left: Studio Badge */}
                <PaperCard rotate={-8} className="top-16 left-12 reveal-item float-ui" color="bg-lemon" depth={1.2}>
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] font-bold border-b-2 border-black pb-1 mb-1">STUDIO STATUS: ACTIVE</span>
                        <h4 className="text-xl font-black">2024 / EDITION</h4>
                    </div>
                </PaperCard>

                {/* Top Right: Visual Anchor */}
                <PaperCard rotate={5} className="top-20 right-16 reveal-item float-ui" color="bg-white" depth={0.8}>
                    <div className="w-48 h-24 bg-black flex items-center justify-center text-white p-4">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-1 bg-white mb-2" />
                            <span className="text-2xl font-black italic">IMPACT</span>
                        </div>
                    </div>
                    <p className="font-mono text-[9px] mt-4 font-bold text-center">NO BS. JUST PIXELS.</p>
                </PaperCard>

                {/* Bottom Left: Detail Card */}
                <PaperCard rotate={-3} className="bottom-24 left-20 reveal-item float-ui hidden md:flex" color="bg-peach" depth={1.1}>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-peach text-2xl font-black">★</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase">Service #01</span>
                            <span className="text-xs font-mono font-bold opacity-60">Design Expérientiel</span>
                        </div>
                    </div>
                </PaperCard>

                {/* Bottom Right: Callout */}
                <div className="sticker absolute bottom-32 right-32 reveal-item hidden md:block" data-depth={1.4}>
                    <div className="relative transform rotate-12">
                        <div className="bg-black text-white px-6 py-3 border-2 border-black shadow-[6px_6px_0px_#B8F4D4] font-black italic text-lg whitespace-nowrap">
                            "C'EST DU LOURD"
                        </div>
                        <svg className="absolute -top-12 -right-8 w-16 h-16 fill-lemon animate-bounce" viewBox="0 0 100 100">
                            <path d="M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z" />
                        </svg>
                    </div>
                </div>

            </div>

            {/* 4. BOTTOM ACTION UI */}
            <div className="absolute bottom-12 w-full flex flex-col md:flex-row items-center justify-center gap-12 px-10 z-40 mb-4 md:mb-0">
                <div className="max-w-md reveal-item">
                    <div className="bg-white p-6 border-4 border-black shadow-[10px_10px_0px_black] rotate-[-1deg]">
                        <p className="font-display font-black text-xl md:text-2xl leading-[1.1] uppercase italic">
                            Nous créons des outils qui aident les gens à avancer.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 pointer-events-auto reveal-item">
                    <a href="#services" className="group relative bg-white text-black px-12 py-6 font-display font-black text-2xl uppercase border-4 border-black shadow-[8px_8px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_black] transition-all transform -skew-x-6 hover:skew-x-0">
                        NOS OFFRES
                        <span className="absolute -top-3 -right-3 w-6 h-6 bg-lemon border-2 border-black rounded-full flex items-center justify-center text-[10px]">↗</span>
                    </a>
                    <button className="hidden md:block bg-black text-white px-10 py-6 font-display font-black text-2xl uppercase border-4 border-black shadow-[8px_8px_0px_#FFD1B8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#FFD1B8] transition-all transform skew-x-6 hover:skew-x-0">
                        CONTACT
                    </button>
                </div>
            </div>

        </section>
    )
}

