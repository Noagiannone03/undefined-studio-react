import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from '@phosphor-icons/react'
import Asterisk from './Asterisk'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Hero() {
    const rootRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const blobRef = useRef<HTMLDivElement>(null)
    const starRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLAnchorElement>(null)

    useMagnetic(ctaRef, 0.3)

    useLayoutEffect(() => {
        if (!rootRef.current) return
        const ctx = gsap.context(() => {
            // Title lines reveal
            const lines = titleRef.current?.querySelectorAll('.reveal-line')
            if (lines) {
                gsap.set(lines, { yPercent: 110 })
                gsap.to(lines, {
                    yPercent: 0,
                    duration: 1.3,
                    ease: 'expo.out',
                    stagger: 0.12,
                    delay: 0.3,
                })
            }
            // Fadeins
            const soft = rootRef.current?.querySelectorAll('[data-fadein]')
            if (soft) {
                gsap.set(soft, { opacity: 0, y: 18 })
                gsap.to(soft, {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    ease: 'expo.out',
                    stagger: 0.08,
                    delay: 1.2,
                })
            }
            // Title subtle parallax
            gsap.to(titleRef.current, {
                yPercent: 8,
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
            })
            // Blob drift on scroll
            gsap.to(blobRef.current, {
                yPercent: -30,
                scale: 1.25,
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
            })
            // Star scroll rotation
            gsap.to(starRef.current, {
                rotate: 180,
                scale: 0.85,
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
            })
        }, rootRef)

        // Mouse follow for blob + star with delay
        let rx = window.innerWidth / 2
        let ry = window.innerHeight / 2
        let tx = rx
        let ty = ry
        let raf = 0
        const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
        const tick = () => {
            rx += (tx - rx) * 0.06
            ry += (ty - ry) * 0.06
            if (blobRef.current) {
                blobRef.current.style.transform = `translate(${rx - 300}px, ${ry - 300}px)`
            }
            if (starRef.current) {
                const cx = window.innerWidth * 0.78
                const cy = window.innerHeight * 0.5
                const dx = (tx - cx) * 0.04
                const dy = (ty - cy) * 0.04
                starRef.current.style.setProperty('--dx', `${dx}px`)
                starRef.current.style.setProperty('--dy', `${dy}px`)
            }
            raf = requestAnimationFrame(tick)
        }
        window.addEventListener('mousemove', onMove)
        raf = requestAnimationFrame(tick)

        return () => {
            ctx.revert()
            ScrollTrigger.refresh()
            window.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(raf)
        }
    }, [])

    return (
        <section
            ref={rootRef}
            id="top"
            className="relative min-h-[100svh] w-full bg-paper text-ink overflow-hidden flex flex-col"
        >
            <div aria-hidden className="grain" />

            {/* Tomato blob following cursor */}
            <div
                ref={blobRef}
                aria-hidden
                className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-[0.22] blur-[80px] mix-blend-multiply"
                style={{ background: 'radial-gradient(circle, #E84A2A 0%, transparent 60%)' }}
            />
            {/* Klein blob deep bottom left */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-[10vw] -bottom-[10vw] w-[50vw] h-[50vw] rounded-full opacity-[0.12] blur-[120px] mix-blend-multiply"
                style={{ background: 'radial-gradient(circle, #1D1DBF 0%, transparent 70%)' }}
            />

            {/* Giant asterisk that drifts with cursor */}
            <div
                ref={starRef}
                aria-hidden
                className="pointer-events-none absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[70vw] md:w-[48vw] opacity-[0.055] spin-slow"
                style={{ transform: 'translate(var(--dx,0), var(--dy,0))', transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)' }}
            >
                <Asterisk className="w-full h-full" color="#0E0E0C" />
            </div>

            <div aria-hidden className="absolute inset-0 soft-vignette pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex-1 container-x flex flex-col justify-center">
                <div data-fadein className="mb-10 md:mb-14 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-tomato" />
                    <span className="label label-soft">Undefined · Independent product studio</span>
                </div>

                <h1
                    ref={titleRef}
                    className="display text-[22vw] md:text-[12.5vw] leading-[0.84] tracking-[-0.055em]"
                >
                    <span className="reveal-mask">
                        <span className="reveal-line">We build</span>
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line">
                            what&apos;s <span className="serif-italic text-tomato">un</span>
                        </span>
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line">
                            defined<span className="serif-italic text-klein">.</span>
                        </span>
                    </span>
                </h1>
            </div>

            {/* Bottom line */}
            <div data-fadein className="relative z-10 container-x pb-10 md:pb-14 grid grid-cols-12 items-end gap-y-8">
                <p className="col-span-12 md:col-span-5 font-body text-base md:text-lg leading-[1.45] text-ink-soft max-w-[40ch]">
                    A three-person studio shaping mobile products —
                    <span className="serif-italic text-ink"> from first sketch to the app store.</span>
                </p>

                <div className="hidden md:flex col-span-2 justify-center">
                    <a href="#manifesto" className="flex flex-col items-center gap-2 text-ink-soft hover:text-ink transition-colors">
                        <ArrowDown size={14} weight="bold" className="animate-bounce" />
                        <span className="label">scroll</span>
                    </a>
                </div>

                <div className="col-span-12 md:col-span-5 flex md:justify-end">
                    <a
                        ref={ctaRef}
                        href="#contact"
                        data-cursor="cta"
                        data-cursor-label="go"
                        className="btn"
                    >
                        Start a brief
                        <span className="arrow">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    </a>
                </div>
            </div>
        </section>
    )
}
