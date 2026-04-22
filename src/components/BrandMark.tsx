import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * BrandMark — chapter opener between Manifesto and Work.
 *
 * Intentionally distinct from Manifesto: paper-2 ground, no pin, no scrub,
 * single decisive entrance. Reads as an editorial page-turn, not another
 * typographic performance.
 */
export default function BrandMark() {
    const ref = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ref.current,
                    start: 'top 70%',
                    once: true,
                },
                defaults: { ease: 'expo.out' },
            })

            tl.from('.bm-top > *', {
                y: 12,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
            })
                .from(
                    '.bm-line',
                    { yPercent: 110, duration: 1.1, stagger: 0.09 },
                    '-=0.35'
                )
                .fromTo(
                    '.bm-arrow',
                    { clipPath: 'inset(0 100% 0 0)' },
                    { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out' },
                    '-=0.7'
                )
                .fromTo(
                    '.bm-rule',
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.9, ease: 'power3.out' },
                    '-=0.55'
                )
                .from(
                    '.bm-bottom > *',
                    {
                        y: 10,
                        opacity: 0,
                        duration: 0.55,
                        stagger: 0.08,
                        ease: 'power3.out',
                    },
                    '-=0.4'
                )
        },
        { scope: ref }
    )

    return (
        <section
            ref={ref}
            id="brand-mark"
            className="brandmark-section"
        >
            {/* Top meta row */}
            <div className="bm-top">
                <span className="mono bm-top-left">( 03 ) &nbsp;— &nbsp;CHAPITRE</span>
                <span className="mono bm-top-right">MARSEILLE — 2024</span>
            </div>

            {/* Headline — two-line editorial statement */}
            <h2 className="bm-headline">
                <span className="reveal-mask">
                    <span className="bm-line display bm-line-1">CE QU'ON</span>
                </span>
                <span className="reveal-mask">
                    <span className="bm-line serif-italic bm-line-2">a fait.</span>
                </span>
            </h2>

            {/* Arrow — draws into view, points down at projects */}
            <svg
                className="bm-arrow"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden
            >
                <path
                    d="M10 10 L70 70 M70 70 L70 40 M70 70 L40 70"
                    stroke="var(--color-klein)"
                    strokeWidth="3"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                />
            </svg>

            {/* Hairline + bottom meta */}
            <div className="bm-rule" aria-hidden />

            <div className="bm-bottom">
                <span className="mono bm-bottom-left">
                    <span style={{ color: 'var(--color-klein)' }}>↗</span>&nbsp;VAGO&nbsp;&nbsp;·&nbsp;&nbsp;
                    <span style={{ color: 'var(--color-tomato)' }}>↗</span>&nbsp;WHISP
                </span>
                <span className="mono bm-bottom-right">02 PROJETS</span>
            </div>
        </section>
    )
}
