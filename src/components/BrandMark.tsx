import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SCROLL_VH = 260

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const bgRef = useRef<HTMLDivElement>(null)
    const chevronLRef = useRef<SVGSVGElement>(null)
    const chevronRRef = useRef<SVGSVGElement>(null)

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return

        const els: Els = {
            bg: bgRef.current,
            chevronL: chevronLRef.current,
            chevronR: chevronRRef.current,
        }

        renderFrame(0, els)

        const st = ScrollTrigger.create({
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => renderFrame(self.progress, els),
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())

        return () => st.kill()
    }, [])

    return (
        <section
            ref={wrapperRef}
            id="brand-mark"
            className="brand-mark"
            style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}
        >
            <div
                className="brand-mark-stage"
                style={{
                    position: 'sticky',
                    top: 0,
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                <div
                    ref={bgRef}
                    className="brand-mark-bg"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#0E0E0C',
                    }}
                />

                <div className="grain" style={{ opacity: 0.04, zIndex: 1 }} />

                <svg
                    ref={chevronLRef}
                    className="brand-mark-chevron brand-mark-chevron-left"
                    viewBox="0 0 24 28"
                    fill="none"
                    style={{
                        position: 'absolute',
                        top: '46%',
                        left: '50%',
                        width: 'clamp(152px, 18vw, 300px)',
                        transform: 'translate(-96%, -50%) translateX(-120px)',
                        opacity: 0,
                        overflow: 'visible',
                        zIndex: 5,
                    }}
                >
                    <path
                        d="M2 2L16 14L2 26"
                        stroke="#1D1DBF"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <svg
                    ref={chevronRRef}
                    className="brand-mark-chevron brand-mark-chevron-right"
                    viewBox="0 0 24 28"
                    fill="none"
                    style={{
                        position: 'absolute',
                        top: '46%',
                        left: '50%',
                        width: 'clamp(152px, 18vw, 300px)',
                        transform: 'translate(-10%, -50%) translateX(120px)',
                        opacity: 0,
                        overflow: 'visible',
                        zIndex: 5,
                    }}
                >
                    <path
                        d="M2 2L16 14L2 26"
                        stroke="#E84A2A"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </section>
    )
}

type Els = {
    bg: HTMLDivElement | null
    chevronL: SVGSVGElement | null
    chevronR: SVGSVGElement | null
}

function renderFrame(progress: number, els: Els) {
    const p = clamp(progress)
    const bg = easeOut2(remap(p, 0.56, 0.86))
    const exit = easeOut2(remap(p, 0.72, 0.95))
    const settle = easeOut3(remap(p, 0.18, 0.34))
    const calm = 1 - easeOut2(remap(p, 0.34, 0.48))

    if (els.bg) {
        const r = mix(14, 239, bg)
        const g = mix(14, 235, bg)
        const b = mix(12, 221, bg)
        els.bg.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    }

    const leftIn = easeOut4(remap(p, 0.02, 0.19))
    const rightIn = easeOut4(remap(p, 0.06, 0.23))
    setChevron(
        els.chevronL,
        'left',
        leftIn,
        exit,
        settle * calm,
        [29, 29, 191],
        [14, 14, 12]
    )
    setChevron(
        els.chevronR,
        'right',
        rightIn,
        exit,
        settle * calm,
        [232, 74, 42],
        [14, 14, 12]
    )
}

function setChevron(
    el: SVGSVGElement | null,
    side: 'left' | 'right',
    enter: number,
    exit: number,
    settle: number,
    from: [number, number, number],
    to: [number, number, number]
) {
    if (!el) return

    const xStart = side === 'left' ? -120 : 120
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const anchor = side === 'left'
        ? (isMobile ? '-88%' : '-96%')
        : (isMobile ? '-18%' : '-10%')
    const overshoot = side === 'left'
        ? (isMobile ? 8 : 12)
        : (isMobile ? -8 : -12)
    const x = enter < 1 ? mix(xStart, overshoot, enter) : overshoot * (1 - settle) * (1 - exit)
    const scale = 0.92 + enter * 0.1 + settle * 0.04 - exit * 0.16
    const opacity = Math.max(0, enter * (1 - exit * 0.84))
    const path = el.querySelector('path')
    const color = `rgba(${mix(from[0], to[0], exit)}, ${mix(from[1], to[1], exit)}, ${mix(from[2], to[2], exit)}, ${1 - exit * 0.82})`

    el.style.opacity = String(opacity)
    el.style.transform = `translate(${anchor}, -50%) translateX(${x}px) scale(${scale})`

    if (path) {
        path.style.stroke = color
    }
}

function clamp(value: number) {
    return Math.max(0, Math.min(1, value))
}

function remap(value: number, start: number, end: number) {
    return clamp((value - start) / (end - start))
}

function easeOut2(t: number) {
    return 1 - (1 - t) * (1 - t)
}

function easeOut3(t: number) {
    return 1 - (1 - t) * (1 - t) * (1 - t)
}

function easeOut4(t: number) {
    return 1 - (1 - t) * (1 - t) * (1 - t) * (1 - t)
}

function mix(from: number, to: number, t: number) {
    return Math.round(from + (to - from) * t)
}
