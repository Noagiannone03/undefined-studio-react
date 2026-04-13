import { useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Asterisk from './Asterisk'
import ScrollReveal from './ScrollReveal'

const PRINCIPLES = [
    { n: '01', title: 'Moins, mieux', body: 'Un seul cœur fonctionnel. Zéro feature en trop.' },
    { n: '02', title: 'Trois personnes', body: 'Du premier croquis jusqu\'au store. Pas d\'intermédiaire.' },
    { n: '03', title: 'Ship fast', body: 'Prototype semaine 1. Production semaine 6.' },
]

export default function Editorial() {
    const asteriskRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!asteriskRef.current) return
        const ctx = gsap.context(() => {
            gsap.to(asteriskRef.current, {
                yPercent: -30,
                rotate: 45,
                ease: 'none',
                scrollTrigger: {
                    trigger: asteriskRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            })
        })
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section id="index" className="relative bg-paper text-ink border-t border-ink overflow-hidden">
            {/* meta bar */}
            <div className="grid-12 items-baseline border-b border-ink h-11 container-x">
                <div className="col-span-6 md:col-span-4 label label-soft">§ 01 — Manifesto</div>
                <div className="hidden md:block col-span-4 text-center label label-soft">What we believe</div>
                <div className="col-span-6 md:col-span-4 label label-soft text-right">↓ scroll</div>
            </div>

            {/* Grande déclaration */}
            <div className="relative container-x section-y">
                {/* Astérisque arrière-plan parallax */}
                <div ref={asteriskRef} aria-hidden className="pointer-events-none absolute left-[-8vw] top-[10%] w-[60vw] md:w-[40vw] opacity-[0.07]">
                    <Asterisk className="w-full h-full spin-slow" color="#0A0A0A" />
                </div>

                <div className="relative grid grid-cols-12 gap-y-8">
                    <div className="col-span-12 md:col-span-2 flex md:flex-col gap-3">
                        <span className="badge">§ 01</span>
                    </div>
                    <ScrollReveal className="col-span-12 md:col-span-10 display text-[11vw] md:text-[6.5vw] leading-[0.9] tracking-[-0.04em]">
                        We build <span className="serif-italic text-tomato">small</span>,
                        sharp, &amp; <span className="text-outline">durable</span> products —
                        from the <span className="serif-italic text-klein">first sketch</span> to the
                        app store.
                    </ScrollReveal>
                </div>
            </div>

            {/* 3 principes en ligne éditoriale */}
            <div className="border-t border-ink">
                {PRINCIPLES.map((p, i) => (
                    <motion.div
                        key={p.n}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="group grid grid-cols-12 items-baseline container-x py-10 md:py-16 border-b border-ink hover:bg-paper-2 transition-colors"
                    >
                        <span className="col-span-2 md:col-span-1 display text-3xl md:text-4xl text-outline group-hover:text-tomato transition-colors">
                            {p.n}
                        </span>
                        <h3 className="col-span-10 md:col-span-6 display text-4xl md:text-6xl leading-[0.92]">
                            {p.title}
                        </h3>
                        <p className="col-span-12 md:col-span-5 mt-4 md:mt-0 font-body text-base md:text-lg leading-[1.35] text-ink-soft">
                            {p.body}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
