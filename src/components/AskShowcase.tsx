import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MagnifyingGlass, ArrowUpRight, Sparkle, Command } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Asterisk from './Asterisk'

type Prompt = {
    text: string
    tag: string
    results: { n: string; label: string; meta: string; accent: 'tomato' | 'klein' | 'ink' }[]
}

const PROMPTS: Prompt[] = [
    {
        text: 'a mobile app that doesn\'t feel like one',
        tag: 'Product',
        results: [
            { n: '01', label: 'Vago — Driving game loop', meta: 'Mobile · 2025', accent: 'tomato' },
            { n: '02', label: 'Whisp — Real-time social', meta: 'Mobile · 2026', accent: 'klein' },
            { n: '03', label: 'Motion & micro-interactions', meta: 'Craft', accent: 'ink' },
        ],
    },
    {
        text: 'a brand that actually means something',
        tag: 'Identity',
        results: [
            { n: '01', label: 'Naming & positioning', meta: 'Strategy', accent: 'klein' },
            { n: '02', label: 'Visual identity system', meta: 'Design', accent: 'tomato' },
            { n: '03', label: 'Voice, tone & manifesto', meta: 'Writing', accent: 'ink' },
        ],
    },
    {
        text: 'a six-week sprint from idea to ship',
        tag: 'Sprint',
        results: [
            { n: '01', label: 'Week 1 — Shape & sketch', meta: 'Discovery', accent: 'ink' },
            { n: '02', label: 'Week 2→5 — Build loop', meta: 'Production', accent: 'klein' },
            { n: '03', label: 'Week 6 — Store & launch', meta: 'Ship', accent: 'tomato' },
        ],
    },
    {
        text: 'a design system that scales',
        tag: 'System',
        results: [
            { n: '01', label: 'Tokens, grids, typography', meta: 'Foundation', accent: 'ink' },
            { n: '02', label: 'Reusable component library', meta: 'Kit', accent: 'klein' },
            { n: '03', label: 'Docs & guidelines', meta: 'Ops', accent: 'tomato' },
        ],
    },
]

function useTyping(phrases: string[], onCycle: (i: number) => void) {
    const [display, setDisplay] = useState('')
    const idxRef = useRef(0)
    const charRef = useRef(0)
    const phaseRef = useRef<'typing' | 'holding' | 'deleting'>('typing')

    useEffect(() => {
        let timer: number
        const step = () => {
            const current = phrases[idxRef.current]
            if (phaseRef.current === 'typing') {
                charRef.current += 1
                setDisplay(current.slice(0, charRef.current))
                if (charRef.current >= current.length) {
                    phaseRef.current = 'holding'
                    timer = window.setTimeout(step, 1900)
                    return
                }
                timer = window.setTimeout(step, 38 + Math.random() * 42)
            } else if (phaseRef.current === 'holding') {
                phaseRef.current = 'deleting'
                timer = window.setTimeout(step, 120)
            } else {
                charRef.current -= 1
                setDisplay(current.slice(0, Math.max(charRef.current, 0)))
                if (charRef.current <= 0) {
                    idxRef.current = (idxRef.current + 1) % phrases.length
                    onCycle(idxRef.current)
                    phaseRef.current = 'typing'
                    timer = window.setTimeout(step, 320)
                    return
                }
                timer = window.setTimeout(step, 18)
            }
        }
        timer = window.setTimeout(step, 600)
        return () => clearTimeout(timer)
    }, [phrases, onCycle])

    return display
}

