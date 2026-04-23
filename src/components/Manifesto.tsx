import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'Un' },
    { text: 'bon' },
    { text: 'outil' },
    { text: 'peut' },
    { text: 'changer', accent: 'italic' },
    { text: 'une' },
    { text: 'journée.', accent: 'klein' },
    { text: 'Un' },
    { text: 'mauvais' },
    { text: 'peut', accent: 'italic' },
    { text: 'en' },
    { text: 'gâcher', accent: 'tomato' },
    { text: 'dix.' },
    { text: 'On' },
    { text: 'prend' },
    { text: 'la' },
    { text: 'différence' },
    { text: 'au' },
    { text: 'sérieux.' },
]

/**
 * Manifesto — pinned word-by-word reveal.
 * No `filter: blur` on scrub (single biggest scroll-perf killer).
 * Pure transform + opacity → cheap GPU path.
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

            gsap.set(words, {
                opacity: 0.14,
                y: 8,
                force3D: true,
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stickyEl,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * (isMobile ? 1.1 : 1.8)}`,
                    scrub: 0.6,
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

                tl.to(
                    word,
                    {
                        opacity: 1,
                        y: 0,
                        color: targetColor,
                        duration: 1,
                        ease: 'none',
                    },
                    i * 0.5
                )
            })

            void ScrollTrigger
        },
        { scope: ref }
    )

    return (
        <section ref={ref} id="manifesto" className="manifesto-section">
            <div ref={stickyRef} className="manifesto-sticky">
                <div className="container-x" style={{ width: '100%' }}>
                    <p className="manifesto-copy">
                        {WORDS.map((w, i) => (
                            <span
                                key={i}
                                data-word
                                data-accent={w.accent}
                                className={`inline-block ${w.accent === 'italic' ? 'serif-italic' : ''}`}
                                style={{ marginRight: '0.22em' }}
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
