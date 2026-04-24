import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const VALUES = [
    'Comprendre avant de construire',
    'Moins, mais qui tient',
    'Un bon outil se fait oublier',
    'Mesurer en usage, pas en vues',
]

type Line = { text: string; variant: 'display' | 'serif-italic'; accent?: boolean }

const HEADLINE: Line[] = [
    { text: 'ON COMPREND', variant: 'display' },
    { text: 'le besoin.', variant: 'serif-italic' },
    { text: 'ON BÂTIT', variant: 'display' },
    { text: "CE QU'IL FAUT.", variant: 'display', accent: true },
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
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })

            gsap.from('.about-bio', {
                y: 24,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.5,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })

            gsap.from('.about-value-row', {
                xPercent: -2,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                delay: 0.7,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })
        },
        { scope: sectionRef }
    )

    return (
        <section
            ref={sectionRef}
            id="about"
            className="about-section container-x section-y"
        >
            <div className="about-grid">
                <div className="about-left">
                    <h2 style={{ margin: 0 }}>
                        {HEADLINE.map((line, i) => (
                            <span key={i} className="reveal-mask">
                                <span
                                    className={`reveal-line about-line ${line.variant}`}
                                    style={{ color: line.accent ? 'var(--color-tomato)' : 'var(--color-ink)' }}
                                >
                                    {line.text}
                                </span>
                            </span>
                        ))}
                    </h2>
                </div>

                <div
                    className="about-right"
                    style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 5vw, 64px)' }}
                >
                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — Le studio
                        </span>
                        <div className="serif about-bio">
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
                        <ul className="about-values">
                            {VALUES.map((v) => (
                                <li key={v} className="about-value-row">
                                    <span className="about-arrow">→</span>
                                    <span>{v}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
