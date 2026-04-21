import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BrandMark() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const trackRef   = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!wrapperRef.current || !trackRef.current) return

        const track   = trackRef.current
        const wrapper = wrapperRef.current

        const ctx = gsap.context(() => {

            // ── 1. Pin + horizontal scroll ──────────────────────────────
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
                },
            })

            // ── 2. Clip-path reveal : chaque élément "s'écrit" de gauche à droite ──
            gsap.utils.toArray<HTMLElement>('.bm-reveal').forEach((el) => {
                gsap.fromTo(
                    el,
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

            // ── 3. Stroke draw des chevrons ──────────────────────────────
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

            // ── 4. Scale up/down des panels au passage ───────────────────
            gsap.utils.toArray<HTMLElement>('.bm-panel').forEach((panel) => {
                gsap.fromTo(
                    panel,
                    { scale: 0.88, filter: 'blur(12px)' },
                    {
                        scale: 1,
                        filter: 'blur(0px)',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: hTween,
                            start: 'left 90%',
                            end: 'left 50%',
                            scrub: true,
                        },
                    }
                )
                gsap.fromTo(
                    panel,
                    { scale: 1, filter: 'blur(0px)' },
                    {
                        scale: 0.88,
                        filter: 'blur(10px)',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: hTween,
                            start: 'left 50%',
                            end: 'left 10%',
                            scrub: true,
                        },
                    }
                )
            })

        }, wrapperRef)

        return () => ctx.revert()
    }, [])

    return (
        /* ── Wrapper — hauteur = espace de scroll ── */
        <div
            ref={wrapperRef}
            id="brand-mark"
            style={{ background: 'var(--color-ink)' }}
        >
            {/* ── Track horizontal ── */}
            <div
                ref={trackRef}
                style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    height: '100vh',
                    willChange: 'transform',
                }}
            >

                {/* ═══ Panel 0 : >> Icône ═══ */}
                <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'center', gap: 'clamp(8px, 1.4vw, 24px)' }}>
                    {/* Ligne de guidage */}
                    <div style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        top: '50%',
                        height: 1,
                        background: 'rgba(239,235,221,0.06)',
                    }} />
                    <svg viewBox="0 0 28 40" fill="none" overflow="visible"
                        style={{ width: 'clamp(50px, 9vw, 140px)', display: 'block', filter: 'drop-shadow(0 0 48px rgba(29,29,191,0.8))' }}>
                        <path className="bm-path"
                            d="M4 4L22 20L4 36"
                            stroke="#1D1DBF" strokeWidth="3.4"
                            strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <svg viewBox="0 0 28 40" fill="none" overflow="visible"
                        style={{ width: 'clamp(50px, 9vw, 140px)', display: 'block', filter: 'drop-shadow(0 0 48px rgba(232,74,42,0.8))' }}>
                        <path className="bm-path"
                            d="M4 4L22 20L4 36"
                            stroke="#E84A2A" strokeWidth="3.4"
                            strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>

                    {/* Numéro de section discret */}
                    <span className="mono" style={{
                        position: 'absolute',
                        bottom: 'clamp(24px, 4vw, 48px)',
                        right: 'clamp(24px, 4vw, 48px)',
                        fontSize: 10,
                        letterSpacing: '0.26em',
                        color: 'rgba(239,235,221,0.22)',
                    }}>
                        03 — PROJETS
                    </span>
                </Panel>

                {/* ═══ Panel 1 : CE ═══ */}
                <Panel className="bm-panel" extraStyle={{ alignItems: 'flex-end', paddingBottom: 'clamp(32px, 6vw, 88px)' }}>
                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="display" style={{
                            display: 'block',
                            fontSize: 'clamp(100px, 24vw, 380px)',
                            color: 'var(--color-paper)',
                            letterSpacing: '-0.052em',
                            lineHeight: 0.84,
                        }}>
                            CE
                        </span>
                    </div>
                </Panel>

                {/* ═══ Panel 2 : QU'ON ═══ */}
                <Panel className="bm-panel" width="140vw" extraStyle={{ alignItems: 'flex-start', paddingTop: 'clamp(32px, 6vw, 88px)' }}>
                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="display" style={{
                            display: 'block',
                            fontSize: 'clamp(80px, 19vw, 310px)',
                            color: 'var(--color-paper)',
                            letterSpacing: '-0.052em',
                            lineHeight: 0.84,
                            whiteSpace: 'nowrap',
                        }}>
                            QU'ON
                        </span>
                    </div>

                    {/* Accent rule intermédiaire */}
                    <div className="bm-reveal" style={{
                        position: 'absolute',
                        bottom: 'clamp(40px, 7vw, 100px)',
                        left: 0,
                        width: '60%',
                        height: 2,
                        background: 'var(--color-klein)',
                        overflow: 'hidden',
                    }} />
                </Panel>

                {/* ═══ Panel 3 : a ═══ */}
                <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="serif-italic" style={{
                            display: 'block',
                            fontSize: 'clamp(120px, 28vw, 440px)',
                            color: 'var(--color-paper)',
                            letterSpacing: '-0.04em',
                            lineHeight: 0.84,
                        }}>
                            a
                        </span>
                    </div>
                </Panel>

                {/* ═══ Panel 4 : fait. ═══ */}
                <Panel className="bm-panel" width="140vw" extraStyle={{ alignItems: 'flex-end', paddingBottom: 'clamp(32px, 6vw, 88px)' }}>
                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="serif-italic" style={{
                            display: 'block',
                            fontSize: 'clamp(90px, 21vw, 340px)',
                            color: 'var(--color-tomato)',
                            letterSpacing: '-0.04em',
                            lineHeight: 0.84,
                            whiteSpace: 'nowrap',
                        }}>
                            fait.
                        </span>
                    </div>

                    {/* Ligne de fin */}
                    <div style={{
                        position: 'absolute',
                        top: 'clamp(32px, 6vw, 88px)',
                        right: 0,
                        width: 1,
                        height: '40%',
                        background: 'rgba(239,235,221,0.14)',
                    }} />
                </Panel>

                {/* ═══ Panel 5 : Outro ═══ */}
                <Panel className="bm-panel" extraStyle={{ justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 36px)' }}>
                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="mono" style={{
                            display: 'block',
                            fontSize: 10,
                            letterSpacing: '0.28em',
                            color: 'rgba(239,235,221,0.4)',
                        }}>
                            ( 03 ) — CE QU'ON A FAIT
                        </span>
                    </div>

                    <div className="bm-reveal" style={{ width: 'clamp(40px, 6vw, 90px)', height: 1, background: 'rgba(239,235,221,0.18)' }} />

                    <div className="bm-reveal" style={{ overflow: 'hidden' }}>
                        <span className="display" style={{
                            display: 'block',
                            fontSize: 'clamp(14px, 1.6vw, 22px)',
                            color: 'var(--color-paper)',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.4,
                            maxWidth: '20ch',
                        }}>
                            Nos projets parlent mieux que nous.
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 'clamp(8px, 1vw, 16px)', flexWrap: 'wrap' }}>
                        {['Branding', 'Interfaces', 'Motion'].map((tag) => (
                            <div className="bm-reveal" key={tag} style={{
                                border: '1px solid rgba(239,235,221,0.22)',
                                padding: '5px 12px',
                                overflow: 'hidden',
                            }}>
                                <span className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,235,221,0.55)' }}>
                                    {tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </Panel>

            </div>
        </div>
    )
}

/* ── Composant Panel helper ── */
function Panel({
    children,
    className = '',
    width = '100vw',
    extraStyle = {},
}: {
    children: React.ReactNode
    className?: string
    width?: string
    extraStyle?: React.CSSProperties
}) {
    return (
        <div
            className={className}
            style={{
                width,
                minWidth: width,
                height: '100vh',
                flexShrink: 0,
                position: 'relative',
                display: 'flex',
                padding: '0 var(--side-spacing)',
                ...extraStyle,
            }}
        >
            {children}
        </div>
    )
}
