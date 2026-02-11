import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import GrainOverlay from './GrainOverlay'

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
        <section ref={containerRef} className="min-h-screen w-full bg-black text-white py-20 px-6 flex flex-col justify-center relative border-b-4 border-white overflow-hidden">

            {/* INCREASED GRAIN OPACITY TO 0.5 */}
            <GrainOverlay opacity={0.5} />

            {/* Background Blob for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-lemon rounded-full mix-blend-exclusion filter blur-[150px] opacity-20 pointer-events-none animate-pulse" />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="mb-12 flex items-center gap-4">
                    <span className="font-mono text-sm uppercase border border-white px-3 py-1 rounded-full bg-white text-black font-bold">01 — Manifeste</span>
                </div>

                <div className="relative z-10 font-display font-black text-5xl md:text-[6.5vw] leading-[0.9] uppercase tracking-tighter mix-blend-difference">
                    <div className="overflow-hidden"><div className="manifesto-line">Le web est</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line text-transparent stroke-white" style={{ WebkitTextStroke: '2px white' }}>devenu ennuyeux.</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line text-lemon drop-shadow-[4px_4px_0px_#FFF]">Il est temps</div></div>
                    <div className="overflow-hidden"><div className="manifesto-line">de le réveiller.</div></div>
                </div>

                <div className="mt-20 flex justify-end">
                    <div className="max-w-2xl text-right">
                        <p className="manifesto-line font-body text-xl md:text-3xl font-bold leading-tight opacity-80">
                            Nous créons des expériences numériques qui ne s'excusent pas d'exister. Brut. Direct. Mémorable.
                        </p>
                    </div>
                </div>
            </div>

        </section>
    )
}
