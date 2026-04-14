import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagnetic } from '../hooks/useMagnetic'

const CHANNELS = [
    { label: 'Email', value: 'hello@undefined.studio', href: 'mailto:hello@undefined.studio' },
    { label: 'Studio', value: 'Paris · Toulouse', href: '#' },
    { label: 'Social', value: '@undefined.studio', href: 'https://instagram.com' },
    { label: 'Press', value: 'press@undefined.studio', href: 'mailto:press@undefined.studio' },
]

const QUESTIONS = [
    'A new app from zero?',
    'A redesign of something live?',
    'A weekend prototype?',
    'A brand that needs a spine?',
]

export default function Signal() {
    const rootRef = useRef<HTMLElement>(null)
    const ctaRef = useRef<HTMLAnchorElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qIdx, setQIdx] = useState(0)

    useMagnetic(ctaRef, 0.28)

    // rotating question
    useEffect(() => {
        const id = window.setInterval(() => setQIdx(i => (i + 1) % QUESTIONS.length), 2800)
        return () => clearInterval(id)
    }, [])

    // sine-wave canvas that reacts to mouse
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let raf = 0
        let t = 0
        let mx = 0.5
        let my = 0.5
        const DPR = Math.min(window.devicePixelRatio || 1, 2)

        const resize = () => {
            const { clientWidth, clientHeight } = canvas
            canvas.width = clientWidth * DPR
            canvas.height = clientHeight * DPR
        }
        resize()
        window.addEventListener('resize', resize)

        const onMove = (e: MouseEvent) => {
            const r = canvas.getBoundingClientRect()
            mx = (e.clientX - r.left) / r.width
            my = (e.clientY - r.top) / r.height
        }
        window.addEventListener('mousemove', onMove)

        const render = () => {
            const w = canvas.width
            const h = canvas.height
            ctx.clearRect(0, 0, w, h)
            const lines = 14
            const amp = h * 0.18 * (0.6 + my * 0.8)
            const freq = 0.002 + mx * 0.004
            for (let i = 0; i < lines; i++) {
                const k = i / lines
                const yOffset = (h / lines) * i + h / lines / 2
                const phase = t * 0.002 + i * 0.35
                const falloff = 1 - Math.abs(k - 0.5) * 1.6
                ctx.beginPath()
                for (let x = 0; x <= w; x += 8 * DPR) {
                    const y =
                        yOffset +
                        Math.sin(x * freq + phase) * amp * falloff +
                        Math.sin(x * freq * 0.5 + phase * 1.3) * amp * 0.25
                    if (x === 0) ctx.moveTo(x, y)
                    else ctx.lineTo(x, y)
                }
                const alpha = 0.12 + falloff * 0.35
                ctx.strokeStyle = `rgba(239,235,221,${Math.max(0.05, alpha)})`
                ctx.lineWidth = 1 * DPR
                ctx.stroke()
            }
            t += 16
            raf = requestAnimationFrame(render)
        }
        raf = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMove)
        }
    }, [])

    // reveal
    useLayoutEffect(() => {
        if (!rootRef.current) return
        const ctx = gsap.context(() => {
            const heading = rootRef.current?.querySelector('[data-heading]')
            if (heading) {
                const parts = heading.querySelectorAll('.reveal-line')
                gsap.set(parts, { yPercent: 110 })
                gsap.to(parts, {
                    yPercent: 0,
                    duration: 1.3,
                    ease: 'expo.out',
                    stagger: 0.1,
                    scrollTrigger: { trigger: heading, start: 'top 80%' },
                })
            }
            const rows = rootRef.current?.querySelectorAll('[data-row]')
            if (rows) {
                gsap.fromTo(
                    rows,
                    { y: 24, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'expo.out',
                        stagger: 0.06,
                        scrollTrigger: { trigger: rows[0], start: 'top 85%' },
                    }
                )
            }
        }, rootRef)
        return () => {
            ctx.revert()
            ScrollTrigger.refresh()
        }
    }, [])

    return (
        <section
            ref={rootRef}
            id="signal"
            className="relative bg-ink text-paper overflow-hidden min-h-[100svh] flex flex-col"
        >
            {/* wave canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden
            />

            <div className="relative z-10 pad-x pt-28 md:pt-40">
                <div className="flex items-baseline justify-between mb-10">
                    <span className="label text-paper/70">(v) Signal — say hello</span>
                    <span className="label label-soft text-paper/50 hidden md:inline">
                        reply under 24h
                    </span>
                </div>

                <h2
                    data-heading
                    className="display text-[16vw] md:text-[10vw] leading-[0.86] tracking-[-0.055em]"
                >
                    <span className="reveal-mask"><span className="reveal-line">Tell us</span></span>
                    <span className="reveal-mask">
                        <span className="reveal-line">
                            about <span className="serif-italic text-tomato">the idea.</span>
                        </span>
                    </span>
                </h2>

                {/* rotating prompt */}
                <div className="mt-8 md:mt-12 h-10 md:h-14 overflow-hidden">
                    <div
                        style={{ transform: `translateY(-${qIdx * 100}%)`, transition: 'transform 700ms cubic-bezier(.76,0,.22,1)' }}
                    >
                        {QUESTIONS.map((q) => (
                            <div
                                key={q}
                                className="h-10 md:h-14 serif-italic text-2xl md:text-4xl text-paper/70 flex items-center"
                            >
                                {q}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 md:mt-14">
                    <a
                        ref={ctaRef}
                        href="mailto:hello@undefined.studio"
                        data-cursor="cta"
                        data-cursor-label="write"
                        className="btn"
                        style={{ background: 'var(--color-paper)', color: 'var(--color-ink)', borderColor: 'var(--color-paper)' }}
                    >
                        Start a brief
                        <span className="dot">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path
                                    d="M3 9L9 3M9 3H4.5M9 3V7.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </a>
                </div>
            </div>

            {/* Channels table */}
            <div className="relative z-10 pad-x mt-auto pb-10 md:pb-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-paper/15">
                    {CHANNELS.map((c, i) => (
                        <a
                            key={c.label}
                            data-row
                            href={c.href}
                            className={`group flex flex-col gap-3 py-8 md:py-10 px-0 md:px-6 border-b border-paper/15 ${
                                i !== 0 ? 'md:border-l md:border-paper/15' : ''
                            } hover:bg-paper/5 transition-colors`}
                        >
                            <span className="label text-paper/50">{c.label}</span>
                            <span className="font-body text-lg md:text-xl group-hover:text-tomato transition-colors">
                                {c.value}
                            </span>
                        </a>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-8 md:pt-10 text-paper/60">
                    <span className="label">© Undefined Studio · 2026</span>
                    <span className="label hidden md:inline">Made carefully, shipped on time.</span>
                    <a href="#index" className="label hover:text-paper transition-colors">↑ Back to index</a>
                </div>
            </div>
        </section>
    )
}
