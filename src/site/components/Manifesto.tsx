import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Word = { text: string; accent?: 'tomato' | 'klein' | 'italic' }

const WORDS: Word[] = [
    { text: 'Une' },
    { text: 'interface' },
    { text: 'complexe' },
    { text: 'tue', accent: 'tomato' },
    { text: 'votre' },
    { text: 'croissance.' },
    { text: 'Un' },
    { text: 'produit' },
    { text: 'fluide' },
    { text: 'fidélise', accent: 'klein' },
    { text: 'vos' },
    { text: 'utilisateurs.' },
    { text: 'Nous' },
    { text: 'concevons' },
    { text: 'des' },
    { text: 'outils', accent: 'italic' },
    { text: 'évidents.' },
    { text: 'La' },
    { text: 'simplicité' },
    { text: 'est' },
    { text: 'notre' },
    { text: 'standard.' },
]

/**
 * Manifesto — pinned word-by-word reveal.
 *
 * Desktop keeps the blur-to-focus scrub (it's the signature move of the
 * section). Mobile uses a cheaper opacity+y tween because `filter: blur`
 * on scrub is the #1 GPU killer on mobile.
 */
export default function Manifesto() {
    const ref = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const stickyEl = stickyRef.current
            const words = ref.current?.querySelectorAll<HTMLSpanElement>('[data-word]')
            if (!stickyEl || !words || words.length === 0) return

            const mm = gsap.matchMedia()

            const wordColor = (accent: string | undefined) => {
                if (accent === 'tomato') return '#E84A2A'
                if (accent === 'klein') return '#1D1DBF'
                return 'rgba(239, 235, 221, 1)'
            }

            // Desktop: full effect — blur + scale + translate.
            mm.add('(min-width: 900px)', () => {
                gsap.set(words, {
                    opacity: 0.12,
                    scale: 0.92,
                    y: 8,
                    filter: 'blur(6px)',
                    transformOrigin: 'center center',
                })

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: stickyEl,
                        start: 'top top',
                        end: () => `+=${window.innerHeight * 2.2}`,
                        scrub: 1,
                        pin: true,
                        pinType: 'transform',
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                })

                words.forEach((word, i) => {
                    tl.to(
                        word,
                        {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            color: wordColor(word.dataset.accent),
                            duration: 1,
                            ease: 'power2.out',
                        },
                        i * 0.5
                    )
                })
            })

            // Mobile: stripped-down tween, no blur.
            mm.add('(max-width: 899px)', () => {
                gsap.set(words, { opacity: 0.14, y: 8, force3D: true })

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: stickyEl,
                        start: 'top top',
                        end: () => `+=${window.innerHeight * 1.1}`,
                        scrub: 0.6,
                        pin: true,
                        pinType: 'transform',
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                })

                words.forEach((word, i) => {
                    tl.to(
                        word,
                        {
                            opacity: 1,
                            y: 0,
                            color: wordColor(word.dataset.accent),
                            duration: 1,
                            ease: 'none',
                        },
                        i * 0.5
                    )
                })
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
