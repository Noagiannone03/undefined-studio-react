import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const CARDS = [
    { n: '01', label: 'Sprint', value: 'Week 03 · Whisp v1.2', sub: 'shipping Friday' },
    { n: '02', label: 'Bandwidth', value: '1 seat · Q3 2026', sub: 'writing briefs now' },
    { n: '03', label: 'Hours', value: '09:00 → 18:30 CET', sub: 'answering in <24h' },
    { n: '04', label: 'Mood', value: 'caffeinated', sub: 'flat white, no sugar' },
]

function useCounter(target: number, duration = 2000) {
    const [v, setV] = useState(0)
    const triggeredRef = useRef(false)
    const ref = useRef<HTMLSpanElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !triggeredRef.current) {
                    triggeredRef.current = true
                    const t0 = performance.now()
                    const step = (t: number) => {
                        const p = Math.min(1, (t - t0) / duration)
                        const eased = 1 - Math.pow(1 - p, 3)
                        setV(Math.round(eased * target))
                        if (p < 1) requestAnimationFrame(step)
                    }
                    requestAnimationFrame(step)
                }
            })
        }, { threshold: 0.3 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [target, duration])
    return { value: v, ref }
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const { value, ref } = useCounter(to)
    return <span ref={ref}>{value}{suffix}</span>
}

export default function Now() {
    const rootRef = useRef<HTMLElement>(null)

    useLayoutEffect(() => {
        if (!rootRef.current) return
        const ctx = gsap.context(() => {
            const cards = rootRef.current?.querySelectorAll('[data-card]')
            if (cards) {
                gsap.fromTo(
                    cards,
                    { y: 40, opacity: 0 },
                    {
                        y: 0, opacity: 1,
                        duration: 0.9, ease: 'expo.out', stagger: 0.1,
                        scrollTrigger: { trigger: cards[0], start: 'top 80%' },
                    }
                )
            }
            const heading = rootRef.current?.querySelector('[data-heading]')
            if (heading) {
                const parts = heading.querySelectorAll('.reveal-line')
                gsap.set(parts, { yPercent: 110 })
                gsap.to(parts, {
                    yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
                    scrollTrigger: { trigger: heading, start: 'top 80%' },
                })
            }
        }, rootRef)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section ref={rootRef} id="now" className="relative bg-paper text-ink overflow-hidden">
            {/* head */}
            <div className="pad-x pt-32 md:pt-44 pb-10 md:pb-16">
                <div className="flex items-baseline justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-tomato soft-pulse" />
                        <span className="label">(ii) Now — live from the studio</span>
                    </div>
                    <span className="label label-soft hidden md:inline">status feed</span>
                </div>

                <h2 data-heading className="display text-[14vw] md:text-[8.5vw] leading-[0.88] tracking-[-0.045em] max-w-[18ch]">
                    <span className="reveal-mask"><span className="reveal-line">Currently</span></span>
                    <span className="reveal-mask"><span className="reveal-line">in the <span className="serif-italic text-tomato">workshop.</span></span></span>
                </h2>
            </div>

            {/* Live status cards */}
            <div className="pad-x pb-20 md:pb-32">
                <div className="hair-t">
                    {CARDS.map((c) => (
                        <div
                            key={c.n}
                            data-card
                            className="group grid grid-cols-12 items-baseline gap-y-2 py-7 md:py-10 hair-b hover:bg-paper-2/60 transition-colors"
                        >
                            <span className="col-span-2 md:col-span-1 label label-soft self-start pt-3">{c.n}</span>
                            <span className="col-span-10 md:col-span-3 label label-soft self-start pt-3">{c.label}</span>
                            <span className="col-span-12 md:col-span-5 display text-2xl md:text-4xl leading-[1] tracking-[-0.025em] group-hover:translate-x-1 transition-transform duration-500">
                                {c.value}
                            </span>
                            <span className="col-span-12 md:col-span-3 serif-italic text-xl md:text-2xl leading-[1.2] text-ink-soft md:text-right">
                                {c.sub}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom counters */}
                <div className="grid grid-cols-3 gap-4 md:gap-10 mt-16 md:mt-24">
                    {[
                        { n: 2, s: '', k: 'apps live' },
                        { n: 6, s: 'w', k: 'avg ship time' },
                        { n: 3, s: '', k: 'hands' },
                    ].map((m, i) => (
                        <div key={i} data-card className="flex flex-col gap-2">
                            <span className="display text-5xl md:text-8xl tabular-nums">
                                <Counter to={m.n} suffix={m.s} />
                            </span>
                            <span className="label label-soft">{m.k}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
