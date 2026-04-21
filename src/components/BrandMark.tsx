import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const trackRef   = useRef<HTMLDivElement>(null)
    const mobileRef  = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!wrapperRef.current) return

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            // ════════════════════════════════════════════════════════
            //  DESKTOP — scroll horizontal pinné
            // ════════════════════════════════════════════════════════
            mm.add('(min-width: 769px)', () => {
                if (!trackRef.current || !wrapperRef.current) return

                const track   = trackRef.current
                const wrapper = wrapperRef.current

                const hTween = gsap.to(track, {
                    x: () => -(track.scrollWidth - window.innerWidth),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrapper,
                        pin: true,
                        scrub: 1.2,
                        start: 'top top',
                        end: () => `+=${track.scrollWidth - window.innerWidth + 1}`,
                        invalidateOnRefresh: true,
                        anticipatePin: 1,
                    },
                })

                // Clip-path : chaque élément s'écrit de gauche à droite
                gsap.utils.toArray<HTMLElement>('.bm-reveal').forEach((el) => {
                    gsap.fromTo(el,
                        { clipPath: 'inset(0 100% 0 0)' },
                        {
                            clipPath: 'inset(0 0% 0 0)',
                            ease: 'none',
                            scrollTrigger: {
                                trigger: el,
                                containerAnimation: hTween,
                                start: 'left 88%',
                                end: 'left 12%',
                                scrub: true,
                            },
                        }
                    )
                })

                // Stroke draw des chevrons
                gsap.set('.bm-path', { strokeDasharray: 54, strokeDashoffset: 54 })
                gsap.utils.toArray<SVGPathElement>('.bm-path').forEach((path, i) => {
                    gsap.to(path, {
                        strokeDashoffset: 0,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: path.closest('svg'),
                            containerAnimation: hTween,
                            start: `left ${88 - i * 18}%`,
                            end: `left ${30 - i * 10}%`,
                            scrub: true,
                        },
                    })
                })

                // Scale + blur au passage
                gsap.utils.toArray<HTMLElement>('.bm-panel').forEach((panel) => {
                    gsap.fromTo(panel,
                        { scale: 0.88, filter: 'blur(12px)' },
                        {
                            scale: 1, filter: 'blur(0px)', ease: 'none',
                            scrollTrigger: {
                                trigger: panel, containerAnimation: hTween,
                                start: 'left 90%', end: 'left 50%', scrub: true,
                            },
                        }
                    )
                    gsap.fromTo(panel,
                        { scale: 1, filter: 'blur(0px)' },
                        {
                            scale: 0.88, filter: 'blur(10px)', ease: 'none',
                            scrollTrigger: {
                                trigger: panel, containerAnimation: hTween,
                                start: 'left 50%', end: 'left 10%', scrub: true,
                            },
                        }
                    )
                })

                return () => { hTween.scrollTrigger?.kill() }
            })

            // ════════════════════════════════════════════════════════
            //  MOBILE — reveal vertical cinématique
            // ════════════════════════════════════════════════════════
            mm.add('(max-width: 768px)', () => {
                if (!mobileRef.current) return

                // Prépare les paths mobile
                gsap.set('.bm-m-path', { strokeDasharray: 54, strokeDashoffset: 54 })

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: mobileRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    defaults: { ease: 'expo.out' },
                })

                // 1. Chevrons — stroke draw en séquence
                tl.to('.bm-m-path-l', { strokeDashoffset: 0, duration: 0.85 })
                tl.to('.bm-m-path-r', { strokeDashoffset: 0, duration: 0.85 }, '-=0.55')

                // 2. "CE QU'ON" — mots sortent du bas un par un
                tl.from('.bm-m-w1', {
                    yPercent: 112,
                    duration: 1.05,
                    stagger: 0.08,
                }, '-=0.4')

                // 3. "a fait." — sens inverse (du haut) + skew
                tl.from('.bm-m-w2', {
                    yPercent: -112,
                    skewY: -5,
                    duration: 1.10,
                    stagger: 0.08,
                }, '-=0.65')

                // 4. Rule + label
                tl.fromTo('.bm-m-rule',
                    { scaleX: 0, transformOrigin: 'left center' },
                    { scaleX: 1, duration: 0.8, ease: 'power3.out' },
                    '-=0.5'
                )
                tl.from('.bm-m-label', {
                    opacity: 0, y: 8, duration: 0.6, ease: 'power2.out',
                }, '-=0.4')

                return () => { tl.scrollTrigger?.kill() }
            })

        }, wrapperRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={wrapperRef} id="brand-mark">

            {/* ═══════════════════════════════════════════════════════
                DESKTOP — horizontal scroll track
                (hidden on mobile via CSS)
            ═══════════════════════════════════════════════════════ */}
            <div className="bm-desktop" style={{ background: 'var(--color-ink)' }}>
                <div ref={trackRef} style={{ display: 'flex', alignItems: 'stretch', height: '100vh', willChange: 'transform' }}>

                    {/* Panel 0 : >> */}
                    <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'center', gap: 'clamp(8px,1.4vw,24px)' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(239,235,221,0.06)' }} />
                        <Chev className="bm-path" stroke="#1D1DBF" glow="rgba(29,29,191,0.8)" />
                        <Chev className="bm-path" stroke="#E84A2A" glow="rgba(232,74,42,0.8)" />
                        <span className="mono" style={{ position: 'absolute', bottom: 'clamp(24px,4vw,48px)', right: 'clamp(24px,4vw,48px)', fontSize: 10, letterSpacing: '0.26em', color: 'rgba(239,235,221,0.22)' }}>
                            03 — PROJETS
                        </span>
                    </Panel>

                    {/* Panel 1 : CE */}
                    <Panel className="bm-panel" extraStyle={{ alignItems: 'flex-end', paddingBottom: 'clamp(32px,6vw,88px)' }}>
                        <Reveal><span className="display" style={{ display: 'block', fontSize: 'clamp(100px,24vw,380px)', color: 'var(--color-paper)', letterSpacing: '-0.052em', lineHeight: 0.84 }}>CE</span></Reveal>
                    </Panel>

                    {/* Panel 2 : QU'ON */}
                    <Panel className="bm-panel" width="140vw" extraStyle={{ alignItems: 'flex-start', paddingTop: 'clamp(32px,6vw,88px)' }}>
                        <Reveal><span className="display" style={{ display: 'block', fontSize: 'clamp(80px,19vw,310px)', color: 'var(--color-paper)', letterSpacing: '-0.052em', lineHeight: 0.84, whiteSpace: 'nowrap' }}>QU'ON</span></Reveal>
                        <div className="bm-reveal" style={{ position: 'absolute', bottom: 'clamp(40px,7vw,100px)', left: 0, width: '60%', height: 2, background: 'var(--color-klein)' }} />
                    </Panel>

                    {/* Panel 3 : a */}
                    <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Reveal><span className="serif-italic" style={{ display: 'block', fontSize: 'clamp(120px,28vw,440px)', color: 'var(--color-paper)', letterSpacing: '-0.04em', lineHeight: 0.84 }}>a</span></Reveal>
                    </Panel>

                    {/* Panel 4 : fait. */}
                    <Panel className="bm-panel" width="140vw" extraStyle={{ alignItems: 'flex-end', paddingBottom: 'clamp(32px,6vw,88px)' }}>
                        <Reveal><span className="serif-italic" style={{ display: 'block', fontSize: 'clamp(90px,21vw,340px)', color: 'var(--color-tomato)', letterSpacing: '-0.04em', lineHeight: 0.84, whiteSpace: 'nowrap' }}>fait.</span></Reveal>
                        <div style={{ position: 'absolute', top: 'clamp(32px,6vw,88px)', right: 0, width: 1, height: '40%', background: 'rgba(239,235,221,0.14)' }} />
                    </Panel>

                    {/* Panel 5 : Outro */}
                    <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', gap: 'clamp(16px,2.5vw,36px)' }}>
                        <Reveal><span className="mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.28em', color: 'rgba(239,235,221,0.4)' }}>( 03 ) — CE QU'ON A FAIT</span></Reveal>
                        <Reveal><div style={{ width: 'clamp(40px,6vw,90px)', height: 1, background: 'rgba(239,235,221,0.18)' }} /></Reveal>
                        <Reveal><span className="display" style={{ display: 'block', fontSize: 'clamp(14px,1.6vw,22px)', color: 'var(--color-paper)', letterSpacing: '-0.01em', lineHeight: 1.4, maxWidth: '20ch' }}>Nos projets parlent mieux que nous.</span></Reveal>
                        <div style={{ display: 'flex', gap: 'clamp(8px,1vw,16px)', flexWrap: 'wrap' }}>
                            {['Branding', 'Interfaces', 'Motion'].map((tag) => (
                                <Reveal key={tag}><div style={{ border: '1px solid rgba(239,235,221,0.22)', padding: '5px 12px' }}><span className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,235,221,0.55)' }}>{tag}</span></div></Reveal>
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                MOBILE — reveal vertical
                (hidden on desktop via CSS)
            ═══════════════════════════════════════════════════════ */}
            <div
                ref={mobileRef}
                className="bm-mobile"
                style={{
                    background: 'var(--color-ink)',
                    padding: 'clamp(72px, 18vw, 120px) var(--side-spacing)',
                    overflow: 'hidden',
                }}
            >
                {/* >> Chevrons mobile */}
                <div style={{ display: 'flex', gap: 'clamp(6px, 3vw, 14px)', marginBottom: 'clamp(32px, 10vw, 56px)' }}>
                    <svg viewBox="0 0 28 40" fill="none" overflow="visible" style={{ width: 'clamp(28px, 9vw, 52px)', filter: 'drop-shadow(0 0 28px rgba(29,29,191,0.75))' }}>
                        <path className="bm-m-path bm-m-path-l" d="M4 4L22 20L4 36" stroke="#1D1DBF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <svg viewBox="0 0 28 40" fill="none" overflow="visible" style={{ width: 'clamp(28px, 9vw, 52px)', filter: 'drop-shadow(0 0 28px rgba(232,74,42,0.75))' }}>
                        <path className="bm-m-path bm-m-path-r" d="M4 4L22 20L4 36" stroke="#E84A2A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </div>

                {/* CE QU'ON */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 'clamp(16px, 5vw, 28px)' }}>
                    {['CE', "QU'ON"].map((w, i) => (
                        <div key={w} style={{ overflow: 'hidden', lineHeight: 0.84 }}>
                            <span
                                className={`display bm-m-w1`}
                                style={{
                                    display: 'block',
                                    fontSize: i === 0 ? 'clamp(82px, 26vw, 130px)' : 'clamp(56px, 18vw, 92px)',
                                    color: 'var(--color-paper)',
                                    letterSpacing: '-0.048em',
                                    lineHeight: 0.84,
                                }}
                            >
                                {w}
                            </span>
                        </div>
                    ))}
                </div>

                {/* a fait. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 'clamp(32px, 9vw, 52px)' }}>
                    {[
                        { w: 'a',      color: 'var(--color-paper)', size: 'clamp(96px, 30vw, 150px)' },
                        { w: 'fait.',  color: 'var(--color-tomato)', size: 'clamp(66px, 21vw, 108px)' },
                    ].map(({ w, color, size }) => (
                        <div key={w} style={{ overflow: 'hidden', lineHeight: 0.88 }}>
                            <span
                                className="serif-italic bm-m-w2"
                                style={{
                                    display: 'block',
                                    fontSize: size,
                                    color,
                                    letterSpacing: '-0.038em',
                                    lineHeight: 0.88,
                                }}
                            >
                                {w}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Rule + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="bm-m-rule" style={{ flex: 1, height: 1, background: 'rgba(239,235,221,0.16)' }} />
                    <span className="mono bm-m-label" style={{ fontSize: 10, letterSpacing: '0.26em', color: 'rgba(239,235,221,0.35)', whiteSpace: 'nowrap' }}>
                        — Nos projets
                    </span>
                </div>
            </div>

        </div>
    )
}

/* ── Helpers ── */
function Panel({ children, className = '', width = '100vw', extraStyle = {} }: {
    children: React.ReactNode; className?: string; width?: string; extraStyle?: React.CSSProperties
}) {
    return (
        <div className={className} style={{ width, minWidth: width, height: '100vh', flexShrink: 0, position: 'relative', display: 'flex', padding: '0 var(--side-spacing)', ...extraStyle }}>
            {children}
        </div>
    )
}

function Reveal({ children }: { children: React.ReactNode }) {
    return <div className="bm-reveal" style={{ overflow: 'hidden' }}>{children}</div>
}

function Chev({ className, stroke, glow }: { className: string; stroke: string; glow: string }) {
    return (
        <svg viewBox="0 0 28 40" fill="none" overflow="visible"
            style={{ width: 'clamp(50px,9vw,140px)', display: 'block', filter: `drop-shadow(0 0 48px ${glow})` }}>
            <path className={className} d="M4 4L22 20L4 36" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    )
}
