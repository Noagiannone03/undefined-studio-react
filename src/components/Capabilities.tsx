import { motion } from 'motion/react'
import Asterisk from './Asterisk'

const CAPS = [
    { n: '01', title: 'Product Design', tags: ['UX/UI', 'Design system', 'Prototyping'] },
    { n: '02', title: 'Mobile Development', tags: ['React Native', 'Expo', 'Swift'] },
    { n: '03', title: 'Motion & Interaction', tags: ['GSAP', 'Framer Motion', 'Micro-interactions'] },
    { n: '04', title: 'Brand & Strategy', tags: ['Identity', 'Roadmap', 'Positioning'] },
]

export default function Capabilities() {
    return (
        <section id="services" className="relative bg-paper text-ink border-t border-ink overflow-hidden">
            {/* meta bar */}
            <div className="grid-12 items-baseline border-b border-ink h-11 container-x">
                <div className="col-span-6 md:col-span-4 label label-soft">§ 03 — Capabilities</div>
                <div className="hidden md:block col-span-4 text-center label label-soft">Four disciplines</div>
                <div className="col-span-6 md:col-span-4 label label-soft text-right">Services</div>
            </div>

            {/* Titre */}
            <div className="relative container-x section-y">
                <div className="flex items-center gap-3 mb-6">
                    <Asterisk className="w-4 h-4 spin-slow text-klein" color="currentColor" />
                    <span className="label">What we do · N° 03</span>
                </div>
                <h2 className="display text-[13vw] md:text-[8vw] leading-[0.86] tracking-[-0.05em] max-w-[14ch]">
                    Four <span className="serif-italic text-klein">muscles</span>,
                    <span className="text-outline"> one voice.</span>
                </h2>
            </div>

            {/* Liste */}
            <div className="border-t border-ink">
                {CAPS.map((c, i) => (
                    <motion.div
                        key={c.n}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="group grid grid-cols-12 items-center container-x py-10 md:py-16 border-b border-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                        <span className="col-span-2 md:col-span-1 display text-3xl md:text-4xl text-outline group-hover:text-paper transition-colors">
                            {c.n}
                        </span>
                        <h3 className="col-span-10 md:col-span-6 display text-4xl md:text-7xl leading-[0.9] tracking-[-0.04em]">
                            {c.title}
                        </h3>
                        <div className="col-span-12 md:col-span-5 flex flex-wrap gap-2 mt-5 md:mt-0 md:justify-end">
                            {c.tags.map(t => (
                                <span key={t} className="badge" style={{ borderColor: 'currentColor', color: 'currentColor' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
