import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import vagoInterface from '../../assets/images/vago-illustrations/interface-open.jpeg'
import vagoNoTrip from '../../assets/images/vago-illustrations/no-trip-interface.png'
import vagoStreak from '../../assets/images/vago-illustrations/streak.jpeg'
import whispHome from '../../assets/images/whisp/homescreen.png'
import whispDiscussion from '../../assets/images/whisp/discussion.png'
import whispProfile from '../../assets/images/whisp/detail-profile.png'

type Project = {
    id: string
    name: string
    year: string
    role: string
    client: string
    stack: string[]
    summary: string
    accent: string
    screens: { src: string; alt: string }[]
}

const PROJECTS: Project[] = [
    {
        id: '01',
        name: 'VAGO',
        year: '2024',
        role: 'Conception, identité, dev iOS',
        client: 'Indépendant',
        stack: ['SwiftUI', 'Figma', 'After Effects'],
        summary:
            "Abandonner la voiture solo, c'est un geste — il mérite mieux qu'une énième app générique. On a construit un système de streaks qui ancre l'habitude au quotidien, et une direction artistique assez nette pour donner envie de s'y tenir.",
        accent: 'var(--color-klein)',
        screens: [
            { src: vagoInterface, alt: 'Vago — interface ouverte' },
            { src: vagoStreak, alt: 'Vago — vue streak' },
            { src: vagoNoTrip, alt: 'Vago — état vide' },
        ],
    },
    {
        id: '02',
        name: 'WHISP',
        year: '2024',
        role: 'Produit de bout en bout',
        client: 'Whisp Labs',
        stack: ['iOS', 'Figma', 'Principle'],
        summary:
            "Un réseau social vocal, pensé pour ne pas reproduire la toxicité des autres. Le défi : donner au produit une identité forte — couleur, typographie, signature sonore — sans jamais alourdir l'usage. Chaque écran tient debout tout seul.",
        accent: 'var(--color-tomato)',
        screens: [
            { src: whispHome, alt: 'Whisp — accueil' },
            { src: whispDiscussion, alt: 'Whisp — discussion' },
            { src: whispProfile, alt: 'Whisp — profil' },
        ],
    },
]

export default function Work() {
    return (
        <section id="work" className="work-section">
            {PROJECTS.map((p, i) => (
                <ProjectEditorial key={p.id} project={p} index={i} />
            ))}
        </section>
    )
}

function ProjectEditorial({ project, index }: { project: Project; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const spineRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ctx = gsap.context(() => {
            gsap.from(el.querySelectorAll('.ed-reveal'), {
                yPercent: 110,
                duration: 1.1,
                ease: 'expo.out',
                stagger: 0.08,
                scrollTrigger: { trigger: el, start: 'top 72%', once: true },
            })

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

            gsap.from(el.querySelectorAll<HTMLElement>('.ed-screen'), {
                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out',
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: 'top 72%', once: true },
            })

            // Desktop-only parallax — scrubs are expensive on mobile GPU.
            const mm = gsap.matchMedia()
            mm.add('(min-width: 900px) and (hover: hover)', () => {
                const heroScreen = el.querySelector<HTMLElement>('.project-hero-screen')
                const sideLeft = el.querySelector<HTMLElement>('.project-side-left .project-side-img')
                const sideRight = el.querySelector<HTMLElement>('.project-side-right .project-side-img')
                const outline = el.querySelector<HTMLElement>('.ed-outline')

                if (heroScreen) {
                    gsap.to(heroScreen, {
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
                if (sideLeft) {
                    gsap.to(sideLeft, {
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
                if (sideRight) {
                    gsap.to(sideRight, {
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
                if (outline) {
                    gsap.fromTo(
                        outline,
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
            })
        }, el)

        return () => ctx.revert()
    }, [])

    const reversed = index % 2 === 1

    return (
        <div
            ref={ref}
            className="project-editorial"
            data-project={project.id}
            data-reversed={reversed || undefined}
        >
            <p
                className="ed-outline display project-outline"
                aria-hidden
                style={{
                    WebkitTextStroke: `1.5px ${project.accent}`,
                }}
            >
                {project.name}
            </p>

            <div className="project-main-grid">
                <div className="project-copy-col">
                    <div>
                        <div style={{ overflow: 'hidden' }}>
                            <h3
                                className="ed-reveal project-title"
                                style={{ color: project.accent }}
                            >
                                {project.name}
                            </h3>
                        </div>
                        <div style={{ overflow: 'hidden', marginTop: 'clamp(16px, 2vw, 28px)' }}>
                            <p className="ed-reveal project-summary serif">
                                {project.summary}
                            </p>
                        </div>
                    </div>

                    <div className="project-meta-grid">
                        <MetaCol label="Rôle" value={project.role} />
                        <MetaCol label="Client" value={project.client} />
                        <MetaCol label="Outils" value={project.stack.join(' · ')} />
                    </div>
                </div>

                <div className="project-hero-col">
                    <div
                        ref={spineRef}
                        className="project-spine"
                        aria-hidden
                        style={{ background: project.accent, transformOrigin: 'bottom' }}
                    />
                    <div
                        className="ed-screen project-hero-screen"
                        style={{ backgroundImage: `url(${project.screens[0].src})` }}
                        role="img"
                        aria-label={project.screens[0].alt}
                    />
                </div>
            </div>

            <div className="project-secondary-grid">
                <div className="project-side project-side-left">
                    <div
                        className="ed-screen project-side-img"
                        style={{ backgroundImage: `url(${project.screens[1].src})` }}
                        role="img"
                        aria-label={project.screens[1].alt}
                    />
                </div>

                <div className="project-caption">
                    <span className="mono label-soft" style={{ display: 'block', marginBottom: 8 }}>
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

                <div className="project-side project-side-right">
                    <div
                        className="ed-screen project-side-img"
                        style={{ backgroundImage: `url(${project.screens[2].src})` }}
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

