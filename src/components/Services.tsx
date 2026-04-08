import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import GrainOverlay from './GrainOverlay'

gsap.registerPlugin(ScrollTrigger)

const services = [
    {
        id: '01',
        title: "ARTISANS\nDU CODE",
        desc: "On conçoit des fondations solides avant d'empiler les features. Architecture claire, performances mesurables, dette technique maîtrisée.",
        tools: ["TypeScript", "React", "Swift/Kotlin", "Qualité"],
        bg: "bg-lemon",
        textColor: "text-black",
        rotate: -2,
        chipClass: "hover:bg-black hover:text-lemon",
    },
    {
        id: '02',
        title: "DESIGN\nRADICAL",
        desc: "Le design n'est pas du vernis. C'est un système de décisions qui guide l'utilisateur, clarifie le message, et donne du caractère à la marque.",
        tools: ["UX Writing", "Systèmes UI", "Motion utile", "Direction"],
        bg: "bg-black",
        textColor: "text-white",
        rotate: 1,
        chipClass: "hover:bg-white hover:text-black",
    },
    {
        id: '03',
        title: "IMPACT\nRÉEL",
        desc: "On livre des produits qui vivent hors de Figma. Lancement, instrumentation, itérations: on optimise ce qui compte vraiment.",
        tools: ["MVP solide", "Analytics", "Itération", "Conversion"],
        bg: "bg-mint",
        textColor: "text-black",
        rotate: -1,
        chipClass: "hover:bg-black hover:text-mint",
    },
]

export default function Services() {
    const sectionRef = useRef<HTMLElement>(null)
    const stackRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const mm = gsap.matchMedia()

        mm.add('(min-width: 768px)', () => {
            const wrappers = gsap.utils.toArray<HTMLDivElement>('.service-card-wrapper')
            const cards = gsap.utils.toArray<HTMLDivElement>('.service-card-desktop')
            if (wrappers.length < 2 || cards.length < 2 || !stackRef.current) return

            wrappers.forEach((wrapper, i) => {
                const card = cards[i]
                if (!card) return
                gsap.set(card, { zIndex: i + 1 })

                if (i === cards.length - 1) return

                ScrollTrigger.create({
                    trigger: wrapper,
                    start: 'top center',
                    endTrigger: wrappers[wrappers.length - 1],
                    end: 'top center',
                    pin: true,
                    pinSpacing: false,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                })

                gsap.to(card, {
                    y: -10 - i * 3,
                    scale: 0.985 - i * 0.01,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrappers[i + 1],
                        start: 'top 74%',
                        end: 'top center',
                        scrub: 0.4,
                        invalidateOnRefresh: true,
                    },
                })
            })
        })

        mm.add('(max-width: 767px)', () => {
            const cards = gsap.utils.toArray<HTMLDivElement>('.service-card-desktop')
            cards.forEach((card, index) => {
                const baseRotate = services[index]?.rotate ?? 0
                gsap.fromTo(
                    card,
                    { autoAlpha: 0, y: 80, rotate: baseRotate + 5, scale: 1.02 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        rotate: baseRotate,
                        scale: 1,
                        duration: 0.75,
                        ease: 'power3.out',
                        immediateRender: false,
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                )
            })
        })

        return () => mm.revert()
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} id="services" className="relative w-full bg-lilac py-20 pb-40 border-b-4 border-black overflow-hidden">

            {/* INCREASED GRAIN OPACITY TO 0.5 */}
            <GrainOverlay opacity={0.5} />

            {/* Giant Background Title */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5">
                <h2 className="font-display text-[25vw] font-black uppercase text-black leading-none whitespace-nowrap -translate-y-1/4">
                    SERVICES
                </h2>
            </div>

            <div className="container mx-auto px-6 mb-24 relative z-10 flex flex-col items-center">
                <div className="bg-black text-white px-6 py-2 -rotate-2 inline-block shadow-[6px_6px_0px_#B8F4D4] mb-8">
                    <span className="font-mono font-bold uppercase tracking-widest">Nos valeurs en action</span>
                </div>
                <h2 className="font-display text-[12vw] font-black uppercase text-black leading-none text-center drop-shadow-[6px_6px_0px_white]">
                    NOTRE MÉTHODE
                </h2>
            </div>

            <div ref={stackRef} className="flex flex-col items-center gap-0 w-full px-4 md:px-0 relative z-10">
                {services.map((s) => (
                    <div key={s.id} className="service-card-wrapper w-full max-w-6xl mb-16 md:mb-20 last:mb-0">
                        <div
                            className={`service-card-desktop w-full ${s.bg} border-4 border-black p-8 md:p-12 rounded-none md:rounded-3xl shadow-[8px_8px_0px_black] will-change-transform relative overflow-hidden`}
                            style={{ rotate: `${s.rotate}deg` }}
                        >
                            <GrainOverlay opacity={0.15} />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className={`font-display text-4xl font-black ${s.textColor} opacity-30`}>#{s.id}</span>
                                        <div className={`h-1 flex-1 ${s.textColor === 'text-white' ? 'bg-white' : 'bg-black'} opacity-30`}></div>
                                    </div>

                                    <h3 className={`font-display text-5xl md:text-7xl font-black uppercase whitespace-pre-line leading-[0.85] tracking-tighter ${s.textColor} drop-shadow-sm`}>
                                        {s.title}
                                    </h3>
                                </div>

                                <div className="max-w-md flex-1">
                                    <p className={`font-body text-xl md:text-2xl font-bold mb-8 leading-tight whitespace-pre-line ${s.textColor}`}>
                                        {s.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {s.tools.map(t => (
                                            <span key={t} className={`text-sm font-mono font-bold border-2 border-current px-3 py-1 uppercase ${s.textColor} ${s.chipClass} transition-colors cursor-default`}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Corner Decoration */}
                            <div className="absolute top-4 right-4 w-4 h-4 border-2 border-current rounded-full" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-2 border-current rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

        </section>
    )
}
