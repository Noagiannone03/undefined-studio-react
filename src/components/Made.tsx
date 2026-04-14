import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import vagoInterface from '../assets/images/vago-illustrations/interface-open.jpeg'
import vagoRoad from '../assets/images/vago-illustrations/road.jpg'
import vagoStreak from '../assets/images/vago-illustrations/streak.jpeg'
import whispHome from '../assets/images/whisp/homescreen.png'
import whispMap from '../assets/images/whisp/map.jpeg'
import whispDiscussion from '../assets/images/whisp/discussion.png'

type Entry = {
    n: string
    name: string
    year: string
    tag: string
    role: string
    image: string
    accent: '#E84A2A' | '#1D1DBF' | '#0E0E0C'
}

const ENTRIES: Entry[] = [
    { n: '01', name: 'Vago',       year: '2025', tag: 'mobile · game',       role: 'design + code',        image: vagoInterface, accent: '#1D1DBF' },
    { n: '02', name: 'Whisp',      year: '2026', tag: 'mobile · social',      role: 'design + code',        image: whispHome,     accent: '#E84A2A' },
    { n: '03', name: 'Route 66',   year: '2024', tag: 'identity · editorial', role: 'art direction',        image: vagoRoad,      accent: '#0E0E0C' },
    { n: '04', name: 'Sundial',    year: '2024', tag: 'web · tool',            role: 'design system',        image: whispMap,      accent: '#E84A2A' },
    { n: '05', name: 'Pal',        year: '2023', tag: 'mobile · concept',      role: 'prototype',             image: vagoStreak,    accent: '#1D1DBF' },
    { n: '06', name: 'Signal',     year: '2023', tag: 'brand · motion',        role: 'identity & motion',     image: whispDiscussion, accent: '#0E0E0C' },
]

export default function Made() {
    const rootRef = useRef<HTMLElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState<string | null>(null)

    useLayoutEffect(() => {
        if (!rootRef.current) return
        const ctx = gsap.context(() => {
            // Heading reveal
            const heading = rootRef.current?.querySelector('[data-heading]')
            if (heading) {
                const parts = heading.querySelectorAll('.reveal-line')
                gsap.set(parts, { yPercent: 110 })
                gsap.to(parts, {
                    yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
                    scrollTrigger: { trigger: heading, start: 'top 80%' },
                })
            }

            // Rows reveal
            const rows = rootRef.current?.querySelectorAll('[data-row]')
            if (rows) {
                gsap.fromTo(
                    rows,
                    { y: 30, opacity: 0 },
                    {
                        y: 0, opacity: 1,
                        duration: 0.8, ease: 'expo.out', stagger: 0.06,
                        scrollTrigger: { trigger: rows[0], start: 'top 85%' },
                    }
                )
            }
        }, rootRef)

        // Image-follow-cursor
        const stage = stageRef.current
        const list = listRef.current
        if (!stage || !list) return ctx.revert

        let tx = 0, ty = 0
        let rx = 0, ry = 0
        let raf = 0
        const onMove = (e: MouseEvent) => {
            tx = e.clientX
            ty = e.clientY
        }
        const tick = () => {
            rx += (tx - rx) * 0.16
            ry += (ty - ry) * 0.16
            if (stage) {
                stage.style.transform = `translate(${rx - 180}px, ${ry - 230}px)`
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        window.addEventListener('mousemove', onMove)
        return () => {
            window.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(raf)
            ctx.revert()
            ScrollTrigger.refresh()
        }
    }, [])

    useLayoutEffect(() => {
        const stage = stageRef.current
        if (!stage) return
        gsap.to(stage, {
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1 : 0.92,
            duration: 0.45,
            ease: 'power3.out',
        })
    }, [hovered])

    return (
        <section ref={rootRef} id="made" className="relative bg-paper text-ink overflow-hidden">
            {/* Image-follow-cursor stage */}
            <div ref={stageRef} className="made-image-stage hidden md:block">
                {ENTRIES.map((e) => (
                    <div
                        key={e.n}
                        className={`made-image ${hovered === e.n ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${e.image})` }}
                    />
                ))}
            </div>

            {/* head */}
            <div className="pad-x pt-32 md:pt-44 pb-10 md:pb-14">
                <div className="flex items-baseline justify-between mb-8">
                    <span className="label">(iii) Made — archive, 2023 → 2026</span>
                    <span className="label label-soft hidden md:inline">{ENTRIES.length} entries</span>
                </div>

                <h2 data-heading className="display text-[14vw] md:text-[8.5vw] leading-[0.88] tracking-[-0.045em]">
                    <span className="reveal-mask"><span className="reveal-line">Things we</span></span>
                    <span className="reveal-mask"><span className="reveal-line serif-italic">have shipped.</span></span>
                </h2>
            </div>

            {/* list */}
            <div ref={listRef} className="pad-x pb-20 md:pb-32">
                <div className="hair-t">
                    <div className="hidden md:grid grid-cols-12 items-baseline gap-y-2 py-4 hair-b">
                        <span className="col-span-1 label label-soft">№</span>
                        <span className="col-span-4 label label-soft">Project</span>
                        <span className="col-span-3 label label-soft">Type</span>
                        <span className="col-span-3 label label-soft">Role</span>
                        <span className="col-span-1 label label-soft text-right">Year</span>
                    </div>

                    {ENTRIES.map((e) => (
                        <a
                            key={e.n}
                            data-row
                            href="#"
                            onMouseEnter={() => setHovered(e.n)}
                            onMouseLeave={() => setHovered(null)}
                            className="group relative block hair-b overflow-hidden"
                        >
                            {/* accent wash */}
                            <span
                                aria-hidden
                                className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.22,1)]"
                                style={{ background: e.accent }}
                            />
                            <div className="relative grid grid-cols-12 items-baseline gap-y-3 py-7 md:py-8 transition-colors duration-500 group-hover:text-paper">
                                <span className="col-span-2 md:col-span-1 label label-soft group-hover:text-paper/70 transition-colors">{e.n}</span>
                                <span className="col-span-10 md:col-span-4 display text-3xl md:text-6xl leading-[0.95] tracking-[-0.035em]">
                                    <span className="inline-block group-hover:translate-x-2 transition-transform duration-500 ease-out">
                                        {e.name}
                                    </span>
                                </span>
                                <span className="col-span-6 md:col-span-3 serif-italic text-lg md:text-2xl text-ink-soft group-hover:text-paper transition-colors">
                                    {e.tag}
                                </span>
                                <span className="col-span-6 md:col-span-3 font-mono text-sm md:text-base group-hover:text-paper transition-colors">
                                    {e.role}
                                </span>
                                <span className="col-span-12 md:col-span-1 label md:text-right tabular-nums group-hover:text-paper/80 transition-colors">
                                    {e.year}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* footer */}
                <div className="flex items-center justify-between pt-8">
                    <span className="label label-soft">Showing {ENTRIES.length} of {ENTRIES.length}</span>
                    <a href="#signal" className="label u-draw-like hover:text-tomato transition-colors">
                        → case requests welcome
                    </a>
                </div>
            </div>
        </section>
    )
}
