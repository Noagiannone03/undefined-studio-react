import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from '@phosphor-icons/react'

type Prompt = {
    text: string
    tag: string
    output: { label: string; meta: string }[]
}

const PROMPTS: Prompt[] = [
    {
        text: 'a mobile app that doesn\'t feel like one',
        tag: 'PRODUCT',
        output: [
            { label: 'Vago — driving game loop', meta: 'Mobile · 2025' },
            { label: 'Whisp — real-time social', meta: 'Mobile · 2026' },
            { label: 'Motion & micro-interactions', meta: 'Craft' },
        ],
    },
    {
        text: 'a brand that actually means something',
        tag: 'IDENTITY',
        output: [
            { label: 'Naming & positioning', meta: 'Strategy' },
            { label: 'Visual identity system', meta: 'Design' },
            { label: 'Voice, tone & manifesto', meta: 'Writing' },
        ],
    },
    {
        text: 'a six-week sprint from idea to ship',
        tag: 'SPRINT',
        output: [
            { label: 'Week 1 — shape & sketch', meta: 'Discovery' },
            { label: 'Week 2→5 — build loop', meta: 'Production' },
            { label: 'Week 6 — store & launch', meta: 'Ship' },
        ],
    },
    {
        text: 'a design system that scales',
        tag: 'SYSTEM',
        output: [
            { label: 'Tokens, grids, typography', meta: 'Foundation' },
            { label: 'Component library', meta: 'Kit' },
            { label: 'Docs & guidelines', meta: 'Ops' },
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
                    timer = window.setTimeout(step, 2100)
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
    const screenRef = useRef<HTMLDivElement>(null)
    const outRef = useRef<HTMLDivElement>(null)

    const typed = useTyping(PROMPTS.map(p => p.text), setIdx)
    const prompt = PROMPTS[idx]

    useLayoutEffect(() => {
        if (!sectionRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(
                screenRef.current,
                { y: 80, opacity: 0, scale: 0.94 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 1.1,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: screenRef.current, start: 'top 80%' },
                }
            )
        }, sectionRef)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    useLayoutEffect(() => {
        if (!outRef.current) return
        const rows = outRef.current.querySelectorAll('[data-row]')
        gsap.fromTo(
            rows,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power3.out' }
        )
    }, [idx])

    return (
        <section
            ref={sectionRef}
            id="ask"
            className="relative frame-terminal overflow-hidden"
            style={{ background: '#0A0C08' }}
        >
            {/* scanlines + crt */}
            <div aria-hidden className="absolute inset-0 scanlines pointer-events-none" />
            <div aria-hidden className="noise" />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)' }}
            />

            {/* header */}
            <div className="relative container-x pt-14 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#7CFF8E] pulse-dot" />
                        <span className="label text-[#7CFF8E]/80">§ 04 · Terminal</span>
                    </div>
                    <span className="font-mono text-xs text-[#7CFF8E]/60">undefined.sh — v2.4.0</span>
                    <span className="label text-[#7CFF8E]/50">↵ to send</span>
                </div>
            </div>

            {/* Title */}
            <div className="relative container-x pb-10">
                <h2 className="display text-[12vw] md:text-[7vw] leading-[0.9] tracking-[-0.045em] text-[#7CFF8E] crt-flicker">
                    <span className="text-outline-thick">Tell us</span>{' '}
                    <span className="serif-italic" style={{ color: '#D8FF3E' }}>in one line</span>.
                </h2>
                <p className="mt-6 font-mono text-sm md:text-base text-[#7CFF8E]/70 max-w-[60ch]">
                    {'>'} This is our brief channel. Type anything — a sentence, a fragment, a verb. A human reads it. A human replies in under 24h.
                </p>
            </div>

            {/* Terminal window */}
            <div className="relative container-x pb-20 md:pb-28">
                <div
                    ref={screenRef}
                    className="relative mx-auto w-full max-w-[1000px] border border-[#7CFF8E]/40 shadow-[0_0_60px_rgba(124,255,142,0.15)]"
                    style={{ background: 'linear-gradient(180deg, rgba(10,12,8,0.95) 0%, rgba(10,12,8,1) 100%)' }}
                >
                    {/* titlebar */}
                    <div className="flex items-center justify-between px-4 h-9 border-b border-[#7CFF8E]/30">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E84A2A]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D8FF3E]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7CFF8E]" />
                        </div>
                        <span className="font-mono text-xs text-[#7CFF8E]/60">~ / undefined / brief.sh</span>
                        <span className="font-mono text-[10px] text-[#7CFF8E]/50 tracking-widest">SESSION 01</span>
                    </div>

                    {/* prompt */}
                    <div className="px-5 md:px-7 py-5 font-mono text-sm text-[#7CFF8E]/70 flex flex-col gap-1">
                        <div className="flex items-start gap-3">
                            <span className="text-[#D8FF3E]">user@studio:~$</span>
                            <span>whoami</span>
                        </div>
                        <div className="text-[#7CFF8E]/60 pl-[10ch]">→ an independent product studio. three hands. six weeks. zero deck-ware.</div>
                        <div className="flex items-start gap-3 mt-2">
                            <span className="text-[#D8FF3E]">user@studio:~$</span>
                            <span>brief --listen</span>
                        </div>
                    </div>

                    {/* typing line */}
                    <div className="px-5 md:px-7 py-6 md:py-8 border-y border-[#7CFF8E]/30 flex items-center gap-3">
                        <span className="font-mono text-[#D8FF3E]">&gt;</span>
                        <div className="flex-1 min-w-0 display text-2xl md:text-4xl tracking-[-0.02em] leading-none truncate text-[#7CFF8E]">
                            <span>{typed}</span>
                            <span className="inline-block w-[0.08em] h-[0.9em] align-middle bg-[#7CFF8E] ml-[0.08em] blink" />
                        </div>
                        <span className="hidden md:inline font-mono text-[10px] text-[#7CFF8E]/50 tabular-nums">
                            {typed.length.toString().padStart(3, '0')}c
                        </span>
                    </div>

                    {/* interpretation */}
                    <div className="flex items-center justify-between px-5 md:px-7 py-3 border-b border-[#7CFF8E]/30 bg-[#7CFF8E]/5">
                        <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="text-[#7CFF8E]/60">// parsed as</span>
                            <span className="px-2 py-0.5 border border-[#D8FF3E] text-[#D8FF3E] tracking-widest">{prompt.tag}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#7CFF8E]/50 tabular-nums">
                            {String(idx + 1).padStart(2, '0')} / {String(PROMPTS.length).padStart(2, '0')}
                        </span>
                    </div>

                    {/* output */}
                    <div ref={outRef} key={idx}>
                        {prompt.output.map((r, i) => (
                            <a
                                key={r.label}
                                data-row
                                href="#contact"
                                className="group flex items-center justify-between gap-4 px-5 md:px-7 py-4 md:py-5 border-b border-[#7CFF8E]/20 hover:bg-[#7CFF8E]/10 transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <span className="font-mono text-xs text-[#D8FF3E]/80">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="font-mono text-sm md:text-base text-[#7CFF8E] truncate">
                                        <span className="text-[#7CFF8E]/50">./</span>{r.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="hidden md:inline font-mono text-xs text-[#7CFF8E]/50">[{r.meta}]</span>
                                    <span className="w-8 h-8 border border-[#7CFF8E]/50 flex items-center justify-center group-hover:rotate-45 group-hover:border-[#D8FF3E] transition-all">
                                        <ArrowUpRight size={12} weight="bold" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* footer status */}
                    <div className="flex items-center justify-between px-5 md:px-7 h-10 font-mono text-xs text-[#7CFF8E]/60">
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="pulse-dot" /> listening
                            </span>
                            <span className="hidden md:inline">· human replies · &lt; 24h</span>
                        </div>
                        <span>
                            ready.
                        </span>
                    </div>
                </div>

                {/* suggestion chips */}
                <div className="mt-10 flex flex-wrap gap-2 justify-center max-w-[1000px] mx-auto">
                    {PROMPTS.map((p, i) => (
                        <button
                            key={p.tag}
                            onClick={() => setIdx(i)}
                            className={`badge transition-all font-mono ${
                                i === idx ? 'bg-[#7CFF8E] text-[#0A0C08]' : 'text-[#7CFF8E]/80 hover:text-[#D8FF3E]'
                            }`}
                            style={{ borderColor: 'currentColor' }}
                        >
                            {p.tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}
