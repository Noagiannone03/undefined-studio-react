import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import vagoImg from '../assets/images/vago-illustrations/interface-open.jpeg'
import whispImg from '../assets/images/whisp/homescreen.png'

type Project = {
    id: string
    name: string
    categorySerif: string
    year: string
    tags: string[]
    accent: string
    description: string
    img: string
    imgAlt: string
    flip?: boolean
}

const PROJECTS: Project[] = [
    {
        id: '01',
        name: 'VAGO',
        categorySerif: 'Product Design & Motion',
        year: '2024',
        tags: ['iOS App', 'Brand', 'Motion'],
        accent: 'var(--color-klein)',
        description:
            'Hyperlocal discovery app that connects people with experiences around them — a new way to move through the city.',
        img: vagoImg,
        imgAlt: 'Vago app interface',
        flip: false,
    },
    {
        id: '02',
        name: 'WHISP',
        categorySerif: 'Brand Identity & UX',
        year: '2024',
        tags: ['iOS App', 'UX/UI', 'Brand'],
        accent: 'var(--color-tomato)',
        description:
            'A new kind of ephemeral messaging where moments disappear beautifully — presence without permanence.',
        img: whispImg,
        imgAlt: 'Whisp app homescreen',
        flip: true,
    },
]

export default function Work() {
    const sectionRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const track = trackRef.current
            const section = sectionRef.current
            if (!track || !section) return

            // Main horizontal scroll tween
            const hTween = gsap.to(track, {
                x: () => -(track.scrollWidth - window.innerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: () => `+=${track.scrollWidth - window.innerWidth}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            })

            // Per-panel animations via containerAnimation
            const panels = track.querySelectorAll<HTMLElement>('.work-panel')
            panels.forEach((panel) => {
                const textLines = panel.querySelectorAll<HTMLElement>('.panel-reveal')
                const imgFrame = panel.querySelector<HTMLElement>('.panel-img-frame')

                if (textLines.length) {
                    gsap.from(textLines, {
                        yPercent: 80,
                        opacity: 0,
                        duration: 0.9,
                        stagger: 0.06,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: hTween,
                            start: 'left 85%',
                            toggleActions: 'play none none none',
                        },
                    })
                }

                if (imgFrame) {
                    gsap.fromTo(
                        imgFrame,
                        { clipPath: 'inset(0 100% 0 0)' },
                        {
                            clipPath: 'inset(0 0% 0 0)',
                            duration: 1.3,
                            ease: 'expo.out',
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: hTween,
                                start: 'left 75%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                }
            })

            // Section header reveal
            gsap.from('.work-section-header > *', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.07,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    once: true,
                },
            })

            // Silence unused-import warning; ScrollTrigger is registered globally in App
            void ScrollTrigger

            return () => {
                hTween.scrollTrigger?.kill()
            }
        },
        { scope: sectionRef }
    )

    return (
        <section
            ref={sectionRef}
            id="work"
            style={{ background: 'var(--color-paper)', overflow: 'hidden' }}
        >
            {/* Section header */}
            <div
                className="container-x work-section-header"
                style={{
                    paddingTop: 'clamp(64px, 8vw, 120px)',
                    paddingBottom: 'clamp(32px, 4vw, 56px)',
                }}
            >
                <div className="flex items-end justify-between hair-b pb-6">
                    <div>
                        <span
                            className="mono label-soft"
                            style={{ display: 'block', marginBottom: 12 }}
                        >
                            ( 02 ) — Portfolio
                        </span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(44px, 7vw, 104px)',
                                lineHeight: 0.9,
                                margin: 0,
                            }}
                        >
                            SELECTED{' '}
                            <span
                                className="serif-italic"
                                style={{ color: 'var(--color-ink)' }}
                            >
                                work
                            </span>
                        </h2>
                    </div>
                    <span className="mono label-soft" style={{ paddingBottom: 8 }}>
                        0{PROJECTS.length} PROJECTS
                    </span>
                </div>
            </div>

            {/* Horizontal track */}
            <div
                ref={trackRef}
                style={{
                    display: 'flex',
                    width: 'max-content',
                    paddingBottom: 'clamp(40px, 6vw, 80px)',
                }}
            >
                {PROJECTS.map((p) => (
                    <ProjectPanel key={p.id} project={p} />
                ))}
            </div>
        </section>
    )
}

function ProjectPanel({ project }: { project: Project }) {
    return (
        <article
            className="work-panel"
            style={{
                width: '100vw',
                display: 'flex',
                flexDirection: project.flip ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 'clamp(40px, 6vw, 80px)',
                padding: '0 var(--side-spacing)',
                paddingTop: 'clamp(32px, 4vw, 64px)',
            }}
        >
            {/* Text column */}
            <div
                style={{
                    flex: '0 0 44%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(16px, 2vw, 28px)',
                }}
            >
                {/* Number */}
                <div style={{ overflow: 'hidden' }}>
                    <span
                        className="mono panel-reveal"
                        style={{
                            display: 'inline-block',
                            fontSize: 11,
                            letterSpacing: '0.25em',
                            color: project.accent,
                        }}
                    >
                        {project.id} / 0{PROJECTS.length}
                    </span>
                </div>

                {/* Project name — MASSIVE */}
                <div style={{ overflow: 'hidden' }}>
                    <h3
                        className="display panel-reveal"
                        style={{
                            fontSize: 'clamp(64px, 9vw, 140px)',
                            lineHeight: 0.88,
                            letterSpacing: '-0.045em',
                            margin: 0,
                        }}
                    >
                        {project.name}
                    </h3>
                </div>

                {/* Category — serif italic contrast */}
                <div style={{ overflow: 'hidden' }}>
                    <p
                        className="serif-italic panel-reveal"
                        style={{
                            fontSize: 'clamp(20px, 2vw, 28px)',
                            lineHeight: 1.2,
                            margin: 0,
                            color: 'rgba(14,14,12,0.64)',
                        }}
                    >
                        {project.categorySerif}
                    </p>
                </div>

                {/* Description */}
                <div style={{ overflow: 'hidden' }}>
                    <p
                        className="panel-reveal"
                        style={{
                            fontSize: 'clamp(15px, 1.3vw, 18px)',
                            lineHeight: 1.55,
                            margin: 0,
                            maxWidth: 420,
                        }}
                    >
                        {project.description}
                    </p>
                </div>

                {/* Tags + year */}
                <div
                    className="panel-reveal flex items-center gap-3 flex-wrap"
                    style={{ marginTop: 8 }}
                >
                    {project.tags.map((tag) => (
                        <span
                            key={tag}
                            className="mono"
                            style={{
                                padding: '5px 12px',
                                border: `1px solid ${project.accent}`,
                                fontSize: 10,
                                letterSpacing: '0.18em',
                                color: project.accent,
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                    <span
                        className="mono label-soft"
                        style={{ marginLeft: 16, fontSize: 11 }}
                    >
                        {project.year}
                    </span>
                </div>
            </div>

            {/* Image column */}
            <div style={{ flex: '0 0 52%' }}>
                <div
                    className="panel-img-frame"
                    style={{
                        border: '2px solid var(--color-ink)',
                        boxShadow: `10px 10px 0 ${project.accent}`,
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                    }}
                >
                    <img
                        src={project.img}
                        alt={project.imgAlt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                </div>
            </div>
        </article>
    )
}
