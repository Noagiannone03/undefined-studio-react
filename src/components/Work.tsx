import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import vagoInterface from '../assets/images/vago-illustrations/interface-open.jpeg'
import vagoNoTrip from '../assets/images/vago-illustrations/no-trip-interface.png'
import vagoStreak from '../assets/images/vago-illustrations/streak.jpeg'
import whispHome from '../assets/images/whisp/homescreen.png'
import whispDiscussion from '../assets/images/whisp/discussion.png'
import whispProfile from '../assets/images/whisp/detail-profile.png'

type Project = {
    id: string
    name: string
    category: string
    year: string
    role: string
    client: string
    stack: string[]
    summary: string
    accent: string
    iconSrc?: string
    screens: { src: string; alt: string }[]
}

const PROJECTS: Project[] = [
    {
        id: '01',
        name: 'VAGO',
        category: 'Produit & Motion',
        year: '2024',
        role: 'Design, branding, dev iOS',
        client: 'Indépendant',
        stack: ['SwiftUI', 'Figma', 'After Effects'],
        summary:
            "Une application qui dépoussière le trajet quotidien. Nous avons bâti un système de streaks addictif et un design percutant pour valoriser ceux qui lâchent la voiture solo.",
        accent: 'var(--color-klein)',
        iconSrc: undefined,
        screens: [
            { src: vagoInterface, alt: 'Vago — interface ouverte' },
            { src: vagoStreak, alt: 'Vago — vue streak' },
            { src: vagoNoTrip, alt: 'Vago — état vide' },
        ],
    },
    {
        id: '02',
        name: 'WHISP',
        category: 'Identité & UX',
        year: '2024',
        role: 'Design produit complet',
        client: 'Whisp Labs',
        stack: ['iOS', 'Figma', 'Principle'],
        summary:
            "Un réseau social vocal délesté de la toxicité ambiante. L'enjeu : imposer une identité visuelle forte tout en conservant une fluidité d'usage absolue sur iOS.",
        accent: 'var(--color-tomato)',
        iconSrc: undefined,
        screens: [
            { src: whispHome, alt: 'Whisp — accueil' },
            { src: whispDiscussion, alt: 'Whisp — discussion' },
            { src: whispProfile, alt: 'Whisp — profil' },
        ],
    },
]

export default function Work() {
    const sectionRef = useRef<HTMLElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const counterRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const header = headerRef.current
        if (!header) return

        const ctx = gsap.context(() => {
            // Counter — ticks from 00 to 02
            if (counterRef.current) {
                const obj = { n: 0 }
                gsap.to(obj, {
                    n: PROJECTS.length,
                    duration: 1.4,
                    ease: 'power3.out',
                    onUpdate: () => {
                        if (counterRef.current) {
                            counterRef.current.textContent = String(
                                Math.round(obj.n)
                            ).padStart(2, '0')
                        }
                    },
                    scrollTrigger: { trigger: header, start: 'top 80%', once: true },
                })
            }

            gsap.from('.wh-side', {
                y: 16,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: header, start: 'top 80%', once: true },
            })
        }, header)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="work" className="work-section" style={{ background: 'var(--color-paper)' }}>
            {/* Header — minimal, BrandMark above serves as intro */}
            <div
                ref={headerRef}
                className="container-x work-header hair-b"
                style={{
                    paddingTop: 'clamp(40px, 5vw, 64px)',
                    paddingBottom: 'clamp(32px, 4vw, 56px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 32,
                    flexWrap: 'wrap',
                    position: 'relative',
                }}
            >
                <span
                    className="mono label-soft"
                    style={{ fontSize: 11 }}
                >
                    ( 02 ) — Nos projets
                </span>

                <div
                    className="wh-side"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <span
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 3vw, 48px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            color: 'var(--color-klein)',
                        }}
                    >
                        <span ref={counterRef}>00</span>
                        <span
                            style={{
                                fontSize: '0.4em',
                                color: 'var(--color-ink-mute)',
                                marginLeft: 6,
                                verticalAlign: 'super',
                            }}
                        >
                            / 02
                        </span>
                    </span>
                </div>
            </div>

            {PROJECTS.map((p, i) => (
                <ProjectEditorial key={p.id} project={p} index={i} />
            ))}
        </section>
    )
}

