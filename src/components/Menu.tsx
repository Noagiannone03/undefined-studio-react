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
                gsap.to(menuOverlay.current, {
                    y: '0%',
                    duration: 1,
                    ease: 'power4.inOut',
                })

                gsap.fromTo(
                    '.menu-item-text',
                    { x: -100, opacity: 0, skewX: -20 },
                    {
                        x: 0,
                        opacity: 1,
                        skewX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'expo.out',
                        delay: 0.3,
                    }
                )
            } else {
                gsap.to(menuOverlay.current, {
                    y: '-100%',
                    duration: 0.8,
                    ease: 'power4.inOut',
                })
            }
        },
        { scope: container, dependencies: [isOpen] }
    )

    const menuItems = [
        { label: 'Selected Works', href: '#works' },
        { label: 'The Studio', href: '#studio' },
        { label: 'Playground', href: '#lab' },
        { label: 'Say Hello', href: '#contact' },
    ]

    return (
        <div ref={container}>
            {/* Skewed Menu Button */}
            <div className="fixed top-8 right-8 z-[60]">
                <button
                    onClick={toggleMenu}
                    className="btn-skew bg-black text-white px-6 py-4 h-auto flex items-center justify-center text-xl"
                >
                    <span>{isOpen ? 'CLOSE' : 'MENU'}</span>
                </button>
            </div>

            {/* Full Screen Overlay - Skewed Entrance */}
            <div
                ref={menuOverlay}
                className="fixed inset-0 z-50 bg-lemon flex flex-col justify-center items-start px-[10%] pointer-events-auto border-b-8 border-black"
                style={{ transform: 'translateY(-100%)' }}
            >
                {/* Background Large Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
                    <h1 className="font-display text-[30vw] font-black uppercase text-black">HELLO</h1>
                </div>

                <nav className="flex flex-col gap-4 relative z-10">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="group py-2 block"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="menu-item-text block font-display text-5xl md:text-9xl font-black text-black group-hover:text-white transition-colors duration-300 uppercase leading-none">
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>

                {/* Stickers in menu */}
                <div className="absolute top-20 left-20 sticker bg-peach animate-float">Curated Code</div>
                <div className="absolute bottom-20 right-20 sticker bg-mint animate-wiggle">2026 Edition</div>
            </div>
        </div>
    )
}
