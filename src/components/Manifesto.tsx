import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'We' },
    { text: 'build' },
    { text: 'small,', accent: 'tomato' },
    { text: 'sharp,' },
    { text: 'durable', accent: 'italic' },
    { text: 'things' },
    { text: '—' },
    { text: 'shipped' },
    { text: 'in' },
    { text: 'six', accent: 'klein' },
    { text: 'weeks.' },
]

export default function Manifesto() {
    const ref = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const words = ref.current?.querySelectorAll<HTMLSpanElement>('[data-word]')
            if (!words) return

            // Pin while coloring words
            gsap.to(words, {
                color: '#0E0E0C',
                ease: 'none',
                stagger: { each: 0.05 },
                scrollTrigger: {
                    trigger: stickyRef.current,
                    start: 'top top',
                    end: '+=120%',
                    scrub: 0.8,
                    pin: true,
                    anticipatePin: 1,
                },
            })

            // Accent words morph color mid-scroll
            words.forEach(w => {
                const accent = w.dataset.accent
                if (!accent) return
                gsap.to(w, {
                    color: accent === 'tomato' ? '#E84A2A' : accent === 'klein' ? '#1D1DBF' : '#0E0E0C',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: w,
                        start: 'top 50%',
                        end: 'top 30%',
                        scrub: true,
                        containerAnimation: undefined,
                    },
                })
            })

            // Reveal kicker row
            const kicker = ref.current?.querySelector('[data-kicker]')
            if (kicker) {
                gsap.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.9, ease: 'expo.out',
                        scrollTrigger: { trigger: kicker, start: 'top 85%' },
                    }
                )
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section ref={ref} id="manifesto" className="relative bg-paper text-ink">
            {/* Kicker */}
            <div data-kicker className="container-x pt-32 md:pt-48 pb-10 grid grid-cols-12 items-end gap-y-8">
                <div className="col-span-12 md:col-span-3">
                    <span className="label label-soft">Manifesto · 01</span>
                </div>
                <p className="col-span-12 md:col-span-9 serif-italic text-2xl md:text-3xl leading-[1.25] text-ink-soft max-w-[38ch]">
                    A short letter from the studio, in the fewest words possible —
                </p>
            </div>

            {/* Sticky phrase that colors in as you scroll */}
            <div ref={stickyRef} className="relative min-h-[100svh] flex items-center">
                <div className="container-x w-full">
                    <p className="display text-[10vw] md:text-[6.2vw] leading-[1.05] tracking-[-0.04em] max-w-[22ch]">
                        {WORDS.map((w, i) => {
                            const italic = w.accent === 'italic' || w.accent === 'tomato' || w.accent === 'klein'
                            return (
                                <span
                                    key={i}
                                    data-word
                                    data-accent={w.accent}
                                    className={`inline-block mr-[0.22em] ${italic ? 'serif-italic' : ''}`}
                                    style={{ color: 'rgba(14,14,12,0.14)' }}
                                >
                                    {w.text}
                                </span>
                            )
                        })}
                    </p>
                </div>
            </div>

            {/* Tail line */}
            <div className="container-x py-20 md:py-28 grid grid-cols-12 items-end gap-y-8">
                <div className="col-span-12 md:col-span-3" />
                <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                        <span className="h-px flex-1 bg-ink/20" />
                        <span className="label label-soft">three hands · zero deck-ware</span>
                        <span className="h-px flex-1 bg-ink/20" />
                    </div>
                </div>
            </div>
        </section>
    )
}
