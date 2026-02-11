import { useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { TextPlugin } from 'gsap/TextPlugin'
import GrainOverlay from './GrainOverlay'
import BlobBackground from './BlobBackground'

gsap.registerPlugin(TextPlugin)

// --- STATIC STICKER COMPONENT ---
const BouncySticker = ({ text, rotation = -5, color = 'bg-lemon' }: { text: string, rotation?: number, color?: string }) => {
    return (
        <div className={`relative z-50 cursor-pointer select-none`} style={{ transform: `rotate(${rotation}deg)` }}>
            <div className={`${color} border-4 border-black px-5 py-2 md:px-8 md:py-3 shadow-[6px_6px_0px_black] hover:scale-110 hover:-rotate-12 transition-transform duration-300 group`}>
                <span className="text-3xl md:text-7xl font-black font-display text-black tracking-tighter block leading-none group-hover:text-black transition-colors">
                    {text}
                </span>
            </div>
        </div>
    )
}

// --- DATA TRAIL GLYPHS (NEO-BRUTALIST) ---
const CrosshairShape = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[3px]">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
)
const SquareShape = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[3px]">
        <rect x="4" y="4" width="16" height="16" />
    </svg>
)
const CircleShape = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[3px]">
        <circle cx="12" cy="12" r="9" />
    </svg>
)
const ArrowShape = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
        <path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z" />
    </svg>
)
const XShape = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[4px]">
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
)

type Stamp = {
    id: number
    x: number
    y: number
    variant: number
    rotation: number
    createdAt: number
}

const STAMP_INTERVAL_MS = 60 // Faster, denser trail
const STAMP_LIFETIME_MS = 800
const STAMP_MAX = 20

// --- DATA TRAIL COMPONENT ---
const DataTrailStamp = ({ x, y, type, rotation }: { x: number, y: number, type: number, rotation: number }) => {
    const shapes = [CrosshairShape, SquareShape, CircleShape, ArrowShape, XShape]
    const colors = ['text-black', 'text-lemon', 'text-mint', 'text-black', 'text-white'] // High contrast
    const Shape = shapes[type % shapes.length]
    const color = colors[type % colors.length]

    return (
        <div
            className={`absolute pointer-events-none w-8 h-8 md:w-12 md:h-12 ${color} z-0 select-none -translate-x-1/2 -translate-y-1/2`}
            style={{
                left: x,
                top: y,
                '--stamp-rot': `${rotation}deg`,
            } as CSSProperties}
        >
            <div className="w-full h-full animate-stamp-pop">
                <Shape />
            </div>
        </div>
    )
}

// --- TOP MARQUEE REMOVED ---

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const [stamps, setStamps] = useState<Stamp[]>([])
    const lastStampTime = useRef(0)
    const stampIdRef = useRef(0)

    useGSAP(() => {
        const tl = gsap.timeline()
        gsap.set('.hero-title-layer > div', { y: 100, opacity: 0, rotation: 10 })
        tl.to('.hero-title-layer > div', {
            y: 0,
            opacity: 1,
            rotation: 0, // Reset rotation to initial CSS value (handled by CSS) - actually GSAP overwrites so we should animate TO the desired state. 
            // The CSS has transforms (-rotate-2 and rotate-2). 
            // If I animate "rotation", GSAP might conflict with the hover hover:rotate-0 logic.
            // Better to animate y and opacity only, or use clearProps.
            // Let's just animate y and opacity for a clean "slide up".
            stagger: 0.1,
            duration: 1.2,
            ease: "power3.out",
            clearProps: "all" // Important so CSS hover effects work after animation
        })
    }, { scope: containerRef })

    useGSAP(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const now = Date.now()
            if (now - lastStampTime.current > STAMP_INTERVAL_MS) {
                const containerRect = containerRef.current?.getBoundingClientRect()
                if (containerRect) {
                    const relX = clientX - containerRect.left + (Math.random() - 0.5) * 4 // Reduced random spread for cleaner trail
                    const relY = clientY - containerRect.top + (Math.random() - 0.5) * 4
                    setStamps(prev => {
                        const nextId = stampIdRef.current + 1
                        stampIdRef.current = nextId
                        const pruned = prev.filter(stamp => now - stamp.createdAt < STAMP_LIFETIME_MS)
                        const newStamps = [
                            ...pruned,
                            {
                                id: nextId,
                                x: relX,
                                y: relY,
                                variant: nextId,
                                rotation: Math.random() * 360,
                                createdAt: now
                            }
                        ]
                        if (newStamps.length > STAMP_MAX) return newStamps.slice(newStamps.length - STAMP_MAX)
                        return newStamps
                    })
                    lastStampTime.current = now
                }
            }
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


    return (
        <section
            ref={containerRef}
            className="h-screen w-full bg-cream relative flex flex-col items-center justify-center font-display border-b-4 border-black cursor-crosshair overflow-hidden"
        >
            {/* TOP MARQUEE REMOVED */}

            {/* STATIC HEAVY GRAIN */}
            <GrainOverlay opacity={0.35} />

            <BlobBackground />

            {/* DECORATIVE CORNERS */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-black pointer-events-none z-40" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-black pointer-events-none z-40" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-black pointer-events-none z-40" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-black pointer-events-none z-40" />

            {/* GRID */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:100px_100px]" />

            {/* DATA TRAIL */}
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                {stamps.map((stamp) => (
                    <DataTrailStamp key={stamp.id} x={stamp.x} y={stamp.y} type={stamp.variant} rotation={stamp.rotation} />
                ))}
            </div>

            {/* STACKED BACKGROUND TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 overflow-hidden opacity-5 select-none scale-150">
                <span className="text-[15vw] font-black uppercase text-black leading-[0.8]">EMPOWER</span>
                <span className="text-[15vw] font-black uppercase text-black leading-[0.8] ml-20">THE WORLD</span>
                <span className="text-[15vw] font-black uppercase text-black leading-[0.8] -ml-20">WITH APPS</span>
            </div>

            {/* MAIN CONTENT - BLOCK TYPOGRAPHY */}
            <div className="relative z-20 flex flex-col items-center justify-center w-full perspective-1000">

                <div className="hero-title-layer flex flex-col items-center leading-[0.75] relative w-full gap-4">

                    {/* UNDE - SOLID BLOCK */}
                    <div className="relative transform -rotate-2">
                        <h1
                            ref={titleRef}
                            className="bg-black text-white px-8 py-2 text-[20vw] font-black tracking-tighter shadow-[12px_12px_0px_#B8F4D4] border-4 border-transparent select-none"
                        >
                            UNDE
                        </h1>
                    </div>

                    {/* FINED - SOLID BLOCK INVERTED */}
                    <div className="relative w-full text-center transform rotate-2 md:scale-100">
                        <h1
                            className="bg-white text-black px-8 py-2 text-[20vw] font-black tracking-tighter shadow-[12px_12px_0px_black] border-4 border-black select-none relative inline-block"
                        >
                            FINED

                            {/* STATIC STUDIO STICKER */}
                            <div className="absolute -bottom-[5%] -right-[5%] md:-right-[8%] z-50 pointer-events-auto">
                                <BouncySticker text="STUDIO" rotation={-8} color="bg-lemon" />
                            </div>
                        </h1>
                    </div>
                </div>

            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 mix-blend-difference text-white">
                <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-70">Scroll</span>
                <div className="w-px h-12 bg-white origin-top animate-bounce-soft" />
            </div>

        </section>
    )
}
