import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function Manifesto() {
    const containerRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        // Reveal animation
        gsap.fromTo('.manifesto-line',
            { y: '100%', rotate: 5, opacity: 0 },
            {
                y: '0%',
                rotate: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                }
            }
        )
    }, { scope: containerRef })

    return (
        <section ref={containerRef} className="min-h-screen w-full bg-cream text-black py-20 px-6 flex flex-col justify-center relative border-b-4 border-black">
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-12 flex items-center gap-4">
                    <span className="font-mono text-sm uppercase border border-black px-2 py-1 rounded-full">01 — Manifeste</span>
                </div>

                <div className="relative z-10 font-display font-black text-5xl md:text-[6.5vw] leading-[0.9] uppercase tracking-tighter">
                    <div className="overflow-hidden"><div className="manifesto-line">Le web est</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line text-transparent stroke-black" style={{ WebkitTextStroke: '2px black' }}>devenu ennuyeux.</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line text-lavender drop-shadow-[4px_4px_0px_#000]">Il est temps</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line">de le réveiller.</div></div>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-start-2">
                        <p className="font-body text-xl md:text-2xl font-medium leading-relaxed">
                            Nous sommes <span className="font-bold border-b-2 border-mint">Undefined Studio</span>.
                            Nous croyons que la technologie sans émotion est inutile.
                            Notre mission ? Créer des expériences numériques qui marquent les esprits, pas juste des pages qui scrollent.
                            <br /><br />
                            Brut, interactif, humain.
                        </p>
                        <div className="mt-8">
                            <button className="border-b-2 border-black font-display font-bold text-lg hover:bg-black hover:text-white transition-colors px-2 py-1">
                                DÉCOUVRIR L'ÉQUIPE →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Blob */}
            <div className="absolute top-20 right-[-10%] w-[40vw] h-[40vw] bg-peach/30 blur-[100px] rounded-full pointer-events-none" />
        </section>
    )
}
