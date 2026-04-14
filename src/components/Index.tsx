import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagnetic } from '../hooks/useMagnetic'

const ROTATING = ['shipped', 'undefined', 'obvious', 'built', 'lived-in']

export default function Index() {
    const rootRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const rotRef = useRef<HTMLSpanElement>(null)
    const ctaRef = useRef<HTMLAnchorElement>(null)
    const clockRef = useRef<HTMLSpanElement>(null)
    const [rotIdx, setRotIdx] = useState(0)

    useMagnetic(ctaRef, 0.25)

    // Rotating word
    useEffect(() => {
        const id = window.setInterval(() => setRotIdx(i => (i + 1) % ROTATING.length), 2600)
        return () => clearInterval(id)
    }, [])

    // animate rotator
    useLayoutEffect(() => {
        if (!rotRef.current) return
        const el = rotRef.current
        gsap.fromTo(
            el,
            { yPercent: 100, opacity: 0, filter: 'blur(8px)' },
            { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out' }
        )
    }, [rotIdx])

    // Intro + scroll anims
    useLayoutEffect(() => {
        if (!rootRef.current) return
        const ctx = gsap.context(() => {
            const lines = titleRef.current?.querySelectorAll('.reveal-line')
            if (lines) {
                gsap.set(lines, { yPercent: 110 })
                gsap.to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.2 })
            }
            const fades = rootRef.current?.querySelectorAll('[data-fade]')
            if (fades) {
                gsap.set(fades, { opacity: 0, y: 16 })
                gsap.to(fades, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.9 })
            }
            gsap.to(titleRef.current, {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
            })
        }, rootRef)

        const tick = () => {
            if (!clockRef.current) return
            const d = new Date()
            clockRef.current.textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
        }
        tick()
        const id = window.setInterval(tick, 1000)

        return () => { ctx.revert(); ScrollTrigger.refresh(); clearInterval(id) }
    }, [])

    return (
        <section ref={rootRef} id="index" className="relative min-h-[100svh] w-full bg-paper text-ink overflow-hidden flex flex-col">
            <div aria-hidden className="grain" />

            {/* Top thin rail */}
            <div className="relative z-10 pad-x pt-8 md:pt-10">
                <div data-fade className="flex items-center justify-between hair-b pb-4">
                    <span className="label label-soft">Undefined Studio — est. 2024</span>
                    <span className="hidden md:inline label label-soft">Paris · Toulouse</span>
                    <span ref={clockRef} className="label tabular-nums">00:00:00</span>
                </div>
            </div>

            {/* Main title area */}
            <div className="relative z-10 flex-1 pad-x flex flex-col justify-center">
                <h1
                    ref={titleRef}
                    className="display text-[18vw] md:text-[11vw] leading-[0.86] tracking-[-0.055em]"
                >
                    <span className="reveal-mask">
                        <span className="reveal-line">
                            A studio for{' '}
                            <span className="relative inline-block align-baseline" style={{ minWidth: '4ch' }}>
                                <span
                                    ref={rotRef}
                                    key={rotIdx}
                                    className="serif-italic text-tomato inline-block"
                                >
                                    {ROTATING[rotIdx]}
                                </span>
                            </span>
                        </span>
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line">mobile products.</span>
                    </span>
                </h1>
            </div>

            {/* Bottom rail */}
            <div className="relative z-10 pad-x pb-10 md:pb-14 grid grid-cols-12 items-end gap-y-8">
                <div data-fade className="col-span-12 md:col-span-4 flex flex-col gap-2">
                    <span className="label label-soft">(01) What</span>
                    <p className="font-body text-[15px] md:text-base leading-[1.5] text-ink-soft max-w-[34ch]">
                        Three people designing & shipping apps from first sketch to the store.
                    </p>
                </div>
                <div data-fade className="hidden md:flex col-span-4 justify-center">
                    <a href="#now" className="flex items-center gap-3 group">
                        <span className="w-10 h-10 rounded-full border border-hair flex items-center justify-center group-hover:border-ink transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" className="text-ink">
                                <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <span className="label">scroll to begin</span>
                    </a>
                </div>
                <div data-fade className="col-span-12 md:col-span-4 flex flex-col gap-3 md:items-end">
                    <span className="label label-soft">(02) Want</span>
                    <a
                        ref={ctaRef}
                        href="#signal"
                        data-cursor="cta"
                        data-cursor-label="send"
                        className="btn"
                    >
                        Start a brief
                        <span className="dot">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    </a>
                </div>
            </div>
        </section>
    )
}
