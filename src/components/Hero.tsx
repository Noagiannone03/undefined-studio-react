import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Mark from './Mark'
import { useSplitChars } from '../hooks/useSplitChars'

/**
 * Hero — soft-pop neo-brutalist opener.
 * Massive stacked display headline that fills the viewport width.
 * Char-level animation on the two display lines via useSplitChars.
 * Registration of ScrollTrigger happens in App.tsx.
 */
export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)

    // Pre-split [data-split] elements into .c-line > .c before GSAP runs
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

            // Draw-in the two chevrons in sequence
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

            // Subtle infinite "stream" — chevrons slide right and fade, looping
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

            // Line 2 (serif italic) — keep as line reveal
            gsap.from('.hero-line-2', {
                yPercent: 110,
                duration: 1.2,
                ease: 'expo.out',
                delay: 0.5,
            })

            // Lines 1 and 3 — char-level reveal (after split runs)
            gsap.from('.hero-chars .c', {
                yPercent: 110,
                rotation: 8,
                duration: 1.0,
                stagger: 0.025,
                ease: 'expo.out',
                delay: 0.15,
            })

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

            // Silence unused-import warning; ScrollTrigger is registered globally
            void ScrollTrigger
        },
        { scope: containerRef }
    )

    return (
        <section
            ref={containerRef}
            id="hero"
            className="hero-section relative min-h-screen flex flex-col container-x overflow-hidden"
        >
            <div className="grain" />

            {/* Topbar */}
            <div className="hero-topbar flex items-center justify-between pt-8 relative z-10">
                <span className="hero-mark" style={{ display: 'inline-flex' }}>
                    <Mark
                        size={26}
                        drawable
                        color="var(--color-tomato)"
                        color2="var(--color-klein)"
                    />
                </span>
            </div>

            {/* Headline — fills vertical center, contains all three lines */}
            <div className="hero-body flex-1 flex items-center relative z-10">
                <h1
                    className="hero-headline hero-chars"
                    style={{ margin: 0, width: '100%' }}
                >
                    {/* Line 1 */}
                    <span
                        data-split
                        className="display hero-line hero-line-1"
                        style={{ display: 'block', letterSpacing: '-0.045em' }}
                    >
                        WE BUILD
                    </span>
                    {/* Line 2 */}
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span
                            className="reveal-line hero-line-2 serif-italic hero-line"
                            style={{ display: 'block', letterSpacing: '-0.03em' }}
                        >
                            things
                        </span>
                    </span>
                    {/* Line 3 */}
                    <span
                        data-split
                        className="display hero-line hero-line-3"
                        style={{ display: 'block', letterSpacing: '-0.045em' }}
                    >
                        THAT <span style={{ color: 'var(--color-tomato)' }}>MOVE.</span>
                    </span>
                </h1>
            </div>

            <div className="relative z-10 pb-8" />
        </section>
    )
}
