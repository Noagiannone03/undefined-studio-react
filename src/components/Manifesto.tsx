import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'Du' },
    { text: 'numérique' },
    { text: 'qui', accent: 'italic' },
    { text: 'aide,', accent: 'tomato' },
    { text: 'pas' },
    { text: 'du' },
    { text: 'numérique' },
    { text: 'qui', accent: 'italic' },
    { text: 'brille.' },
    { text: 'La' },
    { text: 'différence,' },
    { text: 'on' },
    { text: 'la' },
    { text: 'travaille', accent: 'klein' },
    { text: '.' },
]

/**
 * Manifesto — dark pinned scrub section between About and Work.
 *
 * Uses explicit gsap.set() + tl.to() (not .from()) for deterministic initial
 * state — avoids the "content stays hidden" failure mode when ScrollTrigger
 * fires before the pinSpacer is laid out. `invalidateOnRefresh` + `pinType:
 * 'transform'` keep the pin stable under Lenis + direction reversal.
 */
export default function Manifesto() {
    const ref = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const stickyEl = stickyRef.current
            const words = ref.current?.querySelectorAll<HTMLSpanElement>('[data-word]')
            if (!stickyEl || !words || words.length === 0) return

            const isMobile = window.matchMedia('(max-width: 767px)').matches

            const initial: gsap.TweenVars = {
                opacity: 0.12,
                scale: 0.92,
                y: 8,
                transformOrigin: 'center center',
            }
            // Filter blur is the single most expensive scrub op on mobile GPU.
            if (!isMobile) initial.filter = 'blur(6px)'
            gsap.set(words, initial)

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stickyEl,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * (isMobile ? 1.2 : 2.2)}`,
                    scrub: isMobile ? 0.5 : 1,
                    pin: true,
                    pinType: 'transform',
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            })

            words.forEach((word, i) => {
                const accent = word.dataset.accent
                let targetColor = 'rgba(239, 235, 221, 1)'
                if (accent === 'tomato') targetColor = '#E84A2A'
                else if (accent === 'klein') targetColor = '#1D1DBF'

                const step: gsap.TweenVars = {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    color: targetColor,
                    duration: 1,
                    ease: 'power2.out',
                }
                if (!isMobile) step.filter = 'blur(0px)'
                tl.to(word, step, i * 0.5)
            })

            void ScrollTrigger
        },
        { scope: ref }
    )

    return (
        <section
            ref={ref}
            id="manifesto"
            className="manifesto-section"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
            <div
                ref={stickyRef}
                className="manifesto-sticky"
            >
                <div className="container-x" style={{ width: '100%' }}>
                    <p
                        className="display manifesto-copy"
                        style={{
                            fontSize: 'clamp(44px, 6.2vw, 100px)',
                            lineHeight: 1.06,
                            letterSpacing: '-0.04em',
                            maxWidth: '20ch',
                            margin: 0,
                        }}
                    >
                        {WORDS.map((w, i) => (
                            <span
                                key={i}
                                data-word
                                data-accent={w.accent}
                                className={`inline-block ${w.accent === 'italic' ? 'serif-italic' : ''}`}
                                style={{
                                    marginRight: '0.22em',
                                    display: 'inline-block',
                                }}
                            >
                                {w.text}
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </section>
    )
}
