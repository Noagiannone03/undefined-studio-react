import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSplitChars } from '../hooks/useSplitChars'

type Step = {
    n: string
    label: string
    title: string
    body: string
    bg: string
    fg: string
    accent: string
}

const STEPS: Step[] = [
    {
        n: '01', label: 'Week 1',
        title: 'Sketch.',
        body: 'Three people, one whiteboard. We compress the idea into a shape we can ship.',
        bg: '#EFEBDD', fg: '#0E0E0C', accent: '#E84A2A',
    },
    {
        n: '02', label: 'Week 2—3',
        title: 'Design.',
        body: 'High-fidelity screens, motion studies, a brand that can hold weight on the store.',
        bg: '#1D1DBF', fg: '#EFEBDD', accent: '#FFC93C',
    },
    {
        n: '03', label: 'Week 4—5',
        title: 'Build.',
        body: 'Native-feeling, cross-platform. Daily builds, weekly demos, nothing hidden.',
        bg: '#E84A2A', fg: '#0E0E0C', accent: '#1D1DBF',
    },
    {
        n: '04', label: 'Week 6',
        title: 'Ship.',
        body: 'TestFlight, App Store, launch note. The app lives where users live.',
        bg: '#0E0E0C', fg: '#EFEBDD', accent: '#E84A2A',
    },
]

