import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const VALUES = [
    "La fonction dicte la forme",
    "La vitesse est une fonctionnalité",
    "Moins de bruit, plus d'utilité",
    "Conçu pour l'utilisateur, pas pour nous",
]

type Line = { text: string; variant: 'display' | 'serif-italic'; accent?: boolean }

const HEADLINE: Line[] = [
    { text: 'NOUS CRÉONS', variant: 'display' },
    { text: "des produits.", variant: 'serif-italic' },
    { text: 'QUI FONCTIONNENT', variant: 'display' },
    { text: "VRAIMENT.", variant: 'display', accent: true },
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
                                Nous sommes un studio digital indépendant basé à Marseille. Notre métier : concevoir et développer des applications web et mobiles qui ne finissent pas à la corbeille.
                            </p>
                            <p style={{ margin: '1.1em 0 0' }}>
                                Nous ne faisons pas dans l'art abstrait. Nous créons des outils numériques pensés pour résoudre de vrais problèmes. Des interfaces rapides et intuitives, qui aident vos utilisateurs au lieu de les frustrer.
                            </p>
                            <p style={{ margin: '1.1em 0 0' }}>
                                Si une fonctionnalité ne sert à rien, nous l'enlevons. Si un écran est lent, nous le réécrivons. Nous croyons en la simplicité, la performance, et l'utilité directe.
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