export default function AskShowcase() {
    const [idx, setIdx] = useState(0)
    const sectionRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLDivElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)
    const bgAsteriskRef = useRef<HTMLDivElement>(null)
    const keyHintsRef = useRef<HTMLDivElement>(null)

    const typed = useTyping(PROMPTS.map(p => p.text), (i) => setIdx(i))
    const prompt = PROMPTS[idx]

    useLayoutEffect(() => {
        if (!sectionRef.current) return
        const ctx = gsap.context(() => {
            if (bgAsteriskRef.current) {
                gsap.to(bgAsteriskRef.current, {
                    rotate: 180,
                    yPercent: -20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2,
                    },
                })
            }
            gsap.fromTo(
                inputRef.current,
                { y: 80, opacity: 0, scale: 0.96 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 1.1,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: inputRef.current, start: 'top 82%' },
                }
            )
            const keyEls = keyHintsRef.current?.querySelectorAll('[data-key]')
            if (keyEls && keyEls.length) {
                gsap.fromTo(
                    keyEls,
                    { y: 40, opacity: 0, rotate: (i) => (i % 2 === 0 ? -8 : 8) },
                    {
                        y: 0, opacity: 1, rotate: (i) => (i % 2 === 0 ? -6 : 4),
                        duration: 0.9,
                        stagger: 0.08,
                        ease: 'back.out(1.6)',
                        scrollTrigger: { trigger: inputRef.current, start: 'top 75%' },
                    }
                )
                keyEls.forEach((k) => {
                    gsap.to(k, {
                        y: '+=10',
                        duration: 2 + Math.random() * 1.2,
                        yoyo: true,
                        repeat: -1,
                        ease: 'sine.inOut',
                        delay: Math.random(),
                    })
                })
            }
        }, sectionRef)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    // Results morph animation on idx change
    useLayoutEffect(() => {
        if (!resultsRef.current) return
        const rows = resultsRef.current.querySelectorAll('[data-result]')
        gsap.fromTo(
            rows,
            { y: 18, opacity: 0, filter: 'blur(6px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, stagger: 0.06, ease: 'power3.out' }
        )
    }, [idx])

    return (
        <section
            ref={sectionRef}
            id="ask"
            className="relative bg-paper text-ink border-t border-ink overflow-hidden"
        >
            {/* meta bar */}
            <div className="grid-12 items-baseline border-b border-ink h-11 container-x">
                <div className="col-span-6 md:col-span-4 label label-soft">§ 04 — Ask</div>
                <div className="hidden md:block col-span-4 text-center label label-soft">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="pulse-dot" /> Tell us in one line
                    </span>
                </div>
                <div className="col-span-6 md:col-span-4 label label-soft text-right">↵ to reply</div>
            </div>

            {/* background asterisk parallax */}
            <div
                ref={bgAsteriskRef}
                aria-hidden
                className="pointer-events-none absolute -right-[12vw] top-[8%] w-[55vw] md:w-[38vw] opacity-[0.06]"
            >
                <Asterisk className="w-full h-full" color="#0A0A0A" />
            </div>

            {/* hatched strip bg */}
            <div aria-hidden className="absolute inset-x-0 top-11 bottom-0 pointer-events-none opacity-[0.04] hatch-soft" />

            {/* Floating decorative keyboard keys */}
            <div ref={keyHintsRef} aria-hidden className="pointer-events-none absolute inset-0">
                <div data-key className="absolute left-[6%] top-[28%] hidden md:block">
                    <Key glyph="/" sub="focus" />
                </div>
                <div data-key className="absolute left-[4%] bottom-[22%] hidden md:block">
                    <Key glyph="⌘" sub="cmd" />
                </div>
                <div data-key className="absolute right-[7%] top-[22%] hidden md:block">
                    <Key glyph="↵" sub="send" />
                </div>
                <div data-key className="absolute right-[5%] bottom-[18%] hidden md:block">
                    <Key glyph="K" sub="key" />
                </div>
            </div>

            {/* Title */}
            <div className="relative container-x section-y">
                <div className="flex items-center gap-3 mb-6">
                    <Asterisk className="w-4 h-4 spin-slow text-klein" color="currentColor" />
                    <span className="label">Ask · N° 04</span>
                </div>

                <h2 className="display text-[13vw] md:text-[7.5vw] leading-[0.9] tracking-[-0.045em] max-w-[16ch] mb-14">
                    Describe it <span className="serif-italic text-tomato">in one line</span>.
                    We&apos;ll read it.
                </h2>

                {/* Fake search input */}
                <div
                    ref={inputRef}
                    className="relative mx-auto w-full max-w-[900px] bg-paper border border-ink shadow-[8px_8px_0_0_rgba(10,10,10,1)]"
                >
                    {/* tab bar */}
                    <div className="flex items-center justify-between border-b border-ink h-9 px-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-tomato" />
                            <span className="w-2.5 h-2.5 rounded-full bg-ink/25" />
                            <span className="w-2.5 h-2.5 rounded-full bg-ink/25" />
                        </div>
                        <span className="label label-soft hidden sm:inline">undefined.studio / brief</span>
                        <span className="inline-flex items-center gap-1 label label-soft">
                            <Sparkle size={10} weight="fill" /> live
                        </span>
                    </div>

                    {/* input row */}
                    <div className="flex items-center gap-4 px-5 md:px-7 py-6 md:py-8 border-b border-ink">
                        <MagnifyingGlass size={22} weight="bold" className="shrink-0" />
                        <div className="flex-1 min-w-0 display text-2xl md:text-4xl tracking-[-0.02em] leading-none truncate">
                            <span>{typed}</span>
                            <span className="inline-block w-[0.08em] h-[0.9em] align-middle bg-ink ml-[0.08em] blink" />
                        </div>
                        <span className="hidden md:inline-flex items-center gap-1 h-7 px-2 border border-ink rounded-full label tabular-nums text-[10px] shrink-0">
                            <Command size={10} weight="bold" /> K
                        </span>
                    </div>

                    {/* category tag */}
                    <div className="flex items-center justify-between px-5 md:px-7 py-3 border-b border-ink bg-paper-2">
                        <div className="flex items-center gap-2">
                            <span className="label label-soft">Interpreted as</span>
                            <span className="badge" style={{ borderColor: '#0A0A0A' }}>
                                {prompt.tag}
                            </span>
                        </div>
                        <span className="label label-soft tabular-nums">
                            {String(idx + 1).padStart(2, '0')} / {String(PROMPTS.length).padStart(2, '0')}
                        </span>
                    </div>

                    {/* results */}
                    <div ref={resultsRef} key={idx}>
                        {prompt.results.map((r) => (
                            <a
                                key={r.n + r.label}
                                href="#contact"
                                data-result
                                className="group flex items-center justify-between gap-4 px-5 md:px-7 py-4 md:py-5 border-b border-ink last:border-b-0 hover:bg-ink hover:text-paper transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <span
                                        className={`display text-lg md:text-xl shrink-0 ${
                                            r.accent === 'tomato'
                                                ? 'text-tomato group-hover:text-paper'
                                                : r.accent === 'klein'
                                                ? 'text-klein group-hover:text-paper'
                                                : 'text-ink/40 group-hover:text-paper'
                                        }`}
                                    >
                                        {r.n}
                                    </span>
                                    <span className="display text-lg md:text-2xl leading-tight truncate">
                                        {r.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="label hidden md:inline group-hover:text-paper/70">{r.meta}</span>
                                    <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover:rotate-45 transition-transform">
                                        <ArrowUpRight size={12} weight="bold" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* status footer */}
                    <div className="flex items-center justify-between px-5 md:px-7 h-10 border-t border-ink bg-paper-2">
                        <div className="flex items-center gap-4 label label-soft">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="pulse-dot" /> Reading
                            </span>
                            <span className="hidden md:inline">· one human replies · &lt; 24h</span>
                        </div>
                        <span className="label label-soft tabular-nums">{typed.length.toString().padStart(3, '0')}c</span>
                    </div>
                </div>

                {/* below search — small prompt suggestions */}
                <div className="mt-10 flex flex-wrap gap-2 justify-center max-w-[900px] mx-auto">
                    {PROMPTS.map((p, i) => (
                        <button
                            key={p.text}
                            onClick={() => setIdx(i)}
                            className={`badge transition-colors ${
                                i === idx ? 'bg-ink text-paper' : 'hover:bg-ink hover:text-paper'
                            }`}
                            style={{ borderColor: '#0A0A0A' }}
                        >
                            {p.tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Key({ glyph, sub }: { glyph: string; sub: string }) {
    return (
        <div className="inline-flex flex-col items-center gap-1">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-paper border border-ink shadow-[4px_4px_0_0_rgba(10,10,10,1)] flex items-center justify-center display text-2xl md:text-3xl">
                {glyph}
            </div>
            <span className="label label-soft">{sub}</span>
        </div>
    )
}
