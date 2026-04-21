import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const VALUES = ["L'impact d'abord", "L'utile rendu beau", 'Pas pour le portfolio', 'On y croit vraiment']

export default function About() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.about-line', {
                yPercent: 100,
                duration: 1.1,
                stagger: 0.15,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            gsap.from('.about-bio', {
                y: 24,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.5,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            gsap.from('.about-arrow', {
                x: -16,
                opacity: 0,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power3.out',
                delay: 0.7,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            gsap.from('.about-value', {
                xPercent: -3,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.85,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            void ScrollTrigger
        },
        { scope: sectionRef }
    )

    const onValueEnter = (arrow: HTMLElement | null) => {
        if (!arrow) return
        gsap.to(arrow, { scale: 1.2, duration: 0.3, ease: 'power3.out' })
    }
    const onValueLeave = (arrow: HTMLElement | null) => {
        if (!arrow) return
        gsap.to(arrow, { scale: 1, duration: 0.3, ease: 'power3.out' })
    }

    return (
        <section
            ref={sectionRef}
            id="about"
            className="about-section container-x section-y relative"
            style={{ background: 'var(--color-paper)', minHeight: '100vh' }}
        >
            <div className="grid-12">
                {/* Left — massive statement */}
                <div className="about-left col-span-12 md:col-span-7" style={{ gridColumn: 'span 7 / span 7' }}>
                    <h2
                        style={{
                            margin: 0,
                        }}
                    >
                        {(
                            [
                                { text: "L'UTILE", style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
                                { text: 'et le beau', style: 'serif-italic', fontSize: 'clamp(42px, 6vw, 92px)' },
                                { text: "C'EST PAS", style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
                                { text: 'UN CHOIX.', style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
                            ] as const
                        ).map((line, i) => (
                            <span
                                key={i}
                                className="reveal-mask"
                                style={{ display: 'block' }}
                            >
                                <span
                                    className={`reveal-line about-line ${line.style}`}
                                    style={{
                                        display: 'block',
                                        fontSize: line.fontSize,
                                        lineHeight: line.style === 'serif-italic' ? 0.95 : 0.92,
                                        letterSpacing:
                                            line.style === 'serif-italic'
                                                ? '-0.025em'
                                                : '-0.045em',
                                        color:
                                            i === 3
                                                ? 'var(--color-tomato)'
                                                : 'var(--color-ink)',
                                    }}
                                >
                                    {line.text}
                                </span>
                            </span>
                        ))}
                    </h2>
                </div>

                {/* Right — paragraph + values */}
                <div
                    className="about-right"
                    style={{
                        gridColumn: 'span 5 / span 5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(40px, 5vw, 64px)',
                        paddingTop: 'clamp(24px, 4vw, 80px)',
                    }}
                >
                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — Le studio
                        </span>
                        <p
                            className="serif about-bio"
                            style={{
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.45,
                                margin: 0,
                                maxWidth: 440,
                            }}
                        >
                            On est à Marseille. On fait des applications et des outils numériques qui ont une vraie vocation — mêler l'utile à l'agréable. On croit que la tech peut faire bouger les choses autant au plan social que n'importe où ailleurs. Alors on s'y tient.
                        </p>
                    </div>

                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — Ce qui compte
                        </span>
                        <ul
                            className="about-values"
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            {VALUES.map((v) => {
                                const arrowRef = { current: null as HTMLSpanElement | null }
                                return (
                                    <li
                                        key={v}
                                        className="display"
                                        onMouseEnter={() => onValueEnter(arrowRef.current)}
                                        onMouseLeave={() => onValueLeave(arrowRef.current)}
                                        style={{
                                            fontSize: 'clamp(22px, 2.4vw, 34px)',
                                            letterSpacing: '-0.03em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            cursor: 'default',
                                        }}
                                    >
                                        <span
                                            ref={(el) => {
                                                arrowRef.current = el
                                            }}
                                            className="about-arrow"
                                            style={{
                                                color: 'var(--color-klein)',
                                                display: 'inline-block',
                                                transformOrigin: 'center',
                                            }}
                                        >
                                            →
                                        </span>
                                        <span className="about-value">{v}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
