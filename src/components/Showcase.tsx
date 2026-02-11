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

export default function Showcase() {
    const container = useRef(null)
    useGSAP(() => { }, { scope: container })

    return (
        <section
            id="showcase-realworld"
            ref={container}
            className="w-full relative border-t-4 border-black"
        >
            {/* PROJECT 01: VAGO */}
            <div className="sticky top-0 h-screen w-full bg-[#92d3f5] flex flex-col justify-center items-center overflow-hidden border-b-4 border-black">

                <VagoRealMapBackground />
                <GrainOverlay opacity={0.25} />

                <div className="absolute top-8 left-8 md:top-12 md:left-12 opacity-100 z-20">
                    <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
                        <span className="font-mono text-sm md:text-base font-black tracking-widest text-black">GEN_ID: VAGO_GPS</span>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-4xl">
                    <div className="mb-12 hover:scale-105 transition-transform duration-500 hover:rotate-2">
                        <AppIcon src={vagoLogo} alt="Vago app icon" className="w-40 h-40 md:w-56 md:h-56" />
                    </div>

                    <h3 className="font-display text-3xl md:text-5xl font-black uppercase mb-10 max-w-2xl px-8 py-4 bg-white text-black -rotate-2 border-4 border-black shadow-[8px_8px_0px_black]">
                        L'APP QUI PAIE TON PLEIN.
                    </h3>

                    <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto px-8 mt-4">
                        <StoreButton store="apple" label="App Store" />
                        <StoreButton store="google" label="Google Play" />
                    </div>
                </div>
            </div>

            {/* PROJECT 02: WHISP */}
            <div className="sticky top-0 h-screen w-full bg-[#3279F7] flex flex-col justify-center items-center overflow-hidden">

                <WhispOrganicBackground />
                {/* Grain is handled inside WhispOrganicBackground now at reduced opacity */}

                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20">
                    <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
                        <span className="font-mono text-sm md:text-base font-black tracking-widest text-black">GEN_ID: WHISP_02</span>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-4xl">
                    <div className="mb-12 hover:scale-105 transition-transform duration-500 hover:-rotate-2">
                        <AppIcon src={whispLogo} alt="Whisp app icon" className="w-40 h-40 md:w-56 md:h-56 shadow-[8px_8px_0px_white] border-white" />
                    </div>

                    <h3 className="font-display text-3xl md:text-5xl font-black uppercase mb-10 max-w-3xl px-8 py-4 bg-black text-white rotate-1 border-4 border-white shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                        CONNECTE-TOI À CEUX QUI T'ENTOURENT.
                    </h3>

                    <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto px-8 mt-4">
                        <StoreButton store="apple" label="App Store" />
                        <StoreButton store="google" label="Google Play" />
                    </div>
                </div>
            </div>

        </section>
    )
}
