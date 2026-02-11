import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import vagoLogo from '../assets/logo/VAGO-logo.png'
import whispLogo from '../assets/logo/WHISP-logo.png'
import appleStoreIcon from '../assets/icones/applestore.jpg'
import playStoreIcon from '../assets/icones/playstore.png'
import GrainOverlay from './GrainOverlay'

gsap.registerPlugin(ScrollTrigger)

// --- GENERATIVE BACKGROUNDS ---

// Map Options
const MAP_CENTER: [number, number] = [43.2965, 5.3698] // Marseille
const MAP_ZOOM = 14

// Generate random Bezier path
const generateRandomPath = () => {
    const edges = ['top', 'bottom', 'left', 'right']
    const startEdge = edges[Math.floor(Math.random() * 4)]
    const endEdge = edges.filter(e => e !== startEdge)[Math.floor(Math.random() * 3)]

    const getEdgePoint = (edge: string) => {
        switch (edge) {
            case 'top': return { x: Math.random() * 800, y: -50 }
            case 'bottom': return { x: Math.random() * 800, y: 650 }
            case 'left': return { x: -50, y: Math.random() * 600 }
            case 'right': return { x: 850, y: Math.random() * 600 }
            default: return { x: 400, y: 300 }
        }
    }

    const start = getEdgePoint(startEdge)
    const end = getEdgePoint(endEdge)
    const cp1 = { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 }
    const cp2 = { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 }

    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`
}

const MapController = () => {
    const map = useMap()
    useEffect(() => {
        const interval = setInterval(() => {
            map.panBy([0.5, 0.25], { animate: false })
        }, 30)
        return () => clearInterval(interval)
    }, [map])
    return null
}

const AnimatedTrack = ({ trackIndex }: { trackIndex: number }) => {
    const [path, setPath] = useState(generateRandomPath)
    const [animKey, setAnimKey] = useState(0)
    const duration = 7 + Math.random() * 3

    useEffect(() => {
        const timer = setTimeout(() => {
            setPath(generateRandomPath())
            setAnimKey(k => k + 1)
        }, (duration + 0.5) * 1000)
        return () => clearTimeout(timer)
    }, [animKey])

    const animName = `draw-${trackIndex}-${animKey}`
    const markerAnimName = `move-${trackIndex}-${animKey}`

    return (
        <g style={{ opacity: 1 }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ${animName} {
                    0% { stroke-dashoffset: 3000; opacity: 0; }
                    3% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                }
                @keyframes ${markerAnimName} {
                    0% { offset-distance: 0%; opacity: 0; }
                    3% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; }
                }
            `}} />
            <path
                d={path}
                fill="none"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                    strokeDasharray: 3000,
                    strokeDashoffset: 3000,
                    animation: `${animName} ${duration}s linear forwards`
                }}
            />
            <circle r="6" fill="black" style={{
                offsetPath: `path("${path}")`,
                animation: `${markerAnimName} ${duration}s linear forwards`
            }} />
        </g>
    )
}

const VagoRealMapBackground = () => {
    return (
        <div className="absolute inset-0 z-0">
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container {
                    background: #92d3f5 !important;
                    filter: grayscale(80%) contrast(150%);
                }
                .leaflet-layer {
                    mix-blend-mode: multiply;
                }
                .leaflet-control-container { display: none; }
            `}} />
            <div className="absolute inset-0 bg-[#92d3f5] pointer-events-none z-[1] mix-blend-multiply opacity-55" />
            <MapContainer
                center={MAP_CENTER}
                zoom={MAP_ZOOM}
                style={{ height: '100%', width: '100%', background: '#92d3f5' }}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                />
                <MapController />
            </MapContainer>

            <div className="absolute inset-0 pointer-events-none z-[2]">
                <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <AnimatedTrack trackIndex={0} />
                    <AnimatedTrack trackIndex={1} />
                    <AnimatedTrack trackIndex={2} />
                </svg>
            </div>
        </div>
    )
}

const WhispOrganicBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                className="absolute bg-white mix-blend-overlay opacity-40 rounded-full animate-blob-morph"
                style={{
                    width: `${Math.random() * 30 + 20}vw`,
                    height: `${Math.random() * 30 + 20}vw`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * -2}s`,
                    animationDuration: `${Math.random() * 10 + 10}s`
                }}
            />
        ))}
        {/* REDUCED GRAIN FOR WHISP AS REQUESTED (0.15) */}
        <GrainOverlay opacity={0.15} />
    </div>
)

