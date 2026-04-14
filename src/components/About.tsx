import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const VALUES = ['Quality', 'Precision', 'Impact', 'Boldness']

export default function About() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.about-line', {
                yPercent: 100,
                duration: 1.1,
                stagger: 0.15,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            gsap.from('.about-right > *', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.4,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    once: true,
                },
            })

            void ScrollTrigger
        },
        { scope: sectionRef }
    )

    return (
        <section
            ref={sectionRef}
            id="about"
            className="container-x section-y relative"
            style={{ background: 'var(--color-paper)', minHeight: '100vh' }}
        >
            <div className="grid-12">
                {/* Left — massive statement */}
                <div className="col-span-12 md:col-span-7" style={{ gridColumn: 'span 7 / span 7' }}>
                    <h2
                        style={{
                            margin: 0,
                        }}
                    >
                        {(
                            [
                                { text: "WE DON’T", style: 'display', fontSize: 'clamp(48px, 7vw, 110px)' },
                                { text: 'make websites.', style: 'serif-italic', fontSize: 'clamp(44px, 6.5vw, 100px)' },
                                { text: 'WE CRAFT', style: 'display', fontSize: 'clamp(48px, 7vw, 110px)' },
                                { text: 'EXPERIENCES.', style: 'display', fontSize: 'clamp(48px, 7vw, 110px)' },
                            ] as const
                        ).map((line, i) => (
                            <span
                                key={i}
                                className="reveal-mask"
                                style={{ display: 'block' }}
                            >
                                <span
                                    className={`reveal-line about-line ${line.style}`}
                                    style={{
                                        display: 'block',
                                        fontSize: line.fontSize,
                                        lineHeight: line.style === 'serif-italic' ? 0.95 : 0.92,
                                        letterSpacing:
                                            line.style === 'serif-italic'
                                                ? '-0.025em'
                                                : '-0.045em',
                                        color:
                                            i === 3
                                                ? 'var(--color-tomato)'
                                                : 'var(--color-ink)',
                                    }}
                                >
                                    {line.text}
                                </span>
                            </span>
                        ))}
                    </h2>
                </div>

                {/* Right — paragraph + values */}
                <div
                    className="about-right"
                    style={{
                        gridColumn: 'span 5 / span 5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(40px, 5vw, 64px)',
                        paddingTop: 'clamp(24px, 4vw, 80px)',
                    }}
                >
                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — About us
                        </span>
                        <p
                            className="serif"
                            style={{
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.45,
                                margin: 0,
                                maxWidth: 440,
                            }}
                        >
                            Undefined is an independent studio building digital products,
                            brands and motion systems for people who care about detail.
                            We move fast, think long, and ship with intent.
                        </p>
                    </div>

                    <div>
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 18 }}>
                            — Values
                        </span>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            {VALUES.map((v) => (
                                <li
                                    key={v}
                                    className="display"
                                    style={{
                                        fontSize: 'clamp(22px, 2.4vw, 34px)',
                                        letterSpacing: '-0.03em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                    }}
                                >
                                    <span style={{ color: 'var(--color-klein)' }}>→</span>
                                    {v}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
