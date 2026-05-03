import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ═══════════════════════════════════════════════════════
   Capabilities — immersive horizontal scroll.
   Each panel = unique visual world.
   A living thread weaves through all 4 panels.
   ═══════════════════════════════════════════════════════ */

/* The thread path — one continuous SVG line through all panels.
   Coordinates in a 4000×1000 viewBox (1000 per panel).
   It swoops, loops, zigzags, waves — alive. */
const THREAD_PATH = [
    // Panel 1: gentle entry, sweeps around the outlined text
    'M -20,520',
    'C 80,520 180,380 280,340',
    'C 420,280 520,180 620,240',
    'C 720,300 780,520 840,480',
    'C 900,440 960,380 1000,400',

    // Panel 2: weaves between the UI blocks, makes a loop
    'C 1060,430 1120,280 1200,220',
    'C 1300,150 1350,320 1400,380',
    'C 1440,420 1460,340 1480,280',
    // small loop
    'C 1520,200 1580,180 1600,240',
    'C 1620,300 1580,360 1540,340',
    'C 1500,320 1520,260 1560,260',
    // continue
    'C 1620,260 1720,480 1820,520',
    'C 1900,550 1960,460 2000,440',

    // Panel 3: geometric, through the brackets
    'C 2060,410 2120,320 2200,280',
    'L 2340,280',
    'C 2400,280 2440,360 2500,440',
    'L 2640,440',
    'C 2720,440 2800,560 2880,520',
    'C 2940,490 2980,440 3000,460',

    // Panel 4: wave pattern, playful ending
    'C 3060,500 3100,300 3160,380',
    'C 3220,460 3260,240 3320,340',
    'C 3380,440 3420,220 3480,320',
    'C 3540,420 3600,280 3660,360',
    'C 3720,440 3800,500 3880,460',
    'C 3940,430 3980,480 4020,480',
].join(' ')

