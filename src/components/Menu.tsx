import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, List, X } from '@phosphor-icons/react'
import gsap from 'gsap'
import Asterisk from './Asterisk'

const SECTIONS = [
    { label: 'Work', href: '#work' },
    { label: 'Manifesto', href: '#index' },
    { label: 'Services', href: '#services' },
    { label: 'Ask', href: '#ask' },
]

export default function Menu() {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState<string>('')
    const headerRef = useRef<HTMLElement>(null)
    const capsuleRef = useRef<HTMLDivElement>(null)
    const logoStarRef = useRef<SVGSVGElement | null>(null)
    const navRef = useRef<HTMLElement>(null)
    const indicatorRef = useRef<HTMLDivElement>(null)

    // Scrollspy
    useEffect(() => {
        const ids = SECTIONS.map(s => s.href.slice(1))
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => { if (e.isIntersecting) setActive(`#${e.target.id}`) })
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        )
        ids.forEach(id => {
            const el = document.getElementById(id)
            if (el) obs.observe(el)
        })
        return () => obs.disconnect()
    }, [])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    // Intro animation
    useLayoutEffect(() => {
        const capsule = capsuleRef.current
        if (!capsule) return
        const ctx = gsap.context(() => {
            gsap.set(capsule, { y: -80, scale: 0.9, opacity: 0 })
            gsap.to(capsule, {
                y: 0, scale: 1, opacity: 1,
                duration: 1.1,
                ease: 'expo.out',
                delay: 0.2,
            })
            // breathing float
            gsap.to(capsule, {
                y: -3,
                duration: 3.2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 1.4,
            })
            if (logoStarRef.current) {
                gsap.to(logoStarRef.current, {
                    rotate: 360,
                    duration: 18,
                    ease: 'none',
                    repeat: -1,
                    transformOrigin: '50% 50%',
                })
            }
        })
        return () => ctx.revert()
    }, [])

    // Move active indicator
    useLayoutEffect(() => {
        const nav = navRef.current
        const ind = indicatorRef.current
        if (!nav || !ind) return
        const activeEl = nav.querySelector<HTMLElement>(`a[data-href="${active}"]`)
        if (!activeEl) {
            gsap.to(ind, { autoAlpha: 0, duration: 0.2 })
            return
        }
        const navRect = nav.getBoundingClientRect()
        const r = activeEl.getBoundingClientRect()
        gsap.to(ind, {
            x: r.left - navRect.left,
            width: r.width,
            autoAlpha: 1,
            duration: 0.6,
            ease: 'elastic.out(1, 0.7)',
        })
    }, [active])

    // Magnetic hover on nav items
    useEffect(() => {
        const nav = navRef.current
        if (!nav) return
        const items = nav.querySelectorAll<HTMLAnchorElement>('a[data-href]')
        const listeners: Array<() => void> = []
        items.forEach((el) => {
            const onMove = (e: MouseEvent) => {
                const r = el.getBoundingClientRect()
                const x = e.clientX - r.left - r.width / 2
                const y = e.clientY - r.top - r.height / 2
                gsap.to(el, { x: x * 0.25, y: y * 0.35, duration: 0.35, ease: 'power3.out' })
            }
            const onLeave = () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.6)' })
            }
            el.addEventListener('mousemove', onMove)
            el.addEventListener('mouseleave', onLeave)
            listeners.push(() => {
                el.removeEventListener('mousemove', onMove)
                el.removeEventListener('mouseleave', onLeave)
            })
        })
        return () => listeners.forEach(fn => fn())
    }, [])

    return (
        <>
            <header
                ref={headerRef}
                className="fixed z-50 inset-x-0 top-5 flex justify-center px-4 pointer-events-none"
            >
                <div
                    ref={capsuleRef}
                    className="pointer-events-auto relative inline-flex items-center gap-1 h-14 pl-2 pr-2 bg-paper border border-ink rounded-full shadow-[0_1px_0_rgba(10,10,10,0.04),0_12px_40px_-12px_rgba(10,10,10,0.25)]"
                    style={{ willChange: 'transform' }}
                >
                    {/* Logo circle */}
                    <a
                        href="#top"
                        aria-label="Home"
                        className="group relative w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center overflow-hidden shrink-0"
                    >
                        <Asterisk
                            ref={logoStarRef}
                            className="w-4 h-4"
                            color="currentColor"
                        />
                        <span className="absolute inset-0 rounded-full bg-tomato scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center" />
                        <Asterisk className="absolute w-4 h-4" color="#EEE9DA" />
                    </a>

                    {/* Nav */}
                    <nav ref={navRef} className="relative hidden md:flex items-center h-10 px-1">
                        <div
                            ref={indicatorRef}
                            aria-hidden
                            className="absolute top-1 bottom-1 left-0 rounded-full bg-ink -z-0"
                            style={{ width: 0, opacity: 0, willChange: 'transform, width' }}
                        />
                        {SECTIONS.map(s => {
                            const isActive = active === s.href
                            return (
                                <a
                                    key={s.href}
                                    href={s.href}
                                    data-href={s.href}
                                    className={`relative z-10 inline-flex items-center h-10 px-4 rounded-full display text-[13px] tracking-[0] transition-colors ${
                                        isActive ? 'text-paper' : 'text-ink hover:text-tomato'
                                    }`}
                                    style={{ willChange: 'transform' }}
                                >
                                    {s.label}
                                </a>
                            )
                        })}
                    </nav>

                    {/* Divider */}
                    <span aria-hidden className="hidden md:block h-6 w-px bg-ink/15 mx-1" />

                    {/* CTA circle */}
                    <a
                        href="#contact"
                        aria-label="Contact"
                        className="group relative hidden md:inline-flex items-center gap-2 h-10 pl-4 pr-1 rounded-full bg-tomato text-paper overflow-hidden"
                    >
                        <span className="display text-[13px] relative z-10">Let&apos;s talk</span>
                        <span className="relative z-10 w-8 h-8 rounded-full bg-paper text-ink flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 ease-out">
                            <ArrowUpRight size={12} weight="bold" />
                        </span>
                        <span className="absolute inset-0 bg-ink scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </a>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(v => !v)}
                        aria-label="Menu"
                        className="md:hidden w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center"
                    >
                        {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.45, ease: [0.77, 0, 0.18, 1] }}
                        className="fixed inset-0 z-40 bg-paper pt-28 container-x flex flex-col border-b border-ink md:hidden"
                    >
                        <div className="flex flex-col divide-y divide-ink">
                            {SECTIONS.map((s, i) => (
                                <motion.a
                                    key={s.href}
                                    href={s.href}
                                    onClick={() => setOpen(false)}
                                    initial={{ y: 24, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="group flex items-center justify-between py-6"
                                >
                                    <div className="flex items-center gap-5">
                                        <span className="label label-soft">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="display text-5xl">{s.label}</span>
                                    </div>
                                    <ArrowUpRight size={28} weight="bold" className="group-hover:text-tomato transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                        <div className="mt-auto py-8 border-t border-ink flex items-center justify-between">
                            <a href="mailto:hello@undefined.fr" className="display text-xl u-draw">hello@undefined.fr</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
