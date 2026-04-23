import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Mark from './Mark'
import { useSplitChars } from '../hooks/useSplitChars'

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)
    useSplitChars(containerRef)

    useGSAP(
        () => {
            gsap.from('.hero-topbar > *', {
                y: -12,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.08,
            })

            gsap.fromTo(
                '.hero-mark .mark-chev',
                { strokeDashoffset: 80 },
                {
                    strokeDashoffset: 0,
                    duration: 0.9,
                    ease: 'expo.out',
                    stagger: 0.12,
                    delay: 0.3,
                }
            )

            gsap.to('.hero-mark .mark-chev', {
                x: 6,
                opacity: 0.55,
                duration: 1.2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                stagger: { each: 0.18, repeat: -1, yoyo: true },
                delay: 1.4,
            })

            gsap.from('.hero-line-2', {
                yPercent: 110,
                duration: 1.2,
                ease: 'expo.out',
                delay: 0.5,
            })

            gsap.from('.hero-chars .c', {
                yPercent: 110,
                rotation: 6,
                duration: 1.0,
                stagger: 0.025,
                ease: 'expo.out',
                delay: 0.15,
            })

            // Desktop-only: scrubbed parallax on the headline.
            const mm = gsap.matchMedia()
            mm.add('(min-width: 900px) and (hover: hover)', () => {
                gsap.to('.hero-headline', {
                    yPercent: -15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1,
                    },
                })
            })

            void ScrollTrigger
        },
        { scope: containerRef }
    )

    return (
        <section ref={containerRef} id="hero" className="hero-section container-x">
            <div className="grain" />

            <div className="hero-topbar">
                <span className="hero-mark" style={{ display: 'inline-flex' }}>
                    <Mark
                        size={26}
                        drawable
                        color="var(--color-tomato)"
                        color2="var(--color-klein)"
                    />
                </span>
            </div>

            <div className="hero-body">
                <h1 className="hero-headline hero-chars">
                    <span data-split className="display hero-line hero-line-1">
                        WE BUILD
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line hero-line-2 serif-italic hero-line">
                            things
                        </span>
                    </span>
                    <span data-split className="display hero-line hero-line-3">
                        THAT <span style={{ color: 'var(--color-tomato)' }}>MOVE.</span>
                    </span>
                </h1>
            </div>

            <div className="relative z-10 pb-8" />
        </section>
    )
}
