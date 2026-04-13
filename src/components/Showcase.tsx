import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IPhoneMockup } from 'react-device-mockup'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import vagoInterfaceOpen from '../assets/images/vago-illustrations/interface-open.jpeg'
import vagoNoTripInterface from '../assets/images/vago-illustrations/no-trip-interface.png'
import vagoRoad from '../assets/images/vago-illustrations/road.jpg'
import vagoStreak from '../assets/images/vago-illustrations/streak.jpeg'
import whispDetailProfile from '../assets/images/whisp/detail-profile.png'
import whispDiscussion from '../assets/images/whisp/discussion.png'
import whispHomescreen from '../assets/images/whisp/homescreen.png'
import whispMap from '../assets/images/whisp/map.jpeg'

type Project = {
    n: string
    name: string
    year: string
    tagline: string
    discipline: string
    slides: string[]
    wash: '#1D1DBF' | '#E84A2A'
    on: '#EFEBDD'
}

const PROJECTS: Project[] = [
    {
        n: '01',
        name: 'Vago',
        year: '2025',
        tagline: 'A driving loop wrapped in play.',
        discipline: 'Mobile · Game',
        slides: [vagoInterfaceOpen, vagoNoTripInterface, vagoRoad, vagoStreak],
        wash: '#1D1DBF',
        on: '#EFEBDD',
    },
    {
        n: '02',
        name: 'Whisp',
        year: '2026',
        tagline: 'Real social, without algorithm.',
        discipline: 'Mobile · Real-time',
        slides: [whispHomescreen, whispDiscussion, whispDetailProfile, whispMap],
        wash: '#E84A2A',
        on: '#EFEBDD',
    },
]

function Slideshow({ images, interval = 2600 }: { images: string[]; interval?: number }) {
    const [i, setI] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setI(p => (p + 1) % images.length), interval)
        return () => clearInterval(id)
    }, [images.length, interval])
    return (
        <div className="relative w-full h-full bg-ink">
            {images.map((src, idx) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: idx === i ? 1 : 0 }}
                />
            ))}
        </div>
    )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
    const cardRef = useRef<HTMLElement>(null)
    const washRef = useRef<HTMLDivElement>(null)
    const phoneRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const card = cardRef.current
        if (!card) return
        const ctx = gsap.context(() => {
            // reveal
            gsap.fromTo(
                phoneRef.current,
                { y: 80, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%' } }
            )
            const lines = textRef.current?.querySelectorAll('.reveal-line')
            if (lines) {
                gsap.fromTo(lines, { yPercent: 110 }, {
                    yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
                    scrollTrigger: { trigger: card, start: 'top 75%' },
                })
            }
        }, card)

        // Mouse position → phone tilt + wash position
        const onMove = (e: MouseEvent) => {
            const r = card.getBoundingClientRect()
            const mx = (e.clientX - r.left) / r.width
            const my = (e.clientY - r.top) / r.height
            if (washRef.current) {
                washRef.current.style.setProperty('--mx', `${mx * 100}%`)
                washRef.current.style.setProperty('--my', `${my * 100}%`)
            }
            if (phoneRef.current) {
                const tx = (mx - 0.5) * 14
                const ty = (my - 0.5) * 10
                gsap.to(phoneRef.current, { rotateY: tx, rotateX: -ty, duration: 0.6, ease: 'power3.out', transformPerspective: 900 })
            }
        }
        const onEnter = () => {
            if (washRef.current) gsap.to(washRef.current, { opacity: 1, duration: 0.7, ease: 'power3.out' })
        }
        const onLeave = () => {
            if (washRef.current) gsap.to(washRef.current, { opacity: 0, duration: 0.6, ease: 'power3.out' })
            if (phoneRef.current) gsap.to(phoneRef.current, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)' })
        }
        card.addEventListener('mousemove', onMove)
        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mouseleave', onLeave)
        return () => {
            ctx.revert(); ScrollTrigger.refresh()
            card.removeEventListener('mousemove', onMove)
            card.removeEventListener('mouseenter', onEnter)
            card.removeEventListener('mouseleave', onLeave)
        }
    }, [])

    return (
        <article
            ref={cardRef}
            className="group relative container-x py-20 md:py-32 hair-t overflow-hidden transition-colors duration-700"
            style={{ willChange: 'background-color' }}
        >
            {/* color wash */}
            <div
                ref={washRef}
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-0"
                style={{
                    background: `radial-gradient(900px circle at var(--mx,50%) var(--my,50%), ${project.wash} 0%, ${project.wash}00 70%)`,
                }}
            />

            <div className="relative grid grid-cols-12 gap-y-14 gap-x-6 md:gap-x-10 items-center">
                {/* Phone */}
                <div className={`col-span-12 md:col-span-5 flex justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div
                        ref={phoneRef}
                        className="w-[240px] md:w-[280px] transition-colors"
                        style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                    >
                        <IPhoneMockup
                            screenType="island"
                            screenWidth={280}
                            frameColor="#0E0E0C"
                            hideStatusBar
                            hideNavBar
                        >
                            <div className="w-full h-full overflow-hidden">
                                <Slideshow images={project.slides} interval={2600 + index * 400} />
                            </div>
                        </IPhoneMockup>
                    </div>
                </div>

                {/* Info */}
                <div ref={textRef} className={`col-span-12 md:col-span-7 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="label label-soft">{project.n}</span>
                        <span className="h-px flex-1 max-w-[120px] bg-ink/20 group-hover:bg-paper/40 transition-colors" />
                        <span className="label label-soft group-hover:text-paper/70 transition-colors">{project.discipline}</span>
                    </div>

                    <h3 className="display text-[18vw] md:text-[10vw] leading-[0.86] tracking-[-0.05em] mb-6">
                        <span className="reveal-mask">
                            <span className="reveal-line group-hover:text-paper transition-colors duration-500">{project.name}</span>
                        </span>
                    </h3>

                    <p className="serif-italic text-3xl md:text-4xl leading-[1.1] max-w-[20ch] mb-6 group-hover:text-paper transition-colors duration-500">
                        {project.tagline}
                    </p>

                    <div className="flex items-center gap-6 mt-10">
                        <a href="#" data-cursor="cta" data-cursor-label="open" className="btn-ghost group/btn group-hover:border-paper/60 group-hover:text-paper transition-colors">
                            View case
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover/btn:rotate-45 transition-transform">
                                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                        <span className="label label-soft group-hover:text-paper/70 transition-colors">{project.year}</span>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default function Showcase() {
    const ref = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const lines = titleRef.current?.querySelectorAll('.reveal-line')
            if (lines) {
                gsap.fromTo(lines, { yPercent: 110 }, {
                    yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
                    scrollTrigger: { trigger: titleRef.current, start: 'top 80%' },
                })
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <section ref={ref} id="work" className="relative bg-paper text-ink">
            <div className="container-x pt-32 md:pt-48 pb-16 md:pb-24 grid grid-cols-12 items-end gap-y-8">
                <div className="col-span-12 md:col-span-3">
                    <span className="label label-soft">Work · 2024 — 2026</span>
                </div>
                <h2 ref={titleRef} className="col-span-12 md:col-span-9 display text-[14vw] md:text-[8vw] leading-[0.88] tracking-[-0.045em]">
                    <span className="reveal-mask"><span className="reveal-line">Two apps,</span></span>
                    <span className="reveal-mask"><span className="reveal-line serif-italic">in the wild.</span></span>
                </h2>
            </div>

            <div className="flex flex-col">
                {PROJECTS.map((p, i) => (
                    <ProjectCard key={p.n} project={p} index={i} />
                ))}
            </div>
        </section>
    )
}