export default function Horizontal() {
    const ref = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const headingRef = useRef<HTMLHeadingElement>(null)

    useSplitChars(headingRef)

    useLayoutEffect(() => {
        if (!ref.current || !trackRef.current) return
        const ctx = gsap.context(() => {
            // Kicker heading reveal
            const kickerChars = headingRef.current?.querySelectorAll<HTMLElement>('.c')
            if (kickerChars && kickerChars.length) {
                gsap.set(kickerChars, { yPercent: 110, filter: 'blur(12px)', opacity: 0 })
                gsap.to(kickerChars, {
                    yPercent: 0, filter: 'blur(0px)', opacity: 1,
                    duration: 1.1, ease: 'expo.out', stagger: 0.02,
                    scrollTrigger: { trigger: headingRef.current, start: 'top 80%' },
                })
            }

            const track = trackRef.current!
            const panels = track.querySelectorAll<HTMLElement>('[data-panel]')
            if (!panels.length) return

            const getTotal = () => track.scrollWidth - window.innerWidth

            const tween = gsap.to(track, {
                x: () => -getTotal(),
                ease: 'none',
                scrollTrigger: {
                    trigger: ref.current!,
                    start: 'top top',
                    end: () => `+=${getTotal()}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            })

            // Per-panel letter animations
            panels.forEach((panel) => {
                const titleChars = panel.querySelectorAll<HTMLElement>('[data-panel-title] .c')
                const bigNum = panel.querySelector<HTMLElement>('[data-panel-num]')
                const body = panel.querySelector<HTMLElement>('[data-panel-body]')
                const meta = panel.querySelector<HTMLElement>('[data-panel-meta]')

                if (titleChars.length) {
                    // Each letter enters with a different dance: rise, rotate, scaleY
                    gsap.fromTo(titleChars,
                        {
                            yPercent: 120,
                            scaleY: 0.4,
                            opacity: 0,
                            rotate: (i) => (i % 2 === 0 ? -8 : 8),
                        },
                        {
                            yPercent: 0,
                            scaleY: 1,
                            opacity: 1,
                            rotate: 0,
                            ease: 'expo.out',
                            stagger: 0.04,
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left 85%',
                                end: 'left 30%',
                                scrub: 1,
                            },
                        }
                    )

                    // Exit: letters stretch up + fade as panel leaves
                    gsap.to(titleChars, {
                        yPercent: -40,
                        scaleY: 1.6,
                        opacity: 0,
                        ease: 'power2.in',
                        stagger: 0.02,
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: tween,
                            start: 'right 60%',
                            end: 'right 10%',
                            scrub: 1,
                        },
                    })
                }

                if (bigNum) {
                    gsap.fromTo(bigNum,
                        { xPercent: 40, opacity: 0, scale: 0.8 },
                        {
                            xPercent: 0, opacity: 0.12, scale: 1,
                            ease: 'expo.out',
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left right',
                                end: 'left 40%',
                                scrub: 1,
                            },
                        }
                    )
                }

                if (body) {
                    gsap.fromTo(body,
                        { y: 30, opacity: 0 },
                        {
                            y: 0, opacity: 1, ease: 'expo.out',
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left 70%',
                                end: 'left 30%',
                                scrub: 1,
                            },
                        }
                    )
                }

                if (meta) {
                    gsap.fromTo(meta,
                        { y: 20, opacity: 0 },
                        {
                            y: 0, opacity: 1, ease: 'expo.out',
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left 80%',
                                end: 'left 45%',
                                scrub: 1,
                            },
                        }
                    )
                }
            })

            // Split the step titles (runs once panels are mounted — must call after render)
            panels.forEach(panel => {
                const title = panel.querySelector<HTMLElement>('[data-panel-title]')
                if (!title || title.dataset.splitDone === '1') return
                const text = title.textContent ?? ''
                title.innerHTML = ''
                for (const ch of text) {
                    if (ch === ' ') {
                        title.appendChild(document.createTextNode('\u00A0'))
                        continue
                    }
                    const line = document.createElement('span')
                    line.className = 'c-line'
                    const inner = document.createElement('span')
                    inner.className = 'c'
                    inner.textContent = ch
                    line.appendChild(inner)
                    title.appendChild(line)
                }
                title.dataset.splitDone = '1'
            })
        }, ref)

        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section ref={ref} id="process" className="relative surface-paper overflow-hidden">
            <div aria-hidden className="grain" />

            {/* Kicker */}
            <div className="relative z-10 container-x pt-24 md:pt-36 pb-12 md:pb-16 grid grid-cols-12 items-end gap-y-6">
                <div className="col-span-12 md:col-span-3">
                    <span className="label label-soft">Process · six weeks</span>
                </div>
                <h2
                    ref={headingRef}
                    className="col-span-12 md:col-span-9 display text-[12vw] md:text-[6.2vw] leading-[0.9] tracking-[-0.04em]"
                >
                    <span data-split className="block">From sketch</span>
                    <span data-split className="block serif-italic">to store.</span>
                </h2>
            </div>

            {/* Horizontal pinned track */}
            <div className="relative h-[100svh] overflow-hidden hair-t hair-b">
                <div
                    ref={trackRef}
                    className="absolute top-0 left-0 h-full flex items-stretch will-change-transform"
                >
                    {STEPS.map((s, idx) => (
                        <div
                            key={s.n}
                            data-panel
                            className="relative h-full w-screen flex-shrink-0 flex items-center"
                            style={{ background: s.bg, color: s.fg }}
                        >
                            <div aria-hidden className="grain" />

                            {/* Giant background step number — scroll-driven */}
                            <div
                                data-panel-num
                                aria-hidden
                                className="absolute -right-6 md:-right-16 bottom-0 pointer-events-none display leading-[0.72] tracking-[-0.08em] select-none"
                                style={{
                                    color: s.fg,
                                    fontSize: 'min(72vw, 88vh)',
                                    opacity: 0.12,
                                }}
                            >
                                {s.n}
                            </div>

                            {/* Center content */}
                            <div className="relative z-10 w-full container-x grid grid-cols-12 gap-y-10 items-center">
                                <div data-panel-meta className="col-span-12 md:col-span-3 flex flex-col gap-1">
                                    <span className="label" style={{ color: s.fg, opacity: 0.5 }}>Phase {s.n}</span>
                                    <span className="serif-italic text-2xl md:text-3xl" style={{ color: s.accent }}>
                                        {s.label}
                                    </span>
                                </div>

                                <h3
                                    data-panel-title
                                    className="col-span-12 md:col-span-6 display text-[28vw] md:text-[17vw] leading-[0.82] tracking-[-0.06em]"
                                    style={{ color: s.fg }}
                                >
                                    {s.title}
                                </h3>

                                <p
                                    data-panel-body
                                    className="col-span-12 md:col-span-3 serif-italic text-lg md:text-xl leading-[1.3] max-w-[32ch]"
                                    style={{ color: s.fg, opacity: 0.8 }}
                                >
                                    {s.body}
                                </p>
                            </div>

                            {/* Corner tag — neo-brutalist bracket */}
                            <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3 label" style={{ color: s.fg, opacity: 0.7 }}>
                                <span className="w-6 h-px" style={{ background: s.accent }} />
                                <span>{idx + 1} / {STEPS.length}</span>
                            </div>
                            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 label" style={{ color: s.accent }}>
                                ↓ scroll
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
