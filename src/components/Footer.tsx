import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Footer() {
    const ref = useRef<HTMLDivElement>(null)
    const mailRef = useRef<HTMLAnchorElement>(null)

    useMagnetic(mailRef, 0.22)

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const chars = ref.current?.querySelectorAll<HTMLSpanElement>('[data-char]')
            if (chars) {
                gsap.set(chars, { yPercent: 120, rotate: 6 })
                gsap.to(chars, {
                    yPercent: 0,
                    rotate: 0,
                    duration: 1.1,
                    ease: 'expo.out',
                    stagger: 0.035,
                    scrollTrigger: { trigger: chars[0], start: 'top 80%' },
                })
            }
            const word = ref.current?.querySelector('[data-wordmark]')
            if (word) {
                gsap.to(word, {
                    xPercent: -10,
                    ease: 'none',
                    scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom top', scrub: 1 },
                })
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    const makeChars = (text: string, italic = false) =>
        text.split('').map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom" style={{ lineHeight: 1 }}>
                <span data-char className={`inline-block ${italic ? 'serif-italic' : ''}`}>
                    {ch === ' ' ? '\u00A0' : ch}
                </span>
            </span>
        ))

    return (
        <div ref={ref}>
            <section id="contact" className="relative bg-paper text-ink overflow-hidden">
                {/* Klein glow back */}
                <div aria-hidden className="pointer-events-none absolute -right-[10vw] top-[10%] w-[60vw] h-[60vw] rounded-full opacity-[0.1] blur-[120px] mix-blend-multiply"
                     style={{ background: 'radial-gradient(circle, #1D1DBF 0%, transparent 70%)' }} />

                <div className="relative container-x pt-32 md:pt-48 pb-20 md:pb-28">
                    <div className="grid grid-cols-12 gap-y-12 items-end">
                        <div className="col-span-12 md:col-span-3">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-tomato animate-pulse" />
                                <span className="label label-soft">Contact · under 24h</span>
                            </div>
                        </div>

                        <h2 className="col-span-12 md:col-span-9 display text-[22vw] md:text-[14vw] leading-[0.84] tracking-[-0.055em]">
                            <span className="block">{makeChars("Let's")}</span>
                            <span className="block">{makeChars('make it.', true)}</span>
                        </h2>

                        <div className="col-span-12 md:col-span-3" />

                        <div className="col-span-12 md:col-span-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <p className="font-body text-lg md:text-xl max-w-[42ch] leading-[1.45] text-ink-soft">
                                A product to launch, a refresh, or a half-formed idea —
                                <span className="serif-italic text-ink"> write to us.</span> One human replies.
                            </p>
                            <a
                                ref={mailRef}
                                href="mailto:hello@undefined.fr"
                                data-cursor="cta"
                                data-cursor-label="send"
                                className="btn self-start md:self-end"
                            >
                                hello@undefined.fr
                                <span className="arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="hair-t overflow-hidden">
                    <div data-wordmark className="py-8 md:py-12 flex justify-center whitespace-nowrap">
                        <span className="display text-[26vw] leading-none tracking-[-0.075em] select-none">
                            Undefined<span className="serif-italic text-tomato">®</span>
                        </span>
                    </div>
                </div>
            </section>

            <footer className="bg-paper text-ink hair-t">
                <div className="container-x py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-6">
                        <span className="label label-soft">© {new Date().getFullYear()} Undefined Studio</span>
                        <span className="label label-soft hidden md:inline">Paris · Toulouse</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="label label-soft hover:text-tomato transition-colors">Instagram</a>
                        <a href="#" className="label label-soft hover:text-tomato transition-colors">LinkedIn</a>
                        <a href="#top" className="label label-soft hover:text-tomato transition-colors">↑ Top</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
