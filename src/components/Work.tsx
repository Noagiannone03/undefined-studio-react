import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import vagoImg from '../assets/images/vago-illustrations/interface-open.jpeg'
import whispImg from '../assets/images/whisp/homescreen.png'

type Project = {
    id: string
    name: string
    category: string
    year: string
    tags: string[]
    bg: string
    textColor: string
    img: string
    imgAlt: string
    tilt: number
}

const PROJECTS: Project[] = [
    {
        id: '01',
        name: 'VAGO',
        category: 'Product Design & Motion',
        year: '2024',
        tags: ['iOS App', 'Brand', 'Motion'],
        bg: '#1D1DBF',
        textColor: '#EFEBDD',
        img: vagoImg,
        imgAlt: 'Vago app',
        tilt: -9,
    },
    {
        id: '02',
        name: 'WHISP',
        category: 'Brand Identity & UX',
        year: '2024',
        tags: ['iOS App', 'UX/UI', 'Brand'],
        bg: '#E84A2A',
        textColor: '#EFEBDD',
        img: whispImg,
        imgAlt: 'Whisp app',
        tilt: 7,
    },
]

export default function Work() {
    const sectionRef = useRef<HTMLElement>(null)

    return (
        <section ref={sectionRef} id="work" style={{ background: 'var(--color-paper)' }}>
            {/* Header */}
            <div
                className="container-x work-header hair-b"
                style={{
                    paddingTop: 'clamp(80px, 10vw, 140px)',
                    paddingBottom: 'clamp(32px, 4vw, 56px)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }}
            >
                <div>
                    <span className="mono label-soft" style={{ display: 'block', marginBottom: 12 }}>
                        ( 02 ) — Portfolio
                    </span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(44px, 7vw, 104px)',
                            lineHeight: 0.9,
                            margin: 0,
                            letterSpacing: '-0.045em',
                        }}
                    >
                        SELECTED <span className="serif-italic">work</span>
                    </h2>
                </div>
                <span className="mono label-soft" style={{ paddingBottom: 8 }}>
                    02 PROJECTS
                </span>
            </div>

            {/* Project sections */}
            {PROJECTS.map((p) => (
                <PosterSection key={p.id} project={p} />
            ))}
        </section>
    )
}

function PosterSection({ project }: { project: Project }) {
    const ref = useRef<HTMLDivElement>(null)
    const phoneWrapRef = useRef<HTMLDivElement>(null)
    const nameRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        const el = ref.current
        const wrap = phoneWrapRef.current
        const name = nameRef.current
        if (!el || !wrap || !name) return

        // Phone: reveal + scale entrée
        gsap.fromTo(
            wrap,
            { scale: 0.9, opacity: 0, y: 40 },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 1.4,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 75%', once: true },
            }
        )

        // Nom: wipe from left
        gsap.fromTo(
            name,
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.2,
                ease: 'expo.out',
                delay: 0.25,
                scrollTrigger: { trigger: el, start: 'top 75%', once: true },
            }
        )

        // Parallax léger sur le téléphone
        gsap.to(wrap, {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2,
            },
        })

        return () => {
            ScrollTrigger.getAll()
                .filter((t) => t.vars.trigger === el)
                .forEach((t) => t.kill())
        }
    }, [])

    return (
        <div
            ref={ref}
            data-poster={project.id}
            style={{
                background: project.bg,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(28px, 4vw, 52px) var(--side-spacing)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Top meta */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'clamp(24px, 4vh, 48px)',
                }}
            >
                <span
                    className="mono"
                    style={{
                        color: project.textColor,
                        opacity: 0.55,
                        fontSize: 11,
                        letterSpacing: '0.22em',
                    }}
                >
                    {project.id} / 02
                </span>
                <span
                    className="serif-italic"
                    style={{
                        color: project.textColor,
                        opacity: 0.7,
                        fontSize: 'clamp(14px, 1.3vw, 17px)',
                    }}
                >
                    {project.category}
                </span>
            </div>

            {/* Phone — centré, incliné, ombre brutale */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(16px, 3vh, 40px) 0',
                }}
            >
                <div ref={phoneWrapRef} style={{ position: 'relative', display: 'inline-block' }}>
                    {/* Ombre décalée style brutalist */}
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.28)',
                            transform: `rotate(${project.tilt}deg) translate(18px, 18px)`,
                            zIndex: 0,
                        }}
                    />
                    <img
                        src={project.img}
                        alt={project.imgAlt}
                        style={{
                            height: 'clamp(340px, 58vh, 640px)',
                            width: 'auto',
                            aspectRatio: '9/16',
                            objectFit: 'cover',
                            display: 'block',
                            transform: `rotate(${project.tilt}deg)`,
                            position: 'relative',
                            zIndex: 1,
                            boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
                            outline: '1px solid rgba(255,255,255,0.12)',
                        }}
                    />
                </div>
            </div>

            {/* Nom du projet — massif */}
            <div style={{ overflow: 'hidden' }}>
                <p
                    ref={nameRef}
                    className="display"
                    style={{
                        fontSize: 'clamp(72px, 18vw, 260px)',
                        lineHeight: 0.85,
                        letterSpacing: '-0.05em',
                        margin: 0,
                        color: project.textColor,
                    }}
                >
                    {project.name}
                </p>
            </div>

            {/* Bottom bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'clamp(16px, 2vw, 28px)',
                    paddingTop: 16,
                    borderTop: '1px solid rgba(239,235,221,0.2)',
                }}
            >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {project.tags.map((tag) => (
                        <span
                            key={tag}
                            className="mono"
                            style={{
                                padding: '4px 10px',
                                border: '1px solid rgba(239,235,221,0.35)',
                                color: project.textColor,
                                fontSize: 10,
                                letterSpacing: '0.18em',
                                opacity: 0.8,
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <span
                    className="mono"
                    style={{ color: project.textColor, opacity: 0.5, fontSize: 11 }}
                >
                    {project.year}
                </span>
            </div>
        </div>
    )
}
