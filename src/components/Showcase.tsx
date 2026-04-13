import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { IPhoneMockup } from 'react-device-mockup'
import Asterisk from './Asterisk'
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
    category: string
    slides: string[]
    bg: string
    text: string
    accent: string
}

const PROJECTS: Project[] = [
    {
        n: '01',
        name: 'Vago',
        year: '2025',
        tagline: 'Le jeu qui paie ton essence.',
        category: 'Mobile · Game Loop',
        slides: [vagoInterfaceOpen, vagoNoTripInterface, vagoRoad, vagoStreak],
        bg: 'bg-klein',
        text: 'text-paper',
        accent: 'tomato',
    },
    {
        n: '02',
        name: 'Whisp',
        year: '2026',
        tagline: 'Social réel, sans algorithme.',
        category: 'Mobile · Real-time',
        slides: [whispHomescreen, whispDiscussion, whispDetailProfile, whispMap],
        bg: 'bg-paper',
        text: 'text-ink',
        accent: 'klein',
    },
]

function Slideshow({ images, interval = 2200 }: { images: string[]; interval?: number }) {
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

export default function Showcase() {
    return (
        <section id="work" className="relative bg-paper text-ink border-t border-ink overflow-hidden">
            {/* meta bar */}
            <div className="grid-12 items-baseline border-b border-ink h-11 container-x">
                <div className="col-span-6 md:col-span-4 label label-soft">§ 02 — Selected Work</div>
                <div className="hidden md:block col-span-4 text-center label label-soft">Deux apps en production</div>
                <div className="col-span-6 md:col-span-4 label label-soft text-right">2024 · 2026</div>
            </div>

            {/* Titre */}
            <div className="relative container-x section-y">
                <div className="flex items-center gap-3 mb-6">
                    <Asterisk className="w-4 h-4 spin-slow text-tomato" color="currentColor" />
                    <span className="label">Work · N° 02</span>
                </div>
                <h2 className="display text-[13vw] md:text-[8vw] leading-[0.86] tracking-[-0.05em]">
                    Des <span className="serif-italic text-tomato">apps</span>, <br className="md:hidden"/>
                    pas des decks.
                </h2>
            </div>

            {/* Projets — 2 grandes cards */}
            <div className="flex flex-col gap-0 border-t border-ink">
                {PROJECTS.map((p, idx) => (
                    <motion.a
                        key={p.n}
                        href="#"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`group relative ${p.bg} ${p.text} border-b border-ink grid grid-cols-12 gap-0 min-h-[560px] md:min-h-[620px]`}
                    >
                        {/* Info */}
                        <div className="col-span-12 md:col-span-7 p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-ink relative">
                            {/* Top */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-baseline gap-4">
                                    <span className="display text-3xl md:text-4xl opacity-80">{p.n}</span>
                                    <div>
                                        <div className="label" style={{ color: 'currentColor', opacity: 0.7 }}>Project</div>
                                        <div className="label mt-0.5" style={{ color: 'currentColor' }}>{p.year}</div>
                                    </div>
                                </div>
                                <Asterisk className="w-8 h-8 md:w-10 md:h-10 spin-slow shrink-0" color="currentColor" />
                            </div>

                            {/* Nom massif */}
                            <div className="my-10 md:my-0">
                                <h3 className="display text-[22vw] md:text-[11vw] leading-[0.84] tracking-[-0.05em]">
                                    {p.name}
                                </h3>
                                <p className="mt-6 font-body text-xl md:text-3xl serif-italic normal-case opacity-90 max-w-[22ch]">
                                    {p.tagline}
                                </p>
                            </div>

                            {/* Bottom */}
                            <div className="flex items-end justify-between">
                                <span className="label" style={{ color: 'currentColor', opacity: 0.7 }}>{p.category}</span>
                                <span className="inline-flex items-center gap-2 badge" style={{ borderColor: 'currentColor', color: 'currentColor' }}>
                                    View case <ArrowUpRight size={12} weight="bold" />
                                </span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="col-span-12 md:col-span-5 relative flex items-center justify-center p-8 md:p-12 min-h-[380px] md:min-h-0">
                            <div aria-hidden className="absolute inset-0 dotgrid opacity-[0.18]" />
                            <div className="relative z-10 w-[200px] md:w-[240px] transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-[1.03]">
                                <div className="drop-shadow-[10px_10px_0_rgba(10,10,10,1)]">
                                    <IPhoneMockup
                                        screenType="island"
                                        screenWidth={200}
                                        frameColor="#0A0A0A"
                                        hideStatusBar
                                        hideNavBar
                                    >
                                        <div className="w-full h-full overflow-hidden">
                                            <Slideshow images={p.slides} interval={2200 + idx * 300} />
                                        </div>
                                    </IPhoneMockup>
                                </div>
                            </div>
                        </div>
                    </motion.a>
                ))}

                {/* Next */}
                <motion.a
                    href="#contact"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="group grid grid-cols-12 items-center container-x py-12 md:py-20 border-b border-ink hover:bg-ink hover:text-paper transition-colors"
                >
                    <span className="col-span-2 md:col-span-1 label group-hover:text-paper/60 transition-colors">03</span>
                    <h3 className="col-span-10 md:col-span-10 display text-4xl md:text-7xl leading-[0.9] tracking-[-0.04em]">
                        <span className="text-outline group-hover:text-paper transition-colors">Next</span> —
                        <span className="serif-italic text-tomato"> votre projet ?</span>
                    </h3>
                    <div className="col-span-12 md:col-span-1 flex md:justify-end mt-4 md:mt-0">
                        <span className="w-11 h-11 rounded-full border border-current flex items-center justify-center group-hover:rotate-45 transition-transform">
                            <ArrowUpRight size={18} weight="bold" />
                        </span>
                    </div>
                </motion.a>
            </div>
        </section>
    )
}
