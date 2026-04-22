import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * BrandMark — chapter opener between Manifesto and Work.
 *
 * Deliberately distinct from Manifesto: paper-2 ground, no pin, no scrub,
 * single decisive entrance. Reads as an editorial page-turn, not another
 * typographic performance.
 *
 * Uses gsap.set() + tl.to() (not .from()) so the initial state is written
 * synchronously; if the trigger never fires for any reason, the final state
 * — the readable one — is what shows.
 */
export default function BrandMark() {
    const ref = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            const root = ref.current
            if (!root) return

            const topItems = root.querySelectorAll<HTMLElement>('.bm-top > *')
            const lines = root.querySelectorAll<HTMLElement>('.bm-line')
            const arrow = root.querySelector<SVGElement>('.bm-arrow')
            const rule = root.querySelector<HTMLElement>('.bm-rule')
            const bottomItems = root.querySelectorAll<HTMLElement>('.bm-bottom > *')

            gsap.set(topItems, { y: 12, opacity: 0 })
            gsap.set(lines, { yPercent: 110 })
            if (arrow) gsap.set(arrow, { clipPath: 'inset(0 100% 0 0)' })
            if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })
            gsap.set(bottomItems, { y: 10, opacity: 0 })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root,
                    start: 'top 72%',
                    toggleActions: 'play none none none',
                    invalidateOnRefresh: true,
                },
                defaults: { ease: 'expo.out' },
            })

            tl.to(topItems, {
                y: 0,
                opacity: 1,
                duration: 0.55,
                stagger: 0.08,
                ease: 'power3.out',
            })
                .to(
                    lines,
                    { yPercent: 0, duration: 1.05, stagger: 0.09 },
                    '-=0.3'
                )
                .to(
                    arrow,
                    { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out' },
                    '-=0.7'
                )
                .to(
                    rule,
                    { scaleX: 1, duration: 0.85, ease: 'power3.out' },
                    '-=0.55'
                )
                .to(
                    bottomItems,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.55,
                        stagger: 0.07,
                        ease: 'power3.out',
                    },
                    '-=0.4'
                )

            void ScrollTrigger
        },
        { scope: ref }
    )

    return (
        <section ref={ref} id="brand-mark" className="brandmark-section">
            {/* Top meta row */}
            <div className="bm-top">
                <span className="mono bm-top-left">( 03 )&nbsp;&nbsp;—&nbsp;&nbsp;NOS OUTILS</span>
                <span className="mono bm-top-right">MARSEILLE — 2024</span>
            </div>

            {/* Headline — editorial chapter statement */}
            <h2 className="bm-headline">
                <span className="bm-mask">
                    <span className="bm-line display bm-line-1">DEUX APPS</span>
                </span>
                <span className="bm-mask">
                    <span className="bm-line serif-italic bm-line-2">qui tiennent.</span>
                </span>
            </h2>

            {/* Decorative arrow — points down into the work below */}
            <svg
                className="bm-arrow"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden
            >
                <path
                    d="M12 12 L68 68 M68 68 L68 36 M68 68 L36 68"
                    stroke="var(--color-klein)"
                    strokeWidth="2.6"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                />
            </svg>

            {/* Hairline + bottom meta */}
            <div className="bm-rule" aria-hidden />

            <div className="bm-bottom">
                <span className="mono bm-bottom-left">
                    <span style={{ color: 'var(--color-klein)' }}>↗</span>&nbsp;VAGO
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <span style={{ color: 'var(--color-tomato)' }}>↗</span>&nbsp;WHISP
                </span>
                <span className="mono bm-bottom-right">FAITS MAIN</span>
            </div>
        </section>
    )
}
