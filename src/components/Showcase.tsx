import { useRef, useEffect, useState, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

gsap.registerPlugin(ScrollTrigger)

// --- GENERATIVE BACKGROUNDS ---

// Map Options
const MAP_CENTER: [number, number] = [43.2965, 5.3698] // Marseille
const MAP_ZOOM = 14

// Generate random Bezier path
const generateRandomPath = () => {
    // Random start from any edge
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

    // Control points for smooth curve through the center area
    const cp1 = { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 }
    const cp2 = { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 }

    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`
}

// Custom Component for slow pan
const MapController = () => {
    const map = useMap()

    useEffect(() => {
        const interval = setInterval(() => {
            map.panBy([0.5, 0.25], { animate: false })
        }, 30) // ~33fps pan (faster)

        return () => clearInterval(interval)
    }, [map])

    return null
}

// Animated GPS Track Component
const AnimatedTrack = ({ trackIndex }: { trackIndex: number }) => {
    const [path, setPath] = useState(generateRandomPath)
    const [animKey, setAnimKey] = useState(0)
    const duration = 7 + Math.random() * 3

    useEffect(() => {
        // After animation completes, regenerate a new path
        const timer = setTimeout(() => {
            setPath(generateRandomPath())
            setAnimKey(k => k + 1)
        }, (duration + 0.5) * 1000)

        return () => clearTimeout(timer)
    }, [animKey])

    // Unique animation name forces CSS to restart
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
            {/* CSS Filters to force Lemon/Black aesthetic */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container {
                    background: #E8FF86 !important;
                    filter: grayscale(100%) contrast(130%);
                }
                .leaflet-layer {
                    mix-blend-mode: multiply;
                }
                .leaflet-control-container { display: none; }
                
                @keyframes draw-path-gps {
                    0% { stroke-dashoffset: 3000; opacity: 0; }
                    3% { opacity: 1; }
                    80% { opacity: 1; stroke-dashoffset: 300; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                }
                @keyframes move-marker-gps {
                    0% { offset-distance: 0%; opacity: 0; }
                    3% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; }
                }
            `}} />

            {/* Yellow Tint Overlay */}
            <div className="absolute inset-0 bg-lemon pointer-events-none z-[1] mix-blend-multiply opacity-100" />

            {/* The Map - NO LABELS (only streets/buildings) */}
            <MapContainer
                center={MAP_CENTER}
                zoom={MAP_ZOOM}
                style={{ height: '100%', width: '100%', background: '#E8FF86' }}
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

            {/* Multiple Random GPS Tracks Overlay */}
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
        <div className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `radial-gradient(circle, #000 2px, transparent 2px)`,
                backgroundSize: '40px 40px'
            }}
        />
    </div>
)

// --- ICONS & LOGOS ---
const VagoLogo = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
        <path d="M35 15 L65 15 L50 45 L75 45 L25 85 L40 55 L15 55 Z" />
    </svg>
)

const WhispLogo = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-black stroke-[8]">
        <circle cx="35" cy="50" r="20" />
        <circle cx="65" cy="50" r="20" />
        <path d="M50 35 Q50 65 50 65" strokeLinecap="round" />
    </svg>
)

const AppleIcon = () => (
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.37-1.4 1.63.16 2.87 1.07 3.57 2.28-3.09 1.74-2.58 6.47.66 8.01-.58 1.55-1.55 3.01-2.95 4.36l-.73-.02zm-3.8-17.3c-.63 1.51-2.67 2.91-4.08 2.37.56-2.04 2.29-3.41 4.08-2.37z" /></svg>
)

const GooglePlayIcon = () => (
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3,20.5V3.5C3,2.91,3.34,2.39,3.84,2.15l13.83,13.83L3,20.5z M19.49,15.98l-7.82-7.82L4.6,15.16l12.8,7.39C18.4,23.11,19.49,15.98,19.49,15.98z M21.91,9.85l-1.92,1.92l-4.14-4.14l4.14-4.14l1.92,1.92C22.42,6.01,22.42,8.19,21.91,9.85z M4.96,22.09l7.82-7.82l-7.82-7.82L4.96,22.09z" /></svg>
)

const StoreButton = ({ store, label }: { store: 'apple' | 'google', label: string }) => (
    <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl border-2 border-black hover:bg-transparent hover:text-black transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
        {store === 'apple' ? <AppleIcon /> : <GooglePlayIcon />}
        <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase font-bold opacity-70">Download on</span>
            <span className="text-sm font-bold">{label}</span>
        </div>
    </button>
)

export default function Showcase() {
    const container = useRef(null)

    useGSAP(() => { }, { scope: container })

    return (
        <section
            id="showcase-realworld"
            ref={container}
            className="w-full relative"
        >
            {/* PROJECT 01: VAGO */}
            <div className="sticky top-0 h-screen w-full bg-lemon flex flex-col justify-center items-center overflow-hidden">

                <VagoRealMapBackground />

                <div className="absolute top-8 left-8 md:top-12 md:left-12 opacity-80 z-20">
                    <span className="font-mono text-xs md:text-sm font-black tracking-widest border-2 border-black px-4 py-2 rounded-full bg-lemon">GEN_ID: VAGO_GPS</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-4xl">
                    <div className="w-32 h-32 md:w-48 md:h-48 mb-8 hover:scale-110 transition-transform duration-500">
                        <VagoLogo />
                    </div>

                    <h2 className="font-display text-[12vw] md:text-[8rem] font-black leading-[0.8] mb-4 tracking-tighter drop-shadow-[5px_5px_0px_rgba(255,255,255,0.5)]">
                        VAGO
                    </h2>
                    <h3 className="font-display text-xl md:text-3xl font-bold uppercase mb-8 max-w-2xl px-4 bg-black text-lemon px-4 py-1 -rotate-1">
                        L'APP QUI PAIE TON PLEIN.
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-8 mt-8">
                        <StoreButton store="apple" label="App Store" />
                        <StoreButton store="google" label="Google Play" />
                    </div>
                </div>
            </div>

            {/* PROJECT 02: WHISP */}
            <div className="sticky top-0 h-screen w-full bg-mint flex flex-col justify-center items-center overflow-hidden shadow-[0px_-20px_60px_rgba(0,0,0,0.2)]">

                <WhispOrganicBackground />

                <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-80 z-20">
                    <span className="font-mono text-xs md:text-sm font-black tracking-widest border-2 border-black px-4 py-2 rounded-full bg-mint">GEN_ID: WHISP_02</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-4xl">
                    <div className="w-32 h-32 md:w-48 md:h-48 mb-8 hover:rotate-180 transition-transform duration-[2s]">
                        <WhispLogo />
                    </div>

                    <h2 className="font-display text-[12vw] md:text-[8rem] font-black leading-[0.8] mb-4 tracking-tighter mix-blend-multiply">
                        WHISP
                    </h2>
                    <h3 className="font-display text-xl md:text-3xl font-bold uppercase mb-8 max-w-xl px-4 border-b-4 border-black pb-2">
                        CONNECTE-TOI À CEUX QUI T'ENTOURENT.
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-8 mt-8">
                        <StoreButton store="apple" label="App Store" />
                        <StoreButton store="google" label="Google Play" />
                    </div>
                </div>
            </div>

        </section>
    )
}
