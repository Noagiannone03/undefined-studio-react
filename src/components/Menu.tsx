import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { List, X } from '@phosphor-icons/react'
import gsap from 'gsap'

const SECTIONS = [
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'Work', href: '#work' },
    { label: 'Disciplines', href: '#services' },
    { label: 'Contact', href: '#contact' },
]

export default function Menu() {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState<string>('')
    const capsuleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ids = SECTIONS.map(s => s.href.slice(1))
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(`#${e.target.id}`) }),
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

    useLayoutEffect(() => {
        if (!capsuleRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(
                capsuleRef.current,
                { y: -40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: 0.25 }
            )
        })
        return () => ctx.revert()
    }, [])

    return (
        <>
            <header className="fixed z-50 inset-x-0 top-6 flex justify-center px-4 pointer-events-none">
                <div
                    ref={capsuleRef}
                    className="pointer-events-auto relative inline-flex items-center gap-1 h-12 pl-5 pr-1.5 bg-paper/85 backdrop-blur-md border border-hair rounded-full"
                    style={{ willChange: 'transform' }}
                >
                    {/* Wordmark */}
                    <a href="#top" aria-label="Home" className="mr-2 font-medium text-[13px] tracking-tight">
                        Undefined<span className="serif-italic text-tomato">.</span>
                    </a>

                    {/* Nav */}
                    <nav className="relative hidden md:flex items-center h-9">
                        {SECTIONS.map(s => {
                            const isActive = active === s.href
                            return (
                                <a
                                    key={s.href}
                                    href={s.href}
                                    className={`relative inline-flex items-center h-9 px-3.5 text-[13px] transition-colors ${
                                        isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
                                    }`}
                                >
                                    {s.label}
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-dot"
                                            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tomato"
                                            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                        />
                                    )}
                                </a>
                            )
                        })}
                    </nav>

                    {/* CTA */}
                    <a
                        href="#contact"
                        className="hidden md:inline-flex items-center h-9 px-4 rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-tomato transition-colors"
                    >
                        Let&apos;s talk
                    </a>

                    {/* Mobile */}
                    <button
                        onClick={() => setOpen(v => !v)}
                        aria-label="Menu"
                        className="md:hidden w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center"
                    >
                        {open ? <X size={14} weight="bold" /> : <List size={14} weight="bold" />}
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
                        transition={{ duration: 0.5, ease: [0.77, 0, 0.18, 1] }}
                        className="fixed inset-0 z-40 bg-paper pt-28 container-x flex flex-col md:hidden"
                    >
                        <div className="flex flex-col">
                            {SECTIONS.map((s, i) => (
                                <motion.a
                                    key={s.href}
                                    href={s.href}
                                    onClick={() => setOpen(false)}
                                    initial={{ y: 24, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="group flex items-center justify-between py-7 hair-b"
                                >
                                    <div className="flex items-center gap-5">
                                        <span className="label label-soft">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="display" style={{ fontSize: 'clamp(44px, 13vw, 72px)' }}>{s.label}</span>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                        <a href="mailto:hello@undefined.fr" className="mt-auto py-8 serif-italic u-draw self-start" style={{ fontSize: 'clamp(26px, 7vw, 36px)' }}>
                            hello@undefined.fr
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
