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


                {/* NOISE OVERLAY */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                {/* 1. MINT PILL (Top Left) */}
                <div
                    className="absolute top-[-10%] left-[-5%] w-[30vh] h-[60vh] bg-mint rounded-full rotate-[15deg] opacity-90 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] z-0"
                    data-depth="0.2"
                />

                {/* 2. LEMON SQUARE (Top Right/Center) */}
                <div
                    className="absolute top-[10%] right-[10%] w-[40vh] h-[40vh] bg-lemon rounded-[3rem] rotate-[-10deg] opacity-100 border-4 border-black z-0 shadow-hard"
                    data-depth="0.15"
                />

                {/* 3. BLACK CIRCLE (Bottom Right) */}
                <div
                    className="absolute bottom-[-10%] right-[-5%] w-[50vh] h-[50vh] bg-black rounded-full opacity-100 z-0"
                    data-depth="0.3"
                >
                    {/* Inner Grid Texture for Black Circle */}
                    <div
                        className="absolute inset-0 opacity-20 rounded-full"
                        style={{
                            backgroundImage: `linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)`,
                            backgroundSize: '30px 30px'
                        }}
                    />
                </div>

                {/* 4. BEIGE/WIRE ELEMENT (Bottom Left) */}
                <div className="absolute bottom-[10%] left-[5%] w-[80vh] h-[80vh] flex items-center justify-center opacity-[0.1] z-0 pointer-events-none" data-depth="0.1">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1, 2" />
                        <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 50 50)" />
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
                    <div className="bg-black text-white px-6 py-2 border-4 border-lemon shadow-hard">
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







            </div>
        </section>
    )
}


