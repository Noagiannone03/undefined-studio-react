import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'Design' },
    { text: 'is' },
    { text: 'how', accent: 'italic' },
    { text: 'something' },
    { text: 'works.' },
    { text: 'Motion' },
    { text: 'is' },
    { text: 'how', accent: 'italic' },
    { text: 'it' },
    { text: 'breathes.' },
    { text: 'Code', accent: 'klein' },
    { text: 'is' },
    { text: 'how', accent: 'italic' },
    { text: 'it' },
    { text: 'lives.', accent: 'tomato' },
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
                    end: `+=${window.innerHeight * 2.5}`,
                    scrub: 1.2,
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
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
            {/* Top label row */}
            <div
                className="container-x"
                style={{
                    paddingTop: 'clamp(64px, 8vw, 120px)',
                    paddingBottom: 'clamp(32px, 4vw, 48px)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(239,235,221,0.14)',
                        paddingBottom: 24,
                    }}
                >
                    <span
                        className="mono"
                        style={{
                            color: 'rgba(239,235,221,0.45)',
                            fontSize: 11,
                            letterSpacing: '0.2em',
                        }}
                    >
                        — MANIFESTO
                    </span>
                    <span
                        className="mono"
                        style={{
                            color: 'rgba(239,235,221,0.45)',
                            fontSize: 11,
                            letterSpacing: '0.2em',
                        }}
                    >
                        UNDEFINED STUDIO
                    </span>
                </div>
            </div>

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
                        className="display"
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

            {/* Bottom label row */}
            <div
                className="container-x"
                style={{ paddingBottom: 'clamp(64px, 8vw, 120px)' }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        borderTop: '1px solid rgba(239,235,221,0.14)',
                        paddingTop: 24,
                    }}
                >
                    <span
                        style={{
                            flex: 1,
                            height: 1,
                            background: 'rgba(239,235,221,0.12)',
                        }}
                    />
                    <span
                        className="mono"
                        style={{
                            color: 'rgba(239,235,221,0.4)',
                            fontSize: 11,
                            letterSpacing: '0.2em',
                        }}
                    >
                        DESIGN · MOTION · CODE
                    </span>
                    <span
                        style={{
                            flex: 1,
                            height: 1,
                            background: 'rgba(239,235,221,0.12)',
                        }}
                    />
                </div>
            </div>
        </section>
    )
}
