import { useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowDown } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Asterisk from './Asterisk'

export default function Hero() {
    const asteriskRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const descRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (asteriskRef.current) {
                gsap.to(asteriskRef.current, {
                    yPercent: -40,
                    rotate: 90,
                    ease: 'none',
                    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 },
                })
            }
            if (titleRef.current) {
                gsap.to(titleRef.current, {
                    yPercent: 20,
                    ease: 'none',
                    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 },
                })
            }
            if (descRef.current) {
                gsap.to(descRef.current, {
                    yPercent: -15,
                    opacity: 0.5,
                    ease: 'none',
                    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 },
                })
            }
        })
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section
            id="top"
            className="relative min-h-[100svh] w-full bg-paper text-ink flex flex-col pt-14 overflow-hidden"
        >
            {/* Top bar */}
            <div className="grid-12 items-center border-b border-ink h-11 container-x z-20 relative">
                <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-tomato pulse-dot" />
                    <span className="label label-soft">Open · Q2 2026</span>
                </div>
                <div className="hidden md:flex col-span-4 justify-center">
                    <span className="label label-soft">Independent product studio</span>
                </div>
                <div className="col-span-6 md:col-span-4 flex justify-end">
                    <span className="label label-soft">Paris · Toulouse</span>
                </div>
            </div>

            {/* Corps */}
            <div className="relative flex-1 container-x flex flex-col justify-center">

                {/* Astérisque rotatif en background */}
                <div ref={asteriskRef} aria-hidden className="pointer-events-none absolute right-[-8vw] top-1/2 -translate-y-1/2 w-[80vw] md:w-[55vw] opacity-[0.08]">
                    <Asterisk className="w-full h-full spin-slow" color="#0A0A0A" />
                </div>

                {/* Titre */}
                <div className="relative z-10 py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <Asterisk className="w-5 h-5 spin-slow text-tomato" color="currentColor" />
                        <span className="label">Studio / 2024 — 2026</span>
                    </motion.div>

                    <motion.h1
                        ref={titleRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="display text-[22vw] md:text-[14vw] leading-[0.86] tracking-[-0.055em]"
                    >
                        <span className="block">We build</span>
                        <span className="block">
                            what&apos;s
                        </span>
                        <span className="block">
                            <span className="serif-italic text-tomato">un</span>defined
                            <span className="text-klein">.</span>
                        </span>
                    </motion.h1>
                </div>

                {/* Bas — desc + CTA */}
                <motion.div
                    ref={descRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="relative z-10 grid grid-cols-12 items-end gap-y-8 pb-14 md:pb-20"
                >
                    <p className="col-span-12 md:col-span-5 font-body text-lg md:text-xl leading-[1.3] max-w-[42ch] text-ink-soft">
                        Studio indépendant design &amp; code. On fabrique des apps
                        <span className="serif-italic text-ink"> nerveuses, nettes, utiles</span> — du premier croquis jusqu&apos;au store.
                    </p>

                    <div className="hidden md:block col-span-3" />

                    <div className="col-span-12 md:col-span-4 flex flex-col md:items-end gap-3">
                        <a href="#work" className="btn-fill">
                            Voir les projets
                            <span className="arrow"><ArrowDown size={16} weight="bold" /></span>
                        </a>
                        <a href="#contact" className="btn-pill">
                            <span className="dot" /> Démarrer un brief
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
