import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Footer() {
    const sectionRef = useRef<HTMLElement>(null)
    const btnRef = useRef<HTMLAnchorElement>(null)

    useMagnetic(btnRef, 0.25)

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

            gsap.from('.footer-cta', {
                y: 30,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.4,
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
                background: 'var(--color-paper)',
                paddingTop: 'clamp(100px, 14vw, 200px)',
                paddingBottom: 40,
                minHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div className="grain" />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="mono label-soft" style={{ display: 'block', marginBottom: 24 }}>
                    ( 04 ) — Get in touch
                </span>

                <h2
                    className="display"
                    style={{
                        fontSize: 'clamp(64px, 11vw, 180px)',
                        lineHeight: 0.88,
                        letterSpacing: '-0.048em',
                        margin: 0,
                        marginBottom: 'clamp(40px, 5vw, 72px)',
                    }}
                >
                    <span className="reveal-mask" style={{ display: 'block' }}>
                        <span className="reveal-line footer-line" style={{ display: 'block' }}>
                            LET’S MAKE
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

                <a
                    ref={btnRef}
                    href="mailto:hello@undefined.co"
                    className="footer-cta"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: 'clamp(18px, 2vw, 26px) clamp(28px, 3vw, 40px)',
                        border: '2px solid var(--color-ink)',
                        boxShadow: '5px 5px 0 var(--color-ink)',
                        background: 'var(--color-paper)',
                        color: 'var(--color-ink)',
                        textDecoration: 'none',
                        fontFamily: 'Archivo Black, sans-serif',
                        fontSize: 'clamp(18px, 2vw, 26px)',
                        letterSpacing: '-0.02em',
                        transition: 'box-shadow 200ms ease, transform 200ms ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '5px 5px 0 var(--color-ink)'
                    }}
                >
                    hello@undefined.co
                    <span style={{ color: 'var(--color-tomato)' }}>→</span>
                </a>
            </div>

            <div
                className="footer-meta hair-t"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 24,
                    marginTop: 'clamp(80px, 10vw, 140px)',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <span className="mono label-soft">© 2026 UNDEFINED STUDIO</span>
                <span className="mono label-soft">PARIS, FRANCE</span>
                <span className="mono label-soft">
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} className="u-draw">
                        Privacy
                    </a>
                </span>
            </div>
        </footer>
    )
}
