import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const VALUES = [
    'Comprendre avant de construire',
    'Moins, mais qui tient',
    'Un bon outil se fait oublier',
    'Mesurer en usage, pas en vues',
]

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
                                { text: 'ON COMPREND', style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
                                { text: 'le besoin.', style: 'serif-italic', fontSize: 'clamp(42px, 6vw, 92px)' },
                                { text: 'ON BÂTIT', style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
                                { text: "CE QU'IL FAUT.", style: 'display', fontSize: 'clamp(44px, 6.2vw, 96px)' },
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
                        <div
                            className="serif about-bio"
                            style={{
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.5,
                                maxWidth: 460,
                            }}
                        >
                            <p style={{ margin: 0 }}>
                                On est un petit studio à Marseille. On construit des applications mobiles et web.
                            </p>
                            <p style={{ margin: '1.1em 0 0' }}>
                                Ça, c'est la version courte. La vraie, c'est qu'on essaie de faire des outils qui tiennent la route — et qui servent vraiment à quelqu'un. Parce qu'on en a vu passer, des apps qu'on ouvre une fois et qu'on désinstalle la semaine d'après. On n'a pas envie d'en faire une de plus.
                            </p>
                            <p style={{ margin: '1.1em 0 0' }}>
                                Alors on commence toujours par les bonnes questions. À qui ça sert. Ce qui manque aujourd'hui. Ce qui se passe si ça n'existe pas. On préfère les poser maintenant plutôt que six mois plus tard, quand le produit est là et que personne ne s'en sert.
                            </p>
                            <p style={{ margin: '1.1em 0 0' }}>
                                La tech peut aider. Vraiment. À condition qu'on la construise pour ça.
                            </p>
                        </div>
                    </div>

                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — Notre méthode
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
