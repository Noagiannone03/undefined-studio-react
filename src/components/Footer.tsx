import { motion } from 'motion/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import Asterisk from './Asterisk'

const LINKS_STUDIO = [
    { label: 'Work', href: '#work' },
    { label: 'Index', href: '#index' },
    { label: 'Studio', href: '#studio' },
    { label: 'Contact', href: '#contact' },
]

const LINKS_ELSE = [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub', href: '#' },
    { label: 'Dribbble', href: '#' },
]

export default function Footer() {
    return (
        <>
            {/* CONTACT — fond tomato profond */}
            <section id="contact" className="relative bg-tomato text-paper border-t border-ink overflow-hidden">
                {/* meta bar */}
                <div className="grid-12 items-baseline border-b border-ink h-11 container-x">
                    <div className="col-span-6 md:col-span-4 label">§ 05 — Contact</div>
                    <div className="hidden md:block col-span-4 text-center label">One human replies</div>
                    <div className="col-span-6 md:col-span-4 label text-right">&lt; 24h</div>
                </div>

                {/* Titre */}
                <div className="relative container-x section-y">
                    <div aria-hidden className="pointer-events-none absolute left-[-12vw] bottom-[-10%] w-[70vw] md:w-[45vw] opacity-20">
                        <Asterisk className="w-full h-full spin-slow" color="#EEE9DA" />
                    </div>

                    <div className="flex items-center gap-3 mb-6 relative">
                        <Asterisk className="w-4 h-4 spin-slow" color="currentColor" />
                        <span className="label">Brief · N° 05</span>
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="relative display text-[18vw] md:text-[11vw] leading-[0.86] tracking-[-0.055em]"
                    >
                        Let&apos;s<br/>
                        <span className="serif-italic">make it.</span>
                    </motion.h2>

                    <p className="relative mt-10 font-body text-lg md:text-xl max-w-[42ch] leading-[1.3]">
                        Un produit à lancer, un refresh, une idée ?
                        <span className="serif-italic"> Écris-nous</span> — un humain répond.
                    </p>
                </div>

                {/* CTA split */}
                <div className="grid grid-cols-12 border-t border-ink">
                    <a href="mailto:hello@undefined.fr" className="group col-span-12 md:col-span-8 md:border-r border-ink container-x py-10 md:py-16 flex items-center justify-between hover:bg-ink hover:text-paper transition-colors">
                        <span className="display text-2xl md:text-5xl leading-none break-all md:break-normal">hello@undefined.fr</span>
                        <ArrowUpRight size={32} weight="bold" className="shrink-0 group-hover:rotate-45 transition-transform" />
                    </a>
                    <a href="#" className="group col-span-12 md:col-span-4 container-x py-10 md:py-16 flex items-center justify-between border-t md:border-t-0 border-ink hover:bg-ink hover:text-paper transition-colors">
                        <span className="display text-2xl md:text-3xl leading-none">Book a call</span>
                        <ArrowUpRight size={26} weight="bold" className="shrink-0 group-hover:rotate-45 transition-transform" />
                    </a>
                </div>

                {/* Wordmark */}
                <div className="border-t border-ink overflow-hidden bg-paper text-ink">
                    <div className="py-10 md:py-14 container-x flex justify-center">
                        <span className="display text-[22vw] leading-none tracking-[-0.07em] whitespace-nowrap select-none">
                            UNDEFINED<span className="serif-italic text-tomato">®</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer final */}
            <footer className="bg-ink text-paper">
                <div className="grid-12 container-x py-14 md:py-20 gap-y-10">
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Asterisk className="w-3 h-3 spin-slow text-tomato" color="currentColor" />
                            <span className="label text-paper/60">Studio</span>
                        </div>
                        <h3 className="display text-3xl leading-none">
                            Undefined<span className="serif-italic text-tomato">.</span>Studio
                        </h3>
                        <p className="font-body text-sm max-w-[36ch] text-paper/70">
                            Independent design &amp; dev studio. Paris · Toulouse.
                        </p>
                    </div>

                    <div className="col-span-6 md:col-span-2 flex flex-col gap-3">
                        <span className="label text-paper/60">Index</span>
                        <ul className="flex flex-col gap-2">
                            {LINKS_STUDIO.map(l => (
                                <li key={l.href}>
                                    <a href={l.href} className="font-body text-sm hover:text-tomato transition-colors">{l.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-6 md:col-span-2 flex flex-col gap-3">
                        <span className="label text-paper/60">Elsewhere</span>
                        <ul className="flex flex-col gap-2">
                            {LINKS_ELSE.map(l => (
                                <li key={l.label}>
                                    <a href={l.href} className="font-body text-sm hover:text-tomato transition-colors inline-flex items-center gap-1.5">
                                        {l.label} <ArrowUpRight size={12} weight="bold" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-12 md:col-span-4 flex flex-col gap-3">
                        <span className="label text-paper/60">Direct</span>
                        <a href="mailto:hello@undefined.fr" className="display text-2xl u-draw w-fit">hello@undefined.fr</a>
                        <span className="label text-paper/60">+33 · Sur demande</span>
                    </div>
                </div>

                <div className="border-t border-paper/20 container-x py-5 grid-12 items-center gap-3">
                    <div className="col-span-12 md:col-span-6 label text-paper/60">
                        © {new Date().getFullYear()} Undefined Studio — Brutal but friendly.
                    </div>
                    <div className="col-span-12 md:col-span-6 flex md:justify-end gap-8 label text-paper/60">
                        <a href="#" className="hover:text-tomato transition-colors">Privacy</a>
                        <a href="#" className="hover:text-tomato transition-colors">Mentions</a>
                        <a href="#top" className="hover:text-tomato transition-colors">↑ Top</a>
                    </div>
                </div>
            </footer>
        </>
    )
}
