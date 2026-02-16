import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IPhoneMockup } from 'react-device-mockup'
import type { IPhoneMockupProps } from 'react-device-mockup'
import vagoLogo from '../assets/logo/VAGO-logo.png'
import whispLogo from '../assets/logo/WHISP-logo.png'
import appleStoreIcon from '../assets/icones/applestore.jpg'
import playStoreIcon from '../assets/icones/playstore.png'
import vagoInterfaceOpen from '../assets/images/vago-illustrations/interface-open.jpeg'
import vagoNoTripInterface from '../assets/images/vago-illustrations/no-trip-interface.png'
import vagoRoad from '../assets/images/vago-illustrations/road.jpg'
import vagoStreak from '../assets/images/vago-illustrations/streak.jpeg'
import whispDetailProfile from '../assets/images/whisp/detail-profile.png'
import whispDiscussion from '../assets/images/whisp/discussion.png'
import whispHomescreen from '../assets/images/whisp/homescreen.png'
import whispMap from '../assets/images/whisp/map.jpeg'
import GrainOverlay from './GrainOverlay'

gsap.registerPlugin(ScrollTrigger)

// --- GENERATIVE BACKGROUNDS ---
const VAGO_SLIDES = [
    vagoInterfaceOpen,
    vagoNoTripInterface,
    vagoRoad,
    vagoStreak
]

const WHISP_SLIDES = [
    whispHomescreen,
    whispDiscussion,
    whispDetailProfile,
    whispMap
]

const VagoPhoneSlideshow = () => {
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % VAGO_SLIDES.length)
        }, 2600)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full h-full bg-black">
            {VAGO_SLIDES.map((slide, index) => {
                const isActive = index === activeSlide
                return (
                    <img
                        key={slide}
                        src={slide}
                        alt={`Vago screen ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        style={{
                            transform: isActive
                                ? 'scale(1) translate3d(0, 0, 0)'
                                : 'scale(1.05) translate3d(0, -1.5%, 0)'
                        }}
                    />
                )
            })}

        </div>
    )
}

const WhispPhoneSlideshow = () => {
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % WHISP_SLIDES.length)
        }, 2600)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full h-full bg-black">
            {WHISP_SLIDES.map((slide, index) => {
                const isActive = index === activeSlide
                return (
                    <img
                        key={slide}
                        src={slide}
                        alt={`Whisp screen ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        style={{
                            transform: isActive
                                ? 'scale(1) translate3d(0, 0, 0)'
                                : 'scale(1.05) translate3d(0, -1.5%, 0)'
                        }}
                    />
                )
            })}

        </div>
    )
}

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
    <button className="group flex items-center gap-2.5 bg-white text-black px-4 py-2 rounded-full border-4 border-black shadow-[6px_6px_0px_black] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none">
        <div className="flex items-center justify-center w-9 h-9 grayscale group-hover:grayscale-0 transition-all">
            {store === 'apple' ? <AppleIcon /> : <GooglePlayIcon />}
        </div>
        <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Télécharger sur</span>
            <span className="text-base font-black font-display tracking-tight">{label}</span>
        </div>
    </button>
)
const PhoneMockup = ({
    children,
    className = "",
    frame
}: {
    children: React.ReactNode
    className?: string
    frame?: Partial<IPhoneMockupProps>
}) => (
    <div className="w-auto">
        <IPhoneMockup
            screenType="island"
            screenWidth={235}
            frameColor="#000000"
            hideStatusBar
            hideNavBar
            {...frame}
        >
            <div className={`w-full h-full overflow-hidden ${className}`}>
                {children}
            </div>
        </IPhoneMockup>
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
                        <div>
                            <PhoneMockup
                                className="bg-[#92d3f5]"
                            >
                                <VagoPhoneSlideshow />
                                {/* removed Logo from inside phone */}
                            </PhoneMockup>
                        </div>
                    </div>

                    {/* Info */}
                    <div ref={vagoText} className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo here instead */}
                        <div className="mb-8">
                            <AppIcon src={vagoLogo} alt="Vago app icon" className="w-20 h-20 md:w-28 md:h-28" />
                        </div>

                        <h3 className="font-display text-4xl md:text-6xl font-black uppercase leading-none mb-8 drop-shadow-[4px_4px_0px_white]">
                            LE JEU QUI<br />PAIE VOTRE<br />ESSENCE.
                        </h3>
                        <p className="font-sans text-lg md:text-xl font-medium leading-relaxed mb-8 max-w-md">
                            Marre des prix à la pompe ? Avec Vago, jouez et obtenez votre plein gratuit.
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
                        <div>
                            <PhoneMockup
                                className="bg-[#3279F7]"
                            >
                                <WhispPhoneSlideshow />
                                {/* removed Logo from inside phone */}
                            </PhoneMockup>
                        </div>
                    </div>

                    {/* Info */}
                    <div ref={whispText} className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo here instead */}
                        <div className="mb-8">
                            <AppIcon src={whispLogo} alt="Whisp app icon" className="w-20 h-20 md:w-28 md:h-28 shadow-[8px_8px_0px_white] border-white" />
                        </div>

                        <h3 className="font-display text-4xl md:text-6xl font-black uppercase leading-none mb-8 text-black drop-shadow-[4px_4px_0px_white]">
                            SOCIAL<br />RÉEL.
                        </h3>
                        <p className="font-sans text-lg md:text-xl font-medium leading-relaxed mb-8 max-w-md">
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
