import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Service = {
    id: string
    name: string
    tools: string
    accent: string
    description: string
}

const SERVICES: Service[] = [
    {
        id: '01',
        name: 'PRODUCT DESIGN',
        tools: 'UX / UI · Systems · Interaction',
        accent: 'var(--color-klein)',
        description:
            'We design interfaces that feel inevitable — from rough concepts to pixel-perfect systems. Every interaction is intentional.',
    },
    {
        id: '02',
        name: 'DEVELOPMENT',
        tools: 'iOS · React · Node · APIs',
        accent: 'var(--color-tomato)',
        description:
            'Full-stack product development. We build iOS apps, web platforms, and the APIs that connect them. We ship, fast.',
    },
    {
        id: '03',
        name: 'MOTION & CODE',
        tools: 'GSAP · WebGL · R3F · Canvas',
        accent: 'var(--color-klein)',
        description:
            'Animation and code as design tools. From microinteractions to full immersive WebGL experiences, we bring interfaces to life.',
    },
    {
        id: '04',
        name: 'BRAND IDENTITY',
        tools: 'Visual · Typography · Direction',
        accent: 'var(--color-ink)',
        description:
            'Visual identity systems built to last. Logotype, typography, color, motion — a coherent language for your product.',
    },
]

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.services-header > *', {
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
            gsap.from('.service-card', {
                y: 48,
                opacity: 0,
                duration: 0.7,
                stagger: 0.09,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
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
            className="container-x section-y"
            style={{ background: 'var(--color-paper)' }}
        >
            {/* Header */}
            <div
                className="services-header"
                style={{ marginBottom: 'clamp(40px, 5vw, 72px)' }}
            >
                <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                    ( 03 ) — Our craft
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
                    WHAT WE{' '}
                    <span className="serif-italic" style={{ letterSpacing: '-0.02em' }}>
                        build.
                    </span>
                </h2>
            </div>

            {/* 2×2 grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    border: '1px solid var(--color-hair)',
                }}
            >
                {SERVICES.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </section>
    )
}

function ServiceCard({ service }: { service: Service }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const fillRef = useRef<HTMLDivElement>(null)
    const numRef = useRef<HTMLSpanElement>(null)
    const nameRef = useRef<HTMLHeadingElement>(null)
    const toolsRef = useRef<HTMLSpanElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const arrowRef = useRef<HTMLSpanElement>(null)

    const textEls = (): HTMLElement[] =>
        [numRef.current, nameRef.current, toolsRef.current, descRef.current, arrowRef.current].filter(
            (el): el is HTMLElement => el !== null
        )

    const onEnter = () => {
        gsap.to(fillRef.current, {
            scaleY: 1,
            duration: 0.5,
            ease: 'expo.out',
        })
        gsap.to(textEls(), {
            color: 'var(--color-paper)',
            duration: 0.22,
            ease: 'none',
        })
    }

    const onLeave = () => {
        gsap.to(fillRef.current, {
            scaleY: 0,
            duration: 0.42,
            ease: 'power3.in',
        })
        gsap.to(textEls(), {
            color: 'var(--color-ink)',
            duration: 0.22,
            ease: 'none',
        })
    }

    return (
        <div
            ref={cardRef}
            className="service-card"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                border: '1px solid var(--color-hair)',
                padding: 'clamp(28px, 3.5vw, 52px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'clamp(240px, 28vw, 360px)',
            }}
        >
            {/* Fill bg */}
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

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Numéro */}
                <span
                    ref={numRef}
                    className="mono"
                    style={{
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        color: 'var(--color-ink)',
                        opacity: 0.4,
                    }}
                >
                    {service.id}
                </span>

                {/* Nom */}
                <h3
                    ref={nameRef}
                    className="display"
                    style={{
                        fontSize: 'clamp(26px, 3vw, 48px)',
                        lineHeight: 0.9,
                        letterSpacing: '-0.04em',
                        color: 'var(--color-ink)',
                        margin: 'clamp(20px, 3vw, 36px) 0 clamp(10px, 1.5vw, 16px) 0',
                    }}
                >
                    {service.name}
                </h3>

                {/* Stack tools */}
                <span
                    ref={toolsRef}
                    className="mono"
                    style={{
                        fontSize: 10,
                        letterSpacing: '0.16em',
                        color: 'var(--color-ink)',
                        opacity: 0.5,
                    }}
                >
                    {service.tools}
                </span>

                {/* Description */}
                <p
                    ref={descRef}
                    className="serif"
                    style={{
                        fontSize: 'clamp(13px, 1.2vw, 16px)',
                        lineHeight: 1.55,
                        color: 'var(--color-ink)',
                        opacity: 0.75,
                        margin: 'clamp(14px, 2vw, 24px) 0 0 0',
                        maxWidth: 340,
                        flex: 1,
                    }}
                >
                    {service.description}
                </p>

                {/* Arrow */}
                <div style={{ marginTop: 'clamp(16px, 2vw, 28px)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span
                        ref={arrowRef}
                        style={{
                            color: 'var(--color-ink)',
                            fontSize: 20,
                            opacity: 0.6,
                        }}
                    >
                        →
                    </span>
                </div>
            </div>
        </div>
    )
}
