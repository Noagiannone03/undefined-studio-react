import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Mark from './Mark'

/**
 * Footer — the dark bookend.
 */
export default function Footer() {
    const sectionRef = useRef<HTMLElement>(null)
    const emailRef = useRef<HTMLAnchorElement>(null)

    useGSAP(
        () => {
            gsap.from('.footer-line', {
                yPercent: 110,
                duration: 1.1,
                stagger: 0.12,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    once: true,
                },
            })

            gsap.from('.footer-email', {
                y: 24,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.55,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    once: true,
                },
            })

            gsap.from('.footer-meta > *', {
                opacity: 0,
                y: 10,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    once: true,
                },
            })

            void ScrollTrigger
        },
        { scope: sectionRef }
    )

    return (
        <footer
            ref={sectionRef}
            id="contact"
            className="container-x relative"
            style={{
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
                paddingTop: 'clamp(100px, 14vw, 200px)',
                paddingBottom: 40,
                minHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
            }}
        >
            <div className="grain" />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <span
                    className="mono"
                    style={{
                        display: 'block',
                        marginBottom: 24,
                        color: 'rgba(239,235,221,0.4)',
                    }}
                >
                    ( 04 ) — Get in touch
                </span>

                {/* Headline — overflow géré par contain + taille réduite */}
                <h2
                    className="display"
                    style={{
                        fontSize: 'clamp(44px, 9vw, 155px)',
                        lineHeight: 0.88,
                        letterSpacing: '-0.048em',
                        margin: 0,
                        marginBottom: 'clamp(40px, 6vw, 80px)',
                        color: 'var(--color-paper)',
                        overflowWrap: 'break-word',
                    }}
                >
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span className="reveal-line footer-line" style={{ display: 'block' }}>
                            LET'S MAKE
                        </span>
                    </span>
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span className="reveal-line footer-line" style={{ display: 'block' }}>
                            SOMETHING
                        </span>
                    </span>
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span
                            className="reveal-line footer-line"
                            style={{ display: 'block', color: 'var(--color-klein)' }}
                        >
                            UNFORGETTABLE.
                        </span>
                    </span>
                </h2>

                {/* Email — mis en avant, pas un bouton */}
                <div className="footer-email">
                    <span
                        className="mono"
                        style={{
                            display: 'block',
                            marginBottom: 14,
                            color: 'rgba(239,235,221,0.38)',
                            fontSize: 11,
                            letterSpacing: '0.2em',
                        }}
                    >
                        WRITE US
                    </span>
                    <a
                        ref={emailRef}
                        href="mailto:hello@undefined.co"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'clamp(12px, 1.5vw, 20px)',
                            textDecoration: 'none',
                            borderBottom: '1px solid rgba(239,235,221,0.2)',
                            paddingBottom: 10,
                            transition: 'border-color 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderBottomColor = 'var(--color-tomato)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderBottomColor = 'rgba(239,235,221,0.2)'
                        }}
                    >
                        <span
                            className="display"
                            style={{
                                fontSize: 'clamp(22px, 3.5vw, 52px)',
                                letterSpacing: '-0.03em',
                                color: 'var(--color-paper)',
                                lineHeight: 1,
                            }}
                        >
                            hello@undefined.co
                        </span>
                        <Mark
                            size={32}
                            color="var(--color-tomato)"
                            color2="var(--color-klein)"
                        />
                    </a>
                </div>
            </div>

            {/* Footer meta */}
            <div
                className="footer-meta"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 24,
                    marginTop: 'clamp(80px, 10vw, 140px)',
                    borderTop: '1px solid rgba(239,235,221,0.12)',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    © 2026 UNDEFINED STUDIO
                </span>
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    PARIS, FRANCE
                </span>
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    <a
                        href="#"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        className="u-draw"
                    >
                        Privacy
                    </a>
                </span>
            </div>
        </footer>
    )
}
