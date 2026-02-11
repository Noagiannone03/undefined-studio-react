import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

// --- BOUNCY STICKER COMPONENT ---
const BouncySticker = ({ text, rotation = -5, color = 'bg-lemon' }: { text: string, rotation?: number, color?: string }) => {
    const stickerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const xTo = gsap.quickTo(stickerRef.current, "x", { duration: 0.4, ease: "power3" })
        const yTo = gsap.quickTo(stickerRef.current, "y", { duration: 0.4, ease: "power3" })

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            const x = (clientX - innerWidth / 2) * 0.15
            const y = (clientY - innerHeight / 2) * 0.15
            xTo(x)
            yTo(y)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, { scope: stickerRef })

    return (
        <div ref={stickerRef} className={`absolute z-30 cursor-pointer select-none`} style={{ transform: `rotate(${rotation}deg)` }}>
            <div className={`${color} border-4 border-black px-6 py-3 shadow-[6px_6px_0px_black] hover:scale-110 hover:-rotate-12 transition-transform duration-300`}>
                <span className="text-3xl md:text-5xl font-black font-display text-black tracking-tighter block leading-none">
                    {text}
                </span>
            </div>
        </div>
    )
}

// --- STAMP EFFECT COMPONENT ---
const Stamp = ({ x, y, type }: { x: number, y: number, type: number }) => {
    const stamps = ['UNDEFINED', 'RAW', 'POP!', '★']
    const colors = ['text-lemon', 'text-mint', 'text-peach', 'text-lilac']
    const content = stamps[type % stamps.length]
    const color = colors[type % colors.length]

    return (
        <div
            className={`absolute pointer-events-none font-black font-display text-4xl md:text-6xl ${color} drop-shadow-[2px_2px_0px_black] z-0 select-none`}
            style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${Math.random() * 40 - 20}deg)`,
                opacity: 0.8
            }}
        >
            {content}
        </div>
    )
}

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const [stamps, setStamps] = useState<{ id: number, x: number, y: number }[]>([])

    // Scramble Text Effect on Load
    useGSAP(() => {
        const tl = gsap.timeline()

        // Initial set
        gsap.set('.char-wrapper', { y: 100, opacity: 0 })

        // Animate in
        tl.to('.char-wrapper', {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.8,
            ease: "back.out(1.7)"
        })

        // Blob Animation
        gsap.to('.hero-blob', {
            y: "random(-50, 50)",
            x: "random(-50, 50)",
            rotation: "random(-20, 20)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })

    }, { scope: containerRef })

    // Mouse Interaction for Title (Magnetic/Skew)
    useGSAP(() => {
        const xTo = gsap.quickTo('.hero-title-layer', "x", { duration: 0.5, ease: "power3" })
        const yTo = gsap.quickTo('.hero-title-layer', "y", { duration: 0.5, ease: "power3" })
        const skewTo = gsap.quickTo('.hero-title-layer', "skewX", { duration: 0.5, ease: "power3" })

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            const x = (clientX / innerWidth - 0.5) * 40
            const y = (clientY / innerHeight - 0.5) * 40
            const skew = (clientX / innerWidth - 0.5) * 10

            xTo(x)
            yTo(y)
            skewTo(skew)
        }

        const currentContainer = containerRef.current;
        if (currentContainer) {
            currentContainer.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('mousemove', handleMouseMove);
            }
        }
    }, { scope: containerRef })

    const handleStamp = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setStamps(prev => [...prev, { id: Date.now(), x, y }])
    }

    return (
        <section
            ref={containerRef}
            onClick={handleStamp}
            className="h-screen w-full bg-cream relative flex flex-col items-center justify-center font-display overflow-hidden border-b-4 border-black cursor-crosshair"
        >
            {/* BACKGROUND BLOBS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="hero-blob absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-mint rounded-full mix-blend-multiply filter blur-[80px] opacity-70" />
                <div className="hero-blob absolute bottom-[10%] right-[10%] w-[45vw] h-[45vw] bg-peach rounded-full mix-blend-multiply filter blur-[80px] opacity-70" />
                <div className="hero-blob absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-lilac rounded-full mix-blend-multiply filter blur-[80px] opacity-70" />
            </div>

            {/* GRAIN OVERLAY */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
            />

            {/* STAMPS LAYER */}
            <div className="absolute inset-0 z-10">
                {stamps.map((stamp, i) => (
                    <Stamp key={stamp.id} x={stamp.x} y={stamp.y} type={i} />
                ))}
            </div>

            {/* MAIN TITLE CONTENT */}
            <div className="relative z-20 flex flex-col items-center justify-center w-full mix-blend-hard-light perspective-1000">

                {/* FLOATING DECORATIONS */}
                <div className="absolute top-0 right-10 animate-spin-slow w-16 h-16 md:w-24 md:h-24 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
                        <path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 L39 35 Z" />
                    </svg>
                </div>

                {/* HERO TITLE LAYER */}
                <div className="hero-title-layer flex flex-col items-center leading-[0.75]">

                    <div className="overflow-hidden">
                        <h1
                            ref={titleRef}
                            className="char-wrapper text-[22vw] font-black text-black tracking-tighter drop-shadow-[8px_8px_0px_rgba(255,255,255,0.5)] select-none"
                            style={{ WebkitTextStroke: '3px black', color: 'transparent' }}
                        >
                            UNDE
                        </h1>
                    </div>

                    <div className="overflow-hidden relative">
                        <h1
                            className="char-wrapper text-[22vw] font-black text-black tracking-tighter drop-shadow-[8px_8px_0px_rgba(184,244,212,1)] select-none"
                        >
                            FINED
                        </h1>

                        {/* INTERACTIVE COMPONENT STICKING TO TITLE */}
                        <div className="absolute -bottom-4 right-0 md:right-10 w-full h-full pointer-events-none flex justify-end items-end">
                            <div className="pointer-events-auto">
                                <BouncySticker text="STUDIO" rotation={12} color="bg-lemon" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* TAGLINE */}
                <div className="mt-12 flex items-center gap-4 bg-black text-white px-6 py-2 rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="w-3 h-3 bg-mint rounded-full animate-pulse" />
                    <span className="font-mono text-sm md:text-xl font-bold uppercase tracking-widest">
                        Digital Impact. Human Experience.
                    </span>
                </div>

            </div>

            {/* SCROLL INDICATOR */}
            <div className="absolute bottom-8 left-8 flex flex-col gap-1 z-20 mix-blend-difference text-white">
                <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-70">Scroll to explore</span>
                <div className="w-px h-16 bg-white origin-top animate-bounce-soft" />
            </div>

        </section>
    )
}
