import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Service = {
    id: string
    name: string
    stack: string
    accent: string
    brief: string
}

const SERVICES: Service[] = [
    {
        id: '01',
        name: 'FONDATIONS',
        stack: 'Stratégie · Architecture · UX Design',
        accent: 'var(--color-klein)',
        brief: "On ne colorie pas des cases. On pose d'abord les vraies questions pour s'assurer que le produit tient debout avant même la première maquette.",
    },
    {
        id: '02',
        name: 'DIRECTION ARTISTIQUE',
        stack: 'UI Design · Identité Visuelle · Systèmes',
        accent: 'var(--color-ink)',
        brief: "La première impression est toujours visuelle. On crée des interfaces avec un vrai parti-pris, pour que vous ne ressembliez à personne d'autre.",
    },
    {
        id: '03',
        name: 'INGÉNIERIE FRONT',
        stack: 'React · TypeScript · WebGL',
        accent: 'var(--color-tomato)',
        brief: "Un beau design ne vaut rien s'il rame. On écrit un code robuste, optimisé et pensé dès le premier jour pour la performance absolue.",
    },
    {
        id: '04',
        name: 'PHYSIQUE & MOTION',
        stack: 'GSAP · Animations · Micro-interactions',
        accent: 'var(--color-klein)',
        brief: "L'immobilité c'est la mort. On ajoute de la gravité, de la friction et du rythme pour rendre chaque interaction organique et foudroyante.",
    },
]

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.cap-header > *', {
                y: 28,
                opacity: 0,
                duration: 0.8,
                stagger: 0.07,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 82%',
                    once: true,
                },
            })
            gsap.from('.cap-row', {
                y: 36,
                opacity: 0,
                duration: 0.7,
                stagger: 0.09,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.cap-list',
                    start: 'top 80%',
                    once: true,
                },
            })
            void ScrollTrigger
        },
        { scope: sectionRef }
    )

    return (
        <section
            ref={sectionRef}
            id="services"
            className="capabilities-section container-x section-y"
            style={{ background: 'var(--color-paper)' }}
        >
            <div
                className="cap-header"
                style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}
            >
                <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                    ( 04 ) — Ce qu'on fait
                </span>
                <h2
                    className="display"
                    style={{
                        fontSize: 'clamp(44px, 6.5vw, 96px)',
                        lineHeight: 0.9,
                        margin: 0,
                        letterSpacing: '-0.045em',
                    }}
                >
                    NOS{' '}
                    <span className="serif-italic" style={{ letterSpacing: '-0.02em' }}>
                        métiers.
                    </span>
                </h2>
            </div>

            <div className="cap-list" style={{ borderTop: '1px solid var(--color-hair)' }}>
                {SERVICES.map((service) => (
                    <ServiceRow key={service.id} service={service} />
                ))}
            </div>
        </section>
    )
}

function ServiceRow({ service }: { service: Service }) {
    const rowRef = useRef<HTMLDivElement>(null)
    const fillRef = useRef<HTMLDivElement>(null)
    const numRef = useRef<HTMLSpanElement>(null)
    const nameRef = useRef<HTMLHeadingElement>(null)
    const stackRef = useRef<HTMLSpanElement>(null)
    const briefRef = useRef<HTMLParagraphElement>(null)
    const arrowRef = useRef<HTMLSpanElement>(null)

    const textEls = (): HTMLElement[] =>
        [numRef.current, nameRef.current, stackRef.current, briefRef.current, arrowRef.current].filter(
            (el): el is HTMLElement => el !== null
        )

    const onEnter = () => {
        gsap.to(fillRef.current, { scaleY: 1, duration: 0.45, ease: 'expo.out' })
        gsap.to(textEls(), { color: 'var(--color-paper)', duration: 0.22, ease: 'none' })
        gsap.to(briefRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', delay: 0.08 })
    }

    const onLeave = () => {
        gsap.to(fillRef.current, { scaleY: 0, duration: 0.38, ease: 'power3.in' })
        gsap.to(textEls(), { color: 'var(--color-ink)', duration: 0.22, ease: 'none' })
        gsap.to(briefRef.current, { opacity: 0, y: 8, duration: 0.25, ease: 'power2.in' })
    }

    return (
        <div
            ref={rowRef}
            className="cap-row"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                position: 'relative',
                padding: 'clamp(26px, 3.2vw, 44px) 0',
                borderBottom: '1px solid var(--color-hair)',
                cursor: 'default',
                overflow: 'hidden',
            }}
        >
            <div
                ref={fillRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: service.accent,
                    transform: 'scaleY(0)',
                    transformOrigin: 'bottom',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, padding: '0 clamp(4px, 1vw, 16px)' }}>
                {/* Main row */}
                <div
                    className="cap-row-main"
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 'clamp(16px, 3vw, 40px)',
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        ref={numRef}
                        className="mono"
                        style={{
                            fontSize: 11,
                            letterSpacing: '0.22em',
                            color: 'var(--color-ink)',
                            opacity: 0.4,
                            flexShrink: 0,
                        }}
                    >
                        {service.id}
                    </span>

                    <h3
                        ref={nameRef}
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 4vw, 56px)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.04em',
                            color: 'var(--color-ink)',
                            margin: 0,
                            flex: 1,
                            minWidth: 200,
                        }}
                    >
                        {service.name}
                    </h3>

                    <span
                        ref={stackRef}
                        className="mono"
                        style={{
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            color: 'var(--color-ink)',
                            opacity: 0.45,
                            flexShrink: 0,
                        }}
                    >
                        {service.stack}
                    </span>

                    <span
                        ref={arrowRef}
                        style={{
                            color: 'var(--color-ink)',
                            fontSize: 18,
                            opacity: 0.5,
                            flexShrink: 0,
                        }}
                    >
                        →
                    </span>
                </div>

                {/* Brief — visible on hover */}
                <p
                    ref={briefRef}
                    className="serif cap-brief"
                    style={{
                        fontSize: 'clamp(14px, 1.2vw, 17px)',
                        lineHeight: 1.5,
                        color: 'var(--color-ink)',
                        opacity: 0,
                        margin: 0,
                        marginTop: 'clamp(12px, 1.5vw, 20px)',
                        paddingLeft: 'clamp(40px, 5vw, 70px)',
                        maxWidth: '48ch',
                        transform: 'translateY(8px)',
                        willChange: 'transform, opacity',
                    }}
                >
                    {service.brief}
                </p>
            </div>
        </div>
    )
}
