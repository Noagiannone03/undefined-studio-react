import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Asterisk from './Asterisk'

const PRINCIPLES = [
    { n: 'I', title: 'Less, better', body: 'One functional heart. Zero extra features. We cut, then cut again.' },
    { n: 'II', title: 'Three people', body: 'From first sketch to the store. No middlemen, no handoffs.' },
    { n: 'III', title: 'Ship fast', body: 'Prototype week one. Production week six. Done beats perfect.' },
]

export default function Editorial() {
    const ref = useRef<HTMLElement>(null)
    const pullRef = useRef<HTMLSpanElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const words = ref.current?.querySelectorAll('[data-word]')
            if (words) {
                gsap.fromTo(
                    words,
                    { yPercent: 120, opacity: 0 },
                    {
                        yPercent: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'expo.out',
                        stagger: 0.04,
                        scrollTrigger: { trigger: words[0], start: 'top 85%' },
                    }
                )
            }
            if (pullRef.current) {
                gsap.fromTo(
                    pullRef.current,
                    { rotate: -8, scale: 0.8, opacity: 0 },
                    {
                        rotate: -4,
                        scale: 1,
                        opacity: 1,
                        duration: 1.1,
                        ease: 'back.out(1.2)',
                        scrollTrigger: { trigger: pullRef.current, start: 'top 80%' },
                    }
                )
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    const paragraph = `A studio is a posture more than a practice. We believe product work starts in the morning light, continues in rough notebooks, and ends in people's pockets. We write software the way a tailor cuts cloth — close to the body, with intention, and with one hand always on the scissors. Nothing extra. Nothing fashionable. Only what holds.`

    return (
        <section ref={ref} id="index" className="relative frame-paper overflow-hidden">
            {/* editorial ruled paper */}
            <div aria-hidden className="absolute inset-0 pointer-events-none grid-lines text-ink" />

            {/* masthead */}
            <div className="relative container-x pt-10 md:pt-14 hair-b border-ink">
                <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
                    <h4 className="boska-italic text-4xl md:text-5xl">The Studio Gazette</h4>
                    <div className="flex gap-6">
                        <span className="label">Vol. II</span>
                        <span className="label">Issue 04</span>
                        <span className="label">€0.00</span>
                    </div>
                </div>
            </div>

            {/* Big headline — words stagger reveal */}
            <div className="relative container-x pt-16 md:pt-24 pb-8">
                <div className="flex items-center gap-3 mb-8">
                    <Asterisk className="w-3 h-3 spin-slow text-tomato" color="currentColor" />
                    <span className="label">§ 01 · Editorial</span>
                    <span className="flex-1 h-px bg-ink/20" />
                    <span className="label label-soft">A letter from the studio</span>
                </div>

                <h2 className="display text-[12vw] md:text-[7.8vw] leading-[0.9] tracking-[-0.045em]">
                    {'We build small, sharp, & durable things.'.split(' ').map((w, i) => (
                        <span key={i} className="overflow-hidden inline-block mr-[0.15em] align-top">
                            <span data-word className="inline-block">
                                {w === 'small' ? <span className="serif-italic text-tomato">small</span>
                                : w === 'durable' ? <span className="text-outline">durable</span>
                                : w === 'things.' ? <span className="boska-italic text-klein">things.</span>
                                : w}
                            </span>
                        </span>
                    ))}
                </h2>
            </div>

            {/* Magazine body: drop cap + columns + sidebar */}
            <div className="relative container-x pb-20 md:pb-28 grid grid-cols-12 gap-y-12 gap-x-6 md:gap-x-10">
                {/* Sidebar — marginalia */}
                <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 md:self-start flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="label label-soft">Byline</span>
                        <span className="serif-italic text-3xl">the studio</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="label label-soft">Filed</span>
                        <span className="font-mono text-sm">2026 · Paris</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="label label-soft">Reading</span>
                        <span className="font-mono text-sm">2 min · 387 words</span>
                    </div>
                    <div className="hair-t border-ink pt-4">
                        <p className="font-body text-sm leading-[1.5] text-ink-soft">
                            Filed under <span className="serif-italic text-ink">manifesto</span>, for future readers and
                            present clients.
                        </p>
                    </div>
                </aside>

                {/* Main body with drop cap */}
                <div className="col-span-12 md:col-span-6 flex flex-col gap-8">
                    <p className="dropcap font-body text-lg md:text-xl leading-[1.5] text-ink">
                        {paragraph}
                    </p>

                    <p className="font-body text-lg md:text-xl leading-[1.5] text-ink-soft md:columns-2 md:gap-8">
                        We work in threes because that&apos;s the smallest number that disagrees well. We design while we
                        code, and we code while we design — the two disciplines are not adjacent, they are the same discipline
                        wearing two coats. Decks are written for people who won&apos;t read them. We prefer the product itself
                        to do the arguing. Six weeks from the first sketch to the store is not a sprint, it&apos;s a rhythm —
                        the one we keep.
                    </p>

                    {/* principes numérotés en romain */}
                    <div className="mt-6 flex flex-col gap-0 hair-t border-ink">
                        {PRINCIPLES.map(p => (
                            <div key={p.n} className="group grid grid-cols-12 gap-4 py-6 hair-b border-ink hover:bg-paper-2 transition-colors">
                                <span className="col-span-2 serif-italic text-4xl text-tomato group-hover:translate-x-2 transition-transform">
                                    {p.n}
                                </span>
                                <div className="col-span-10">
                                    <h4 className="display text-2xl md:text-3xl leading-[0.95]">{p.title}</h4>
                                    <p className="mt-1 font-body text-sm md:text-base text-ink-soft leading-[1.4]">
                                        {p.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* pull quote slanted */}
                <div className="col-span-12 md:col-span-3 flex flex-col justify-start gap-6">
                    <span
                        ref={pullRef}
                        className="inline-block rotate-[-4deg] origin-left hair border-ink p-5 bg-paper-2 shadow-[6px_6px_0_0_rgba(10,10,10,1)]"
                    >
                        <span className="label label-soft block mb-2">Pull quote</span>
                        <span className="boska-italic text-3xl md:text-4xl leading-[1] block">
                            &ldquo;we prefer the product to do the arguing.&rdquo;
                        </span>
                    </span>

                    <div className="flex flex-col gap-2 hair-t border-ink pt-5">
                        <span className="label label-soft">Also in this issue</span>
                        <a href="#work" className="serif-italic text-2xl u-draw">two apps in the wild →</a>
                        <a href="#services" className="serif-italic text-2xl u-draw">four disciplines, one voice →</a>
                        <a href="#ask" className="serif-italic text-2xl u-draw">an open terminal →</a>
                    </div>
                </div>
            </div>
        </section>
    )
}
