import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

export default function DNA() {
    const sectionRef = useRef<HTMLElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (!textRef.current) return

        // Word parallax/distort effect on scroll
        gsap.fromTo(".dna-word",
            { y: 100, opacity: 0, skewY: 10 },
            {
                y: 0,
                opacity: 1,
                skewY: 0,
                stagger: 0.2,
                duration: 1.5,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    }, { scope: sectionRef })

    return (
        <section
            ref={sectionRef}
            id="studio"
            className="min-h-screen w-full bg-black text-white relative flex flex-col items-center justify-center p-10 md:p-20 overflow-hidden"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                <div className="star w-[80vw] h-[80vw] bg-mint animate-spin-slow blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl w-full">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-0.5 w-20 bg-mint" />
                    <span className="font-display text-mint font-bold uppercase tracking-widest">Notre ADN</span>
                </div>

                <div ref={textRef} className="flex flex-col gap-2">
                    <h2 className="font-display text-5xl md:text-[8vw] font-black uppercase leading-[0.9] tracking-tighter">
                        <span className="dna-word block">REFUSER LE</span>
                        <span className="dna-word block text-mint italic underline decoration-4 underline-offset-8">GÉNÉRIQUE.</span>
                        <span className="dna-word block">SCULPTER</span>
                        <span className="dna-word block">L'EXCEPTION.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
                    <div className="sticker bg-white text-black p-8 rotate-[-1deg] shadow-hard">
                        <h3 className="font-display text-2xl font-black mb-4 uppercase italic">La Philosophie</h3>
                        <p className="font-body text-lg font-medium leading-relaxed">
                            Le web est devenu plat. Nous lui rendons son relief. Chaque ligne de code est une intention, chaque animation est une émotion. On ne fait pas "juste" des sites web, on crée votre identité numérique vivante.
                        </p>
                    </div>

                    <div className="sticker bg-lemon text-black p-8 rotate-[1deg] shadow-hard self-end">
                        <h3 className="font-display text-2xl font-black mb-4 uppercase italic">Le Résultat</h3>
                        <p className="font-body text-lg font-medium leading-relaxed">
                            Des interfaces qui convertissent parce qu'elles captivent. Une alliance parfaite entre la performance technologique et la poésie visuelle. Bienvenue dans l'ère de l'impact conscient.
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual reward in corners */}
            <div className="absolute bottom-10 right-10 sticker bg-peach text-xs font-mono uppercase tracking-[0.2em]">
                {`No Template. No Compromise._`}
            </div>
        </section>
    )
}