// --- ICONS & LOGOS ---
const AppIcon = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
    <div
        className={`rounded-[28px] border-4 border-black shadow-[8px_8px_0px_black] overflow-hidden bg-white ${className}`}
    >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
)

const AppleIcon = () => (
    <img src={appleStoreIcon} alt="App Store" className="w-full h-full object-contain" />
)

const GooglePlayIcon = () => (
    <img src={playStoreIcon} alt="Google Play" className="w-full h-full object-contain scale-90" />
)

const StoreButton = ({ store, label }: { store: 'apple' | 'google', label: string }) => (
    <button className="group flex items-center gap-3 bg-white text-black px-5 py-2.5 rounded-full border-4 border-black shadow-[6px_6px_0px_black] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none">
        <div className="flex items-center justify-center w-10 h-10 grayscale group-hover:grayscale-0 transition-all">
            {store === 'apple' ? <AppleIcon /> : <GooglePlayIcon />}
        </div>
        <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Télécharger sur</span>
            <span className="text-lg font-black font-display tracking-tight">{label}</span>
        </div>
    </button>
)
const PhoneMockup = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative w-[280px] h-[580px] md:w-[320px] md:h-[640px] bg-white border-4 border-black rounded-[40px] shadow-[12px_12px_0px_black] overflow-hidden flex flex-col ${className}`}>
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-2xl z-20"></div>
        {/* Screen Content */}
        <div className="w-full h-full relative z-10 overflow-hidden bg-gray-100">
            {children}
        </div>
        {/* Reflection Shine */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none z-30 opacity-50"></div>
    </div>
)




export default function Showcase() {
    const container = useRef<HTMLDivElement>(null)


    // Project Refs for Animation
    const vagoPhone = useRef<HTMLDivElement>(null)
    const vagoText = useRef<HTMLDivElement>(null)
    const whispPhone = useRef<HTMLDivElement>(null)
    const whispText = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        // 1. Parallax for WORK Title REMOVED to match Services.tsx
        // Static positioning is used instead.

        // 2. Header Entrance
        const headerEls = headerRef.current?.children
        if (headerEls) {
            gsap.fromTo(headerEls,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 80%"
                    }
                }
            )
        }

        // 3. VAGO Animation
        gsap.fromTo(vagoPhone.current,
            { y: 100, opacity: 0, rotate: -10 },
            {
                y: 0, opacity: 1, rotate: -2,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: vagoPhone.current,
                    start: "top 85%"
                }
            }
        )
        gsap.fromTo(vagoText.current,
            { x: 50, opacity: 0 },
            {
                x: 0, opacity: 1,
                duration: 1,
                delay: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: vagoText.current,
                    start: "top 85%"
                }
            }
        )

        // 4. WHISP Animation
        gsap.fromTo(whispPhone.current,
            { y: 100, opacity: 0, rotate: 10 },
            {
                y: 0, opacity: 1, rotate: 2,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: whispPhone.current,
                    start: "top 85%"
                }
            }
        )
        gsap.fromTo(whispText.current,
            { x: -50, opacity: 0 },
            {
                x: 0, opacity: 1,
                duration: 1,
                delay: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: whispText.current,
                    start: "top 85%"
                }
            }
        )

    }, { scope: container })

    return (
        <section
            id="showcase-realworld"
            ref={container}
            className="w-full relative border-t-4 border-black bg-[#F0EFEB] overflow-hidden"
        >
            <GrainOverlay opacity={0.5} />

            {/* Giant Background Title - Static like Services.tsx */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5 select-none">
                <h2 className="font-display text-[25vw] font-black uppercase text-black leading-none whitespace-nowrap text-center -translate-y-1/4">
                    WORK
                </h2>
            </div>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 flex flex-col gap-32">

                {/* --- HEADER --- */}
                <div ref={headerRef} className="flex flex-col items-center justify-center text-center">
                    <div className="bg-black text-white px-6 py-2 rotate-1 inline-block shadow-[6px_6px_0px_white] mb-8 border-2 border-transparent">
                        <span className="font-mono font-bold uppercase tracking-widest">Track Record</span>
                    </div>
                    <h2 className="font-display text-[12vw] md:text-[8vw] font-black uppercase text-black leading-none text-center drop-shadow-[6px_6px_0px_white]">
                        SÉLECTION
                    </h2>
                    <p className="font-sans text-xl md:text-2xl font-bold text-center max-w-2xl mt-8 px-6 leading-tight">
                        Des produits utilisés par de vrais gens.<br />
                        Pas de prototypes qui dorment dans un placard.
                    </p>
                </div>


                {/* --- PROJECT 01: VAGO --- */}
                <div className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-24 group">

                    {/* Phone Visual */}
                    <div ref={vagoPhone} className="w-full md:w-1/2 flex justify-center md:justify-end">
                        <div className="transform transition-transform duration-500 group-hover:scale-105">
                            <PhoneMockup className="bg-[#92d3f5]">
                                <VagoRealMapBackground />
                                {/* removed Logo from inside phone */}
                            </PhoneMockup>
                        </div>
                    </div>

                    {/* Info */}
                    <div ref={vagoText} className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo here instead */}
                        <div className="mb-8">
                            <AppIcon src={vagoLogo} alt="Vago app icon" className="w-24 h-24 md:w-32 md:h-32" />
                        </div>

                        <div className="bg-white border-4 border-black px-4 py-1 shadow-[4px_4px_0px_black] mb-6 -rotate-2">
                            <span className="font-mono text-sm font-black tracking-widest uppercase">VAGO_GPS</span>
                        </div>
                        <h3 className="font-display text-5xl md:text-7xl font-black uppercase leading-none mb-8 drop-shadow-[4px_4px_0px_white]">
                            L'APP QUI<br />PAIE TON<br />PLEIN.
                        </h3>
                        <p className="font-sans text-xl font-medium leading-relaxed mb-8 max-w-md">
                            Un GPS communautaire qui récompense tes trajets. Gagne des points, convertis-les en carburant.
                        </p>
                        <div className="flex flex-row gap-4">
                            <StoreButton store="apple" label="App Store" />
                            <StoreButton store="google" label="Google Play" />
                        </div>
                    </div>
                </div>

                {/* --- PROJECT 02: WHISP --- */}
                <div className="w-full flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24 group">

                    {/* Phone Visual */}
                    <div ref={whispPhone} className="w-full md:w-1/2 flex justify-center md:justify-start">
                        <div className="transform transition-transform duration-500 group-hover:scale-105">
                            <PhoneMockup className="bg-[#3279F7]">
                                <WhispOrganicBackground />
                                {/* removed Logo from inside phone */}
                            </PhoneMockup>
                        </div>
                    </div>

                    {/* Info */}
                    <div ref={whispText} className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo here instead */}
                        <div className="mb-8">
                            <AppIcon src={whispLogo} alt="Whisp app icon" className="w-24 h-24 md:w-32 md:h-32 shadow-[8px_8px_0px_white] border-white" />
                        </div>

                        <div className="bg-black text-white border-4 border-white px-4 py-1 shadow-[4px_4px_0px_black] mb-6 rotate-1">
                            <span className="font-mono text-sm font-black tracking-widest uppercase">WHISP_02</span>
                        </div>
                        <h3 className="font-display text-5xl md:text-7xl font-black uppercase leading-none mb-8 text-black drop-shadow-[4px_4px_0px_white]">
                            SOCIAL<br />RÉEL.
                        </h3>
                        <p className="font-sans text-xl font-medium leading-relaxed mb-8 max-w-md">
                            Connecte-toi aux gens qui sont vraiment autour de toi. Sans algorithme. Sans filtre.
                        </p>
                        <div className="flex flex-row gap-4">
                            <StoreButton store="apple" label="App Store" />
                            <StoreButton store="google" label="Google Play" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
