import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Week = {
    n: string
    name: string
    tagline: string
    bullets: string[]
    accent: string
}

const WEEKS: Week[] = [
    {
        n: 'W1',
        name: 'Shape',
        tagline: 'Problem before product.',
        bullets: ['Stakeholder interviews', 'Jobs-to-be-done map', 'Competitive teardown', 'North-star sketch'],
        accent: '#1D1DBF',
    },
    {
        n: 'W2',
        name: 'Frame',
        tagline: 'Pick the strong shape.',
        bullets: ['Flow skeletons', 'Content model', 'First prototype', 'Architecture call'],
        accent: '#0E0E0C',
    },
    {
        n: 'W3',
        name: 'Build',
        tagline: 'Real screens, real data.',
        bullets: ['Core flows wired', 'API contracts', 'Component library', 'Daily builds'],
        accent: '#E84A2A',
    },
    {
        n: 'W4',
        name: 'Craft',
        tagline: 'The part others skip.',
        bullets: ['Motion passes', 'Haptics & sound', 'Empty states', 'Edge-case polish'],
        accent: '#1D1DBF',
    },
    {
        n: 'W5',
        name: 'Harden',
        tagline: 'Break it on purpose.',
        bullets: ['QA on device', 'Perf budget', 'Analytics wired', 'Beta with users'],
        accent: '#0E0E0C',
    },
    {
        n: 'W6',
        name: 'Ship',
        tagline: 'Release, watch, iterate.',
        bullets: ['Store submission', 'Launch assets', 'Day-1 telemetry', 'Handoff doc'],
        accent: '#E84A2A',
    },
]

export default function SixWeeks() {
    const rootRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!rootRef.current || !trackRef.current) return
        const ctx = gsap.context(() => {
            const track = trackRef.current!
            const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', track)
            const totalWidth = () => track.scrollWidth - window.innerWidth

            const tween = gsap.to(track, {
                x: () => `-${totalWidth()}px`,
                ease: 'none',
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => `+=${totalWidth()}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            })

            panels.forEach((panel) => {
                const title = panel.querySelector('[data-panel-title]')
                const lines = panel.querySelectorAll('[data-panel-line]')
                if (title) {
                    gsap.fromTo(
                        title,
                        { y: 80, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            ease: 'expo.out',
                            duration: 0.8,
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left 70%',
                            },
                        }
                    )
                }
                if (lines.length) {
                    gsap.fromTo(
                        lines,
                        { y: 20, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            ease: 'expo.out',
                            duration: 0.7,
                            stagger: 0.08,
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left 60%',
                            },
                        }
                    )
                }
            })

            const heading = rootRef.current?.querySelector('[data-heading]')
            if (heading) {
                const parts = heading.querySelectorAll('.reveal-line')
                gsap.set(parts, { yPercent: 110 })
                gsap.to(parts, {
                    yPercent: 0,
                    duration: 1.2,
                    ease: 'expo.out',
                    stagger: 0.1,
                    scrollTrigger: { trigger: heading, start: 'top 80%' },
                })
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
            id="six-weeks"
            className="relative bg-ink text-paper overflow-hidden"
        >
            {/* Header — sticky-ish, sits above the pin */}
            <div className="pad-x pt-32 md:pt-44 pb-10 md:pb-14">
                <div className="flex items-baseline justify-between mb-8">
                    <span className="label text-paper/70">(iv) Six Weeks — the process</span>
                    <span className="label label-soft text-paper/50 hidden md:inline">
                        scroll horizontally →
                    </span>
                </div>
                <h2
                    data-heading
                    className="display text-[14vw] md:text-[8.5vw] leading-[0.88] tracking-[-0.045em] max-w-[20ch]"
                >
                    <span className="reveal-mask"><span className="reveal-line">From first call</span></span>
                    <span className="reveal-mask"><span className="reveal-line">to <span className="serif-italic text-tomato">the store.</span></span></span>
                </h2>
            </div>

            {/* Horizontal track */}
            <div className="relative w-full overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex items-stretch will-change-transform"
                    style={{ width: 'max-content' }}
                >
                    {WEEKS.map((w, i) => (
                        <article
                            key={w.n}
                            data-panel
                            className="relative w-screen md:w-[82vw] h-[78vh] md:h-[82vh] shrink-0 flex items-end"
                        >
                            {/* vertical hair divider */}
                            {i !== 0 && (
                                <span
                                    aria-hidden
                                    className="absolute left-0 top-[8%] bottom-[8%] w-px bg-paper/15"
                                />
                            )}
                            <div className="relative w-full h-full pad-x py-12 md:py-16 flex flex-col justify-between">
                                {/* top */}
                                <div className="flex items-start justify-between">
                                    <span className="label text-paper/60">{w.n}</span>
                                    <span
                                        className="display text-[24vw] md:text-[14vw] leading-[0.82] tracking-[-0.055em] text-paper/5 select-none"
                                        aria-hidden
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* bottom */}
                                <div className="grid grid-cols-12 gap-y-6 md:gap-x-10 items-end">
                                    <div className="col-span-12 md:col-span-7">
                                        <h3
                                            data-panel-title
                                            className="display text-[16vw] md:text-[9vw] leading-[0.9] tracking-[-0.05em]"
                                        >
                                            {w.name}
                                            <span style={{ color: w.accent }} className="serif-italic">.</span>
                                        </h3>
                                        <p className="serif-italic text-2xl md:text-4xl mt-4 text-paper/80 max-w-[22ch]">
                                            {w.tagline}
                                        </p>
                                    </div>
                                    <ul className="col-span-12 md:col-span-5 flex flex-col gap-2 md:gap-3">
                                        {w.bullets.map((b, j) => (
                                            <li
                                                key={j}
                                                data-panel-line
                                                className="flex items-baseline gap-4 border-t border-paper/15 pt-3"
                                            >
                                                <span className="label text-paper/50 tabular-nums">
                                                    {String(j + 1).padStart(2, '0')}
                                                </span>
                                                <span className="font-body text-base md:text-lg text-paper/90">
                                                    {b}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Tail */}
            <div className="pad-x py-12 md:py-16 border-t border-paper/15 flex items-center justify-between">
                <span className="label text-paper/60">six weeks · one team · one app</span>
                <a
                    href="#signal"
                    className="label text-paper/90 hover:text-tomato transition-colors"
                >
                    → start the clock
                </a>
            </div>
        </section>
    )
}
