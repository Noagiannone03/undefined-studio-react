import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Mark from './Mark'

export default function Footer() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.footer-line', {
                yPercent: 110,
                duration: 1.1,
                stagger: 0.12,
                ease: 'expo.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })

            gsap.from('.footer-email', {
                y: 24,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.55,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })

            gsap.from('.footer-meta > *', {
                opacity: 0,
                y: 10,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            })
        },
        { scope: sectionRef }
    )

    return (
        <footer ref={sectionRef} id="contact" className="footer-section container-x">
            <div className="grain" />

            <div className="footer-head">
                <h2 className="footer-h2">
                    <span className="reveal-mask">
                        <span className="reveal-line footer-line">UN PRODUIT</span>
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line footer-line serif-italic">à lancer ?</span>
                    </span>
                    <span className="reveal-mask">
                        <span className="reveal-line footer-line" style={{ color: 'var(--color-klein)' }}>
                            PARLONS-EN.
                        </span>
                    </span>
                </h2>

                <div className="footer-email">
                    <a
                        href="mailto:hello@undefined.co"
                        className="footer-email-link"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderBottomColor = 'var(--color-tomato)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderBottomColor = 'rgba(239,235,221,0.2)'
                        }}
                    >
                        <span className="footer-email-text">hello@undefined.co</span>
                        <Mark size={28} color="var(--color-tomato)" color2="var(--color-klein)" />
                    </a>
                </div>
            </div>

            <div className="footer-meta">
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    © 2026 UNDEFINED STUDIO
                </span>
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    MARSEILLE, FRANCE
                </span>
                <span className="mono" style={{ color: 'rgba(239,235,221,0.4)' }}>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} className="u-draw">
                        Confidentialité
                    </a>
                </span>
            </div>
        </footer>
    )
}