function ProjectEditorial({ project, index }: { project: Project; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const heroScreenRef = useRef<HTMLDivElement>(null)
    const spineRef = useRef<HTMLDivElement>(null)
    const sideScreen1Ref = useRef<HTMLDivElement>(null)
    const sideScreen2Ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ctx = gsap.context(() => {
            // Title & meta wipe
            gsap.from(el.querySelectorAll('.ed-reveal'), {
                yPercent: 110,
                duration: 1.1,
                ease: 'expo.out',
                stagger: 0.08,
                scrollTrigger: { trigger: el, start: 'top 72%', once: true },
            })

            // Coloured spine grows up from bottom
            if (spineRef.current) {
                gsap.fromTo(
                    spineRef.current,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        duration: 1.3,
                        ease: 'expo.out',
                        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
                    }
                )
            }

            // Hero screen — reveal from bottom
            if (heroScreenRef.current) {
                gsap.fromTo(
                    heroScreenRef.current,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.3,
                        ease: 'expo.out',
                        delay: 0.15,
                        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
                    }
                )
            }

            // Side screens — staggered fade in
            gsap.from([sideScreen1Ref.current, sideScreen2Ref.current], {
                y: 50,
                opacity: 0,
                duration: 1.1,
                ease: 'expo.out',
                stagger: 0.12,
                delay: 0.3,
                scrollTrigger: { trigger: el, start: 'top 65%', once: true },
            })

            // Parallax on hero — subtle, screens stay "posed"
            if (heroScreenRef.current) {
                gsap.to(heroScreenRef.current, {
                    yPercent: -6,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5,
                    },
                })
            }
            // Side screens parallax — slightly different rates
            if (sideScreen1Ref.current) {
                gsap.to(sideScreen1Ref.current, {
                    yPercent: -10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.8,
                    },
                })
            }
            if (sideScreen2Ref.current) {
                gsap.to(sideScreen2Ref.current, {
                    yPercent: -3,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 2,
                    },
                })
            }

            // Giant outlined name drifts horizontally
            const name = el.querySelector('.ed-outline')
            if (name) {
                gsap.fromTo(
                    name,
                    { xPercent: -3 },
                    {
                        xPercent: 3,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.5,
                        },
                    }
                )
            }
        }, el)

        return () => {
            ctx.revert()
            ScrollTrigger.getAll()
                .filter((t) => t.vars.trigger === el)
                .forEach((t) => t.kill())
        }
    }, [])

    const reversed = index % 2 === 1

    return (
        <div
            ref={ref}
            className="project-editorial"
            data-project={project.id}
            style={{
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
                padding:
                    'clamp(80px, 12vw, 160px) var(--side-spacing) clamp(80px, 12vw, 160px)',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid var(--color-hair)',
            }}
        >
            {/* Giant outlined name — drifts in background */}
            <p
                className="ed-outline display project-outline"
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 'clamp(240px, 38vw, 680px)',
                    letterSpacing: '-0.06em',
                    lineHeight: 0.8,
                    margin: 0,
                    color: 'transparent',
                    WebkitTextStroke: `1.5px ${project.accent}`,
                    opacity: 0.28,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 0,
                    userSelect: 'none',
                }}
            >
                {project.name}
            </p>

            {/* Top meta row */}
            <div
                className="project-meta-row"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                    borderBottom: '1px solid var(--color-hair)',
                    paddingBottom: 'clamp(16px, 2vw, 24px)',
                    marginBottom: 'clamp(40px, 6vw, 80px)',
                    flexWrap: 'wrap',
                    gap: 20,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Icon slot — falls back to coloured dot */}
                    {project.iconSrc ? (
                        <img
                            src={project.iconSrc}
                            alt={`${project.name} icon`}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                objectFit: 'cover',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                            }}
                        />
                    ) : (
                        <span
                            aria-hidden
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: project.accent,
                                display: 'inline-block',
                            }}
                        />
                    )}
                    <span
                        className="mono"
                        style={{
                            color: 'var(--color-ink)',
                            opacity: 0.6,
                            fontSize: 11,
                            letterSpacing: '0.22em',
                        }}
                    >
                        {project.id} / 02 — {project.year}
                    </span>
                </div>
                <span
                    className="serif-italic"
                    style={{
                        color: 'var(--color-ink-soft)',
                        fontSize: 'clamp(15px, 1.4vw, 19px)',
                    }}
                >
                    {project.category}
                </span>
            </div>

            {/* Main grid — title + hero screen with coloured spine */}
            <div
                className="project-main-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 'clamp(16px, 2.5vw, 40px)',
                    position: 'relative',
                    zIndex: 2,
                    alignItems: 'stretch',
                }}
            >
                {/* Title column */}
                <div
                    className="project-copy-col"
                    style={{
                        gridColumn: reversed ? '7 / span 6' : '1 / span 6',
                        order: reversed ? 2 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingTop: 'clamp(16px, 3vw, 40px)',
                        paddingBottom: 'clamp(16px, 3vw, 40px)',
                    }}
                >
                    <div>
                        <div style={{ overflow: 'hidden' }}>
                            <h3
                                className="ed-reveal display"
                                style={{
                                    fontSize: 'clamp(56px, 8vw, 128px)',
                                    lineHeight: 0.85,
                                    letterSpacing: '-0.05em',
                                    margin: 0,
                                    color: project.accent,
                                }}
                            >
                                {project.name}
                            </h3>
                        </div>
                        <div style={{ overflow: 'hidden', marginTop: 'clamp(16px, 2vw, 28px)' }}>
                            <p
                                className="ed-reveal serif"
                                style={{
                                    fontSize: 'clamp(18px, 1.6vw, 24px)',
                                    lineHeight: 1.4,
                                    maxWidth: '36ch',
                                    margin: 0,
                                    color: 'var(--color-ink)',
                                }}
                            >
                                {project.summary}
                            </p>
                        </div>
                    </div>

                    {/* Meta row under title */}
                    <div
                        className="project-meta-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 'clamp(12px, 2vw, 24px)',
                            marginTop: 'clamp(32px, 4vw, 56px)',
                            paddingTop: 'clamp(18px, 2vw, 24px)',
                            borderTop: '1px solid var(--color-hair)',
                        }}
                    >
                        <MetaCol label="Rôle" value={project.role} />
                        <MetaCol label="Client" value={project.client} />
                        <MetaCol label="Outils" value={project.stack.join(' · ')} />
                    </div>
                </div>

                {/* Hero screen with coloured spine */}
                <div
                    className="project-hero-col"
                    style={{
                        gridColumn: reversed ? '1 / span 6' : '7 / span 6',
                        order: reversed ? 1 : 2,
                        position: 'relative',
                        minHeight: 'clamp(380px, 55vh, 620px)',
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: reversed ? 'flex-end' : 'flex-start',
                    }}
                >
                    {/* Coloured spine — grows from bottom */}
                    <div
                        ref={spineRef}
                        className="project-spine"
                        aria-hidden
                        style={{
                            position: 'absolute',
                            [reversed ? 'right' : 'left']: '8%',
                            top: 0,
                            bottom: 0,
                            width: '78%',
                            background: project.accent,
                            transformOrigin: 'bottom',
                            zIndex: 0,
                        }}
                    />
                    {/* Hero screen — portrait, centred on spine */}
                    <div
                        ref={heroScreenRef}
                        className="project-hero-screen"
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            height: '100%',
                            aspectRatio: '9/19.5',
                            margin: reversed ? '0 14% 0 auto' : '0 auto 0 14%',
                            borderRadius: 34,
                            overflow: 'hidden',
                            backgroundImage: `url(${project.screens[0].src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            boxShadow:
                                '0 50px 110px rgba(0,0,0,0.28), 0 20px 40px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
                            border: '6px solid var(--color-ink)',
                            outline: '1px solid rgba(14,14,12,0.08)',
                        }}
                        role="img"
                        aria-label={project.screens[0].alt}
                    />
                </div>
            </div>

            {/* Secondary screens row */}
            <div
                className="project-secondary-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 'clamp(16px, 2.5vw, 40px)',
                    marginTop: 'clamp(64px, 8vw, 120px)',
                    position: 'relative',
                    zIndex: 2,
                    alignItems: 'start',
                }}
            >
                {/* Second screen */}
                <div
                    className="project-side project-side-left"
                    style={{
                        gridColumn: reversed ? '2 / span 4' : '2 / span 4',
                        aspectRatio: '9/19.5',
                        position: 'relative',
                        minHeight: 'clamp(300px, 42vh, 480px)',
                    }}
                >
                    <div
                        ref={sideScreen1Ref}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${project.screens[1].src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            borderRadius: 28,
                            boxShadow:
                                '0 36px 80px rgba(0,0,0,0.18), 0 14px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
                            border: '5px solid var(--color-ink)',
                        }}
                        role="img"
                        aria-label={project.screens[1].alt}
                    />
                </div>

                {/* Caption for this pair */}
                <div
                    className="project-caption"
                    style={{
                        gridColumn: '6 / span 2',
                        alignSelf: 'center',
                        textAlign: 'center',
                    }}
                >
                    <span
                        className="mono label-soft"
                        style={{ display: 'block', marginBottom: 8 }}
                    >
                        FIG. {project.id}
                    </span>
                    <span
                        className="serif-italic"
                        style={{
                            fontSize: 'clamp(14px, 1.2vw, 17px)',
                            color: 'var(--color-ink-soft)',
                        }}
                    >
                        Dans l'app
                    </span>
                </div>

                {/* Third screen */}
                <div
                    className="project-side project-side-right"
                    style={{
                        gridColumn: '8 / span 4',
                        aspectRatio: '9/19.5',
                        position: 'relative',
                        minHeight: 'clamp(300px, 42vh, 480px)',
                    }}
                >
                    <div
                        ref={sideScreen2Ref}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${project.screens[2].src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            borderRadius: 28,
                            boxShadow:
                                '0 36px 80px rgba(0,0,0,0.18), 0 14px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
                            border: '5px solid var(--color-ink)',
                        }}
                        role="img"
                        aria-label={project.screens[2].alt}
                    />
                </div>
            </div>
        </div>
    )
}

function MetaCol({ label, value }: { label: string; value: string }) {
    return (
        <div className="project-meta-col" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
                className="mono"
                style={{
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: 'var(--color-ink-mute)',
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    color: 'var(--color-ink)',
                    lineHeight: 1.35,
                }}
            >
                {value}
            </span>
        </div>
    )
}
