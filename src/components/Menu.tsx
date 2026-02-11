import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import GrainOverlay from './GrainOverlay'

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false)
    const container = useRef<HTMLDivElement>(null)
    const menuOverlay = useRef<HTMLDivElement>(null)

    const toggleMenu = () => setIsOpen(!isOpen)

    useGSAP(
        () => {
            if (isOpen) {
                gsap.to(menuOverlay.current, { y: '0%', duration: 1, ease: 'power4.inOut' })
                gsap.fromTo('.menu-item-text', { x: -100, opacity: 0, skewX: -20 }, { x: 0, opacity: 1, skewX: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', delay: 0.3 })
            } else {
                gsap.to(menuOverlay.current, { y: '-100%', duration: 0.8, ease: 'power4.inOut' })
            }
        },
        { scope: container, dependencies: [isOpen] }
    )

    const menuItems = [
        { label: 'Projets', href: '#works' },
        { label: 'Le Studio', href: '#studio' },
        { label: 'Curiosités', href: '#lab' },
        { label: 'Contact', href: '#contact' },
    ]

    return (
        <div ref={container}>
            {/* NEW MENU BUTTON - BRUTALIST SQUARE - SPACED OUT */}
            <div className="fixed top-8 right-8 md:top-12 md:right-12 z-[60]">
                <button
                    onClick={toggleMenu}
                    className="group relative w-16 h-16 md:w-20 md:h-20 bg-black border-4 border-transparent hover:border-black hover:bg-white transition-all duration-300 shadow-[8px_8px_0px_white] hover:shadow-[4px_4px_0px_black]"
                    aria-label="Toggle Menu"
                >
                    <div className="flex flex-col items-center justify-center w-full h-full gap-1.5 p-2">
                        {/* Hamburger / Close Icon */}
                        <div className="relative w-8 h-6 flex flex-col justify-between items-center overflow-hidden">
                            <span className={`w-full h-1 bg-white group-hover:bg-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                            <span className={`w-full h-1 bg-white group-hover:bg-black transition-all duration-300 ${isOpen ? 'translate-x-full opacity-0' : ''}`} />
                            <span className={`w-full h-1 bg-white group-hover:bg-black transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
                        </div>
                    </div>
                </button>
            </div>

            <div ref={menuOverlay} className="fixed inset-0 z-50 bg-mint flex flex-col justify-center items-start px-[10%] pointer-events-auto border-b-8 border-black overflow-hidden" style={{ transform: 'translateY(-100%)' }}>

                {/* Using the updated GrainOverlay here too */}
                <GrainOverlay opacity={0.4} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
                    <h1 className="font-display text-[30vw] font-black uppercase text-black leading-none">HELLO</h1>
                </div>

                <nav className="flex flex-col gap-4 relative z-10 w-full">
                    {menuItems.map((item, index) => (
                        <a key={index} href={item.href} className="group py-2 block border-b-4 border-black/10 hover:border-black transition-colors" onClick={() => setIsOpen(false)}>
                            <div className="menu-item-text flex items-center justify-between">
                                <span className="font-display text-5xl md:text-8xl font-black text-black group-hover:text-white group-hover:text-stroke-black transition-all duration-300 uppercase leading-none" style={{ WebkitTextStroke: '2px black' }}>
                                    {item.label}
                                </span>
                                <span className="font-mono text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    0{index + 1}
                                </span>
                            </div>
                        </a>
                    ))}
                </nav>

            </div>
        </div>
    )
}
