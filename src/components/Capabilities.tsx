import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Cap = {
    n: string
    title: string
    sub: string
    keyword: string
    accent: '#E84A2A' | '#1D1DBF' | '#0E0E0C'
}

const CAPS: Cap[] = [
    { n: '01', title: 'Product Design', sub: 'Shape, sketch, ship.', keyword: 'design', accent: '#E84A2A' },
    { n: '02', title: 'Mobile Engineering', sub: 'Native-feeling, cross-platform.', keyword: 'code', accent: '#1D1DBF' },
    { n: '03', title: 'Motion & Interaction', sub: 'The feel before the feature.', keyword: 'motion', accent: '#E84A2A' },
    { n: '04', title: 'Brand & Strategy', sub: 'Name it, position it, defend it.', keyword: 'voice', accent: '#1D1DBF' },
]

function Row({ cap, last }: { cap: Cap; last: boolean }) {
    const ref = useRef<HTMLDivElement>(null)
    const keywordRef = useRef<HTMLSpanElement>(null)
    const numberRef = useRef<HTMLSpanElement>(null)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const onEnter = () => {
            gsap.to(keywordRef.current, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
            gsap.to(numberRef.current, { color: cap.accent, duration: 0.4 })
        }
        const onLeave = () => {
            gsap.to(keywordRef.current, { xPercent: 20, opacity: 0, duration: 0.6, ease: 'power3.in' })
            gsap.to(numberRef.current, { color: 'rgba(14,14,12,0.5)', duration: 0.4 })
        }
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
        return () => {
            el.removeEventListener('mouseenter', onEnter)
            el.removeEventListener('mouseleave', onLeave)
        }
    }, [cap.accent])

    return (
        <div
            ref={ref}
            data-row
            className={`group relative grid grid-cols-12 items-baseline gap-y-3 py-8 md:py-14 ${last ? '' : 'hair-b'} overflow-hidden cursor-pointer`}
        >
            {/* background giant keyword — hidden initially, slides in */}
            <span
                ref={keywordRef}
                aria-hidden
                className="absolute inset-0 flex items-center justify-end pr-6 md:pr-16 pointer-events-none opacity-0 whitespace-nowrap"
                style={{ willChange: 'transform, opacity', transform: 'translate(20%, 0)' }}
            >
                <span className="serif-italic text-[16vw] md:text-[10vw] leading-none" style={{ color: cap.accent }}>
                    {cap.keyword}
                </span>
            </span>

            <span
                ref={numberRef}
                className="relative col-span-2 md:col-span-1 label self-start pt-3"
                style={{ color: 'rgba(14,14,12,0.5)' }}
            >
                {cap.n}
            </span>
            <h3 className="relative col-span-10 md:col-span-7 display text-4xl md:text-7xl leading-[0.92] tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                {cap.title}
            </h3>
            <p className="relative col-span-12 md:col-span-4 serif-italic text-xl md:text-2xl leading-[1.25] md:text-right text-ink-soft group-hover:text-ink transition-colors">
                {cap.sub}
            </p>
        </div>
    )
}

export default function Capabilities() {
    const ref = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const rows = ref.current?.querySelectorAll('[data-row]')
            if (rows) {
                gsap.fromTo(
                    rows,
                    { yPercent: 40, opacity: 0 },
                    {
                        yPercent: 0, opacity: 1,
                        duration: 0.9, ease: 'expo.out', stagger: 0.1,
                        scrollTrigger: { trigger: rows[0], start: 'top 82%' },
                    }
                )
            }
            const lines = titleRef.current?.querySelectorAll('.reveal-line')
            if (lines) {
                gsap.fromTo(lines, { yPercent: 110 }, {
                    yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
                    scrollTrigger: { trigger: titleRef.current, start: 'top 80%' },
                })
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section ref={ref} id="services" className="relative bg-paper text-ink">
            <div className="container-x pt-32 md:pt-48 pb-10 md:pb-16 grid grid-cols-12 items-end gap-y-8">
                <div className="col-span-12 md:col-span-3">
                    <span className="label label-soft">Disciplines · 04</span>
                </div>
                <h2 ref={titleRef} className="col-span-12 md:col-span-9 display text-[14vw] md:text-[8vw] leading-[0.88] tracking-[-0.045em]">
                    <span className="reveal-mask"><span className="reveal-line">Four muscles,</span></span>
                    <span className="reveal-mask"><span className="reveal-line serif-italic">one voice.</span></span>
                </h2>
            </div>

            <div className="container-x pb-32 md:pb-48">
                <div className="hair-t hair-b">
                    {CAPS.map((c, i) => (
                        <Row key={c.n} cap={c} last={i === CAPS.length - 1} />
                    ))}
                </div>
            </div>
        </section>
    )
}