export default function Capabilities() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const pinRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const counterRef = useRef<HTMLSpanElement>(null)
    const threadRef = useRef<SVGPathElement>(null)

    useGSAP(
        () => {
            const track = trackRef.current
            const pin = pinRef.current
            const thread = threadRef.current
            if (!track || !pin) return

            const mm = gsap.matchMedia()

            /* ════ DESKTOP ════ */
            mm.add('(min-width: 900px)', () => {
                const panels = track.querySelectorAll<HTMLDivElement>('[data-panel]')
                if (!panels.length) return
                const scrollDist = () => track.scrollWidth - window.innerWidth

                // Measure thread path length
                let threadLen = 0
                if (thread) {
                    threadLen = thread.getTotalLength()
                    gsap.set(thread, { strokeDasharray: threadLen, strokeDashoffset: threadLen })
                }

                const scrollTween = gsap.to(track, {
                    x: () => -scrollDist(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: pin,
                        start: 'top top',
                        end: () => `+=${scrollDist()}`,
                        scrub: 1,
                        pin: true,
                        pinType: 'transform',
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            // Progress bar
                            if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress })
                            // Counter
                            if (counterRef.current) {
                                const s = Math.min(4, Math.floor(self.progress * 4) + 1)
                                counterRef.current.textContent = `0${s}\u2009/\u200904`
                            }
                            // Thread draw
                            if (thread && threadLen) {
                                gsap.set(thread, { strokeDashoffset: threadLen * (1 - self.progress) })
                            }
                        },
                    },
                })

                /* ── Panel 01: COMPRENDRE — outlined text fill ── */
                const p1 = panels[0]
                if (p1) {
                    const outlineText = p1.querySelector('[data-outline]')
                    const fillLayer = p1.querySelector<HTMLElement>('[data-fill]')
                    const brief = p1.querySelector('[data-brief]')
                    const tags = p1.querySelectorAll('[data-tag]')

                    if (outlineText) {
                        gsap.fromTo(outlineText,
                            { opacity: 0, y: 50, scale: 0.96 },
                            { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
                                scrollTrigger: { trigger: pin, start: 'top 80%', end: 'top 15%', scrub: 0.6 } })
                    }
                    if (fillLayer) {
                        gsap.fromTo(fillLayer,
                            { clipPath: 'inset(0 100% 0 0)' },
                            { clipPath: 'inset(0 0% 0 0)', ease: 'none',
                                scrollTrigger: { trigger: pin, start: 'top 35%', end: 'top -40%', scrub: 1 } })
                    }
                    if (brief) {
                        gsap.fromTo(brief, { opacity: 0, y: 24 },
                            { opacity: 1, y: 0, scrollTrigger: { trigger: pin, start: 'top 25%', end: 'top -5%', scrub: 0.5 } })
                    }
                    if (tags.length) {
                        gsap.set(tags, { opacity: 0, y: 14 })
                        gsap.to(tags, { opacity: 1, y: 0, stagger: 0.06,
                            scrollTrigger: { trigger: pin, start: 'top 15%', end: 'top -15%', scrub: 0.5 } })
                    }
                }

                /* ── Panel 02: INTERFACE — floating UI blocks ── */
                const p2 = panels[1]
                if (p2) {
                    const blocks = p2.querySelectorAll('[data-block]')
                    const title = p2.querySelector('[data-title]')
                    const brief = p2.querySelector('[data-brief]')
                    const tags = p2.querySelectorAll('[data-tag]')

                    if (blocks.length) {
                        blocks.forEach((block, i) => {
                            const xOff = (i % 2 === 0 ? -1 : 1) * (50 + i * 25)
                            const yOff = 70 + i * 35
                            gsap.fromTo(block,
                                { opacity: 0, x: xOff, y: yOff, rotation: -10 + i * 7, scale: 0.5 },
                                { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 1.5, ease: 'expo.out',
                                    scrollTrigger: { trigger: p2, start: 'left 82%', end: 'left 18%', scrub: 0.5,
                                        containerAnimation: scrollTween } })
                        })
                    }
                    if (title) {
                        gsap.fromTo(title, { opacity: 0, x: -50 },
                            { opacity: 1, x: 0, scrollTrigger: { trigger: p2, start: 'left 65%', end: 'left 22%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    if (brief) {
                        gsap.fromTo(brief, { opacity: 0, y: 24 },
                            { opacity: 1, y: 0, scrollTrigger: { trigger: p2, start: 'left 52%', end: 'left 12%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    if (tags.length) {
                        gsap.set(tags, { opacity: 0, y: 14 })
                        gsap.to(tags, { opacity: 1, y: 0, stagger: 0.06,
                            scrollTrigger: { trigger: p2, start: 'left 42%', end: 'left 8%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                }

                /* ── Panel 03: INGÉNIERIE — code brackets + typewriter ── */
                const p3 = panels[2]
                if (p3) {
                    const bracketL = p3.querySelector('[data-bracket-l]')
                    const bracketR = p3.querySelector('[data-bracket-r]')
                    const buildComment = p3.querySelector('[data-build]')
                    const chars = p3.querySelectorAll('[data-char]')
                    const brief = p3.querySelector('[data-brief]')
                    const tags = p3.querySelectorAll('[data-tag]')
                    const cursor = p3.querySelector('[data-cursor]')

                    // Brackets appear in center and spread outward
                    if (bracketL) {
                        gsap.fromTo(bracketL, { x: 500, opacity: 0 },
                            { x: 0, opacity: 0.12, scrollTrigger: { trigger: p3, start: 'left 95%', end: 'left 25%', scrub: 0.6,
                                containerAnimation: scrollTween } })
                    }
                    if (bracketR) {
                        gsap.fromTo(bracketR, { x: -500, opacity: 0 },
                            { x: 0, opacity: 0.12, scrollTrigger: { trigger: p3, start: 'left 95%', end: 'left 25%', scrub: 0.6,
                                containerAnimation: scrollTween } })
                    }
                    // "// build" slides in first
                    if (buildComment) {
                        gsap.fromTo(buildComment, { opacity: 0, x: -24 },
                            { opacity: 0.45, x: 0, scrollTrigger: { trigger: p3, start: 'left 72%', end: 'left 52%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    // Typewriter — chars appear one by one
                    if (chars.length) {
                        gsap.set(chars, { opacity: 0 })
                        gsap.to(chars, { opacity: 1, stagger: { each: 0.05, from: 'start' },
                            scrollTrigger: { trigger: p3, start: 'left 60%', end: 'left 8%', scrub: 0.3,
                                containerAnimation: scrollTween } })
                    }
                    // Cursor appears and blinks at end
                    if (cursor) {
                        gsap.fromTo(cursor, { opacity: 0 }, { opacity: 1, duration: 0.3,
                            scrollTrigger: { trigger: p3, start: 'left 18%', toggleActions: 'play none none none',
                                containerAnimation: scrollTween } })
                    }
                    if (brief) {
                        gsap.fromTo(brief, { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, scrollTrigger: { trigger: p3, start: 'left 45%', end: 'left 10%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    if (tags.length) {
                        gsap.set(tags, { opacity: 0, y: 14 })
                        gsap.to(tags, { opacity: 1, y: 0, stagger: 0.06,
                            scrollTrigger: { trigger: p3, start: 'left 35%', end: 'left 5%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                }

                /* ── Panel 04: MOUVEMENT — wave letters ── */
                const p4 = panels[3]
                if (p4) {
                    const letters = p4.querySelectorAll('[data-letter]')
                    const subtitle = p4.querySelector('[data-subtitle]')
                    const brief = p4.querySelector('[data-brief]')
                    const tags = p4.querySelectorAll('[data-tag]')

                    if (letters.length) {
                        letters.forEach((letter, i) => {
                            const waveY = Math.sin(i * 0.8) * 100 - 140
                            const waveRot = Math.sin(i * 1.1) * 20
                            gsap.fromTo(letter,
                                { y: waveY, rotation: waveRot, opacity: 0, scale: 0.4 },
                                { y: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.8,
                                    ease: 'elastic.out(1, 0.45)',
                                    scrollTrigger: { trigger: p4, start: `left ${88 - i * 5}%`, end: `left ${42 - i * 3}%`,
                                        scrub: 0.25, containerAnimation: scrollTween } })
                        })
                    }
                    if (subtitle) {
                        gsap.fromTo(subtitle, { opacity: 0, x: -30 },
                            { opacity: 0.7, x: 0, scrollTrigger: { trigger: p4, start: 'left 50%', end: 'left 15%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    if (brief) {
                        gsap.fromTo(brief, { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, scrollTrigger: { trigger: p4, start: 'left 42%', end: 'left 8%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                    if (tags.length) {
                        gsap.set(tags, { opacity: 0, y: 14 })
                        gsap.to(tags, { opacity: 1, y: 0, stagger: 0.06,
                            scrollTrigger: { trigger: p4, start: 'left 35%', end: 'left 5%', scrub: 0.4,
                                containerAnimation: scrollTween } })
                    }
                }
            })

            /* ════ MOBILE ════ */
            mm.add('(max-width: 899px)', () => {
                const cards = track.querySelectorAll<HTMLDivElement>('[data-panel]')
                cards.forEach((card) => {
                    const els = card.querySelectorAll('[data-brief], [data-title], [data-outline], [data-subtitle]')
                    const fill = card.querySelector<HTMLElement>('[data-fill]')
                    const tags = card.querySelectorAll('[data-tag]')
                    const blocks = card.querySelectorAll('[data-block]')
                    const letters = card.querySelectorAll('[data-letter]')
                    const bracketL = card.querySelector('[data-bracket-l]')
                    const bracketR = card.querySelector('[data-bracket-r]')

                    gsap.fromTo(els, { opacity: 0, y: 28 },
                        { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
                            scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none' } })

                    if (fill) {
                        gsap.fromTo(fill, { clipPath: 'inset(0 100% 0 0)' },
                            { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.out',
                                scrollTrigger: { trigger: card, start: 'top 70%', toggleActions: 'play none none none' } })
                    }
                    if (tags.length) {
                        gsap.fromTo(tags, { opacity: 0, y: 12 },
                            { opacity: 1, y: 0, stagger: 0.04, duration: 0.6,
                                scrollTrigger: { trigger: card, start: 'top 68%', toggleActions: 'play none none none' } })
                    }
                    if (blocks.length) {
                        gsap.fromTo(blocks, { opacity: 0, scale: 0.6, y: 24 },
                            { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out',
                                scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none none' } })
                    }
                    if (letters.length) {
                        letters.forEach((l, i) => {
                            gsap.fromTo(l, { opacity: 0, y: -30 - Math.sin(i) * 20, rotation: Math.sin(i) * 10 },
                                { opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)', delay: i * 0.04,
                                    scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none none' } })
                        })
                    }
                    if (bracketL) {
                        gsap.fromTo(bracketL, { x: -60, opacity: 0 }, { x: 0, opacity: 0.1, duration: 1, ease: 'expo.out',
                            scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none none' } })
                    }
                    if (bracketR) {
                        gsap.fromTo(bracketR, { x: 60, opacity: 0 }, { x: 0, opacity: 0.1, duration: 1, ease: 'expo.out',
                            scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none none' } })
                    }
                })
            })

            requestAnimationFrame(() => ScrollTrigger.refresh())

            return () => {
                mm.revert()
            }
        },
        { scope: wrapperRef, dependencies: [] }
    )

    return (
        <div ref={wrapperRef} id="services">
            {/* Header */}
            <section
                className="container-x section-y"
                style={{ background: 'var(--color-paper)', paddingBottom: 'clamp(48px, 6vw, 80px)' }}
            >
                <h2 className="display" style={{ fontSize: 'clamp(48px, 7.5vw, 112px)', lineHeight: 0.88, margin: 0, letterSpacing: '-0.048em' }}>
                    LES{' '}
                    <span className="serif-italic" style={{ letterSpacing: '-0.02em' }}>quatre</span>{' '}
                    ÉTAPES.
                </h2>
            </section>

            {/* Pinned area */}
            <div ref={pinRef} className="cap-pin">
                <div className="cap-progress-track">
                    <div ref={progressRef} className="cap-progress-fill" />
                </div>
                <span ref={counterRef} className="mono cap-counter">01{'\u2009'}/{'\u2009'}04</span>

                <div ref={trackRef} className="cap-track">
                    {/* ── Living thread SVG ── */}
                    <svg className="cap-thread-svg" viewBox="0 0 4000 1000" preserveAspectRatio="none" aria-hidden>
                        <defs>
                            <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1D1DBF" />
                                <stop offset="25%" stopColor="#1D1DBF" />
                                <stop offset="26%" stopColor="#EFEBDD" />
                                <stop offset="50%" stopColor="#EFEBDD" />
                                <stop offset="51%" stopColor="#0E0E0C" />
                                <stop offset="75%" stopColor="#0E0E0C" />
                                <stop offset="76%" stopColor="#EFEBDD" />
                                <stop offset="100%" stopColor="#EFEBDD" />
                            </linearGradient>
                        </defs>
                        <path
                            ref={threadRef}
                            d={THREAD_PATH}
                            fill="none"
                            stroke="url(#threadGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* ═══ PANEL 01 — COMPRENDRE ═══ */}
                    <div data-panel className="cap-panel" style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
                        <div className="cap-p1-layout">
                            <div className="cap-p1-hero">
                                <span data-outline className="display cap-outline-text">COMPRENDRE</span>
                                <span data-fill className="display cap-fill-text" aria-hidden>COMPRENDRE</span>
                            </div>
                            <div className="cap-p1-content">
                                <span className="mono cap-step-label" style={{ color: 'var(--color-klein)' }}>01</span>
                                <p data-brief className="cap-brief">
                                    Avant de coder, nous posons les bases. Quel est le problème ? Qui va l'utiliser ? Nous définissons l'architecture technique et le parcours utilisateur avant de lancer le moindre design.
                                </p>
                                <div className="cap-tags">
                                    {['Cadrage', 'Architecture', 'Parcours'].map(t => (
                                        <span key={t} data-tag className="mono cap-tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ PANEL 02 — INTERFACE & identité ═══ */}
                    <div data-panel className="cap-panel" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
                        <div className="cap-p2-layout">
                            <div className="cap-p2-blocks" aria-hidden>
                                <div data-block className="cap-block cap-block--1" />
                                <div data-block className="cap-block cap-block--2" />
                                <div data-block className="cap-block cap-block--3" />
                                <div data-block className="cap-block cap-block--4" />
                                <div data-block className="cap-block cap-block--5" />
                                <div data-block className="cap-block cap-block--6" />
                                <div data-block className="cap-block cap-block--7" />
                                <div data-block className="cap-block cap-block--8" />
                            </div>
                            <div className="cap-p2-content">
                                <span className="mono cap-step-label" style={{ opacity: 0.4 }}>02</span>
                                <h3 data-title className="display cap-p2-title">
                                    INTERFACE<br />
                                    <span className="serif-italic" style={{ fontSize: '0.68em', letterSpacing: '-0.01em' }}>
                                        &amp; identité.
                                    </span>
                                </h3>
                                <p data-brief className="cap-brief">
                                    Nous dessinons des interfaces modernes et sans friction. Un bon design ne se contente pas d'être beau, il rend l'application évidente dès la première seconde d'utilisation.
                                </p>
                                <div className="cap-tags">
                                    {['UI', 'Système graphique', 'Typographie'].map(t => (
                                        <span key={t} data-tag className="mono cap-tag" style={{ borderColor: 'rgba(239,235,221,0.22)' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ PANEL 03 — INGÉNIERIE front ═══ */}
                    <div data-panel className="cap-panel" style={{ background: 'var(--color-tomato)', color: 'var(--color-paper)' }}>
                        <span data-bracket-l className="display cap-bracket cap-bracket--l" aria-hidden>{'{'}</span>
                        <span data-bracket-r className="display cap-bracket cap-bracket--r" aria-hidden>{'}'}</span>
                        <div className="cap-p3-content">
                            <span className="mono cap-step-label" style={{ color: 'var(--color-ink)' }}>03</span>
                            <h3 data-title className="cap-p3-title">
                                <span data-build className="mono" style={{ fontSize: 'clamp(11px, 1.1vw, 15px)', opacity: 0.45, display: 'block', marginBottom: 10 }}>
                                    {'// build'}
                                </span>
                                <span className="display">
                                    {'INGÉNIERIE'.split('').map((ch, i) => (
                                        <span key={i} data-char className="cap-typechar">{ch}</span>
                                    ))}
                                </span><br />
                                <span className="serif-italic" style={{ fontSize: '0.68em', letterSpacing: '-0.01em' }}>
                                    {'front.'.split('').map((ch, i) => (
                                        <span key={`f${i}`} data-char className="cap-typechar">{ch}</span>
                                    ))}
                                </span>
                                <span data-cursor className="cap-cursor">_</span>
                            </h3>
                            <p data-brief className="cap-brief">
                                Le cœur du réacteur. Nous écrivons du code propre, robuste et optimisé. Votre application doit charger instantanément et fonctionner parfaitement, sur mobile comme sur desktop.
                            </p>
                            <div className="cap-tags">
                                {['React', 'TypeScript', 'SwiftUI'].map(t => (
                                    <span key={t} data-tag className="mono cap-tag" style={{ borderColor: 'rgba(14,14,12,0.25)' }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══ PANEL 04 — MOUVEMENT & détails ═══ */}
                    <div data-panel className="cap-panel" style={{ background: 'var(--color-klein)', color: 'var(--color-paper)' }}>
                        <div className="cap-p4-layout">
                            <span className="mono cap-step-label" style={{ opacity: 0.4 }}>04</span>
                            <div className="cap-p4-letters" aria-label="MOUVEMENT">
                                {'MOUVEMENT'.split('').map((ch, i) => (
                                    <span key={i} data-letter className="display cap-wave-letter">{ch}</span>
                                ))}
                            </div>
                            <h3 data-subtitle className="serif-italic cap-p4-subtitle">&amp; détails.</h3>
                            <p data-brief className="cap-brief">
                                La touche finale. Nous intégrons des micro-interactions et des transitions fluides. Ce n'est pas de la décoration : l'animation guide l'œil de l'utilisateur et rend l'expérience premium.
                            </p>
                            <div className="cap-tags">
                                {['GSAP', 'Transitions', 'Micro-interactions'].map(t => (
                                    <span key={t} data-tag className="mono cap-tag" style={{ borderColor: 'rgba(239,235,221,0.22)' }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
