import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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
            <div className="fixed top-8 right-8 z-[60]">
                {/* NEO-BRUTALIST BUTTON */}
                <button
                    onClick={toggleMenu}
                    className="group relative w-16 h-16 outline-none focus:outline-none"
                >
                    {/* Shadow Block (Bottom Layer) - FIXED */}
                    <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1" />

                    {/* Main Button (Top Layer) - MOVES ON CLICK */}
                    <div className={`
                        relative w-full h-full rounded-full border-4 border-black flex items-center justify-center transition-all duration-100 ease-out
                        ${isOpen ? 'bg-black text-white' : 'bg-mint text-black'}
                        translate-x-0 translate-y-0
                        group-hover:-translate-y-0.5 group-hover:-translate-x-0.5
                        group-active:translate-x-1 group-active:translate-y-1
                    `}>
                        <div className="flex flex-col gap-1.5 items-center justify-center w-8">
                            {isOpen ? (
                                <div className="relative w-full h-6 pointer-events-none">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white rotate-45 transition-transform" />
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white -rotate-45 transition-transform" />
                                </div>
                            ) : (
                                <>
                                    <div className="w-full h-1 bg-black rounded-full transition-all group-hover:w-3/4" />
                                    <div className="w-2/3 h-1 bg-black rounded-full self-start transition-all group-hover:w-full" />
                                    <div className="w-full h-1 bg-black rounded-full transition-all group-hover:w-1/2" />
                                </>
                            )}
                        </div>
                    </div>

                </button>
            </div>

            <div ref={menuOverlay} className="fixed inset-0 z-50 bg-lemon flex flex-col justify-center items-start px-[10%] pointer-events-auto border-b-8 border-black" style={{ transform: 'translateY(-100%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
                    <h1 className="font-display text-[30vw] font-black uppercase text-black">HELLO</h1>
                </div>
                <nav className="flex flex-col gap-4 relative z-10">
                    {menuItems.map((item, index) => (
                        <a key={index} href={item.href} className="group py-2 block" onClick={() => setIsOpen(false)}>
                            <span className="menu-item-text block font-display text-5xl md:text-9xl font-black text-black group-hover:text-white transition-colors duration-300 uppercase leading-none">
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>

            </div>
        </div>
    )
}
