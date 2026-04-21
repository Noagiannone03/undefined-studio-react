import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'Ce' },
    { text: "qu'on" },
    { text: 'construit' },
    { text: 'doit', accent: 'italic' },
    { text: 'tenir' },
    { text: 'dans' },
    { text: 'dix', accent: 'tomato' },
    { text: 'ans.' },
    { text: 'Pas' },
    { text: "jusqu'à" },
    { text: 'la' },
    { text: 'prochaine', accent: 'italic' },
    { text: 'tendance.', accent: 'klein' },
    { text: 'On' },
    { text: 'y' },
    { text: 'tient.' },
]

/**
 * Manifesto — the dark pinned scrub section.
 * Sits between About and Work, breaks the rhythm with a high-contrast
 * ink background and paper text that reveals word-by-word on scrub.
 */
export default function Manifesto() {
    const ref = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const stickyEl = stickyRef.current
            const words = ref.current?.querySelectorAll<HTMLSpanElement>('[data-word]')
            if (!stickyEl || !words || words.length === 0) return
            const isMobile = window.matchMedia('(max-width: 767px)').matches

            // Set initial state on all words
            gsap.set(words, {
                opacity: 0.08,
                scale: 0.88,
                filter: 'blur(8px)',
                y: 10,
                transformOrigin: 'center center',
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stickyEl,
                    start: 'top top',
                    end: `+=${window.innerHeight * (isMobile ? 1.55 : 2.5)}`,
                    scrub: isMobile ? 0.8 : 1.2,
                    pin: true,
                    anticipatePin: 1,
                },
            })

            words.forEach((word, i) => {
                const accent = word.dataset.accent
                let targetColor = 'rgba(239, 235, 221, 1)'
                if (accent === 'tomato') targetColor = '#E84A2A'
                else if (accent === 'klein') targetColor = '#1D1DBF'

                tl.to(
                    word,
                    {
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        y: 0,
                        color: targetColor,
                        duration: 1,
                        ease: 'power2.out',
                    },
                    i * 0.5
                )
            })
        }, ref)

        return () => {
            ctx.revert()
            ScrollTrigger.refresh()
        }
    }, [])

    return (
        <section
            ref={ref}
            id="manifesto"
            className="manifesto-section"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
            {/* Pinned sticky phrase */}
            <div
                ref={stickyRef}
                style={{
                    position: 'relative',
                    minHeight: '100svh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="container-x" style={{ width: '100%' }}>
                    <p
                        className="display manifesto-copy"
                        style={{
                            fontSize: 'clamp(48px, 6.5vw, 104px)',
                            lineHeight: 1.08,
                            letterSpacing: '-0.04em',
                            maxWidth: '18ch',
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

            <div style={{ height: 'clamp(24px, 4vw, 56px)' }} />
        </section>
    )
}
