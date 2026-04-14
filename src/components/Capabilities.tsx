import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Capability = {
    id: string
    title: string
    tags: string
}

const CAPABILITIES: Capability[] = [
    { id: '01', title: 'PRODUCT DESIGN', tags: 'UX / UI / Systems' },
    { id: '02', title: 'MOTION & CODE', tags: 'GSAP / WebGL / R3F' },
    { id: '03', title: 'BRAND IDENTITY', tags: 'Visual / Type / Direction' },
    { id: '04', title: 'CREATIVE TECH', tags: 'XR / AI / Web' },
]

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            gsap.from('.cap-row', {
                y: 60,
                opacity: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                    once: true,
                },
            })

            gsap.from('.cap-header > *', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
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
            id="capabilities"
            className="container-x section-y relative"
            style={{ background: 'var(--color-paper)' }}
        >
            <div
                className="cap-header flex items-end justify-between"
                style={{ marginBottom: 'clamp(40px, 5vw, 72px)' }}
            >
                <div>
                    <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                        ( 03 ) — What we do
                    </span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(44px, 6.5vw, 96px)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.045em',
                            margin: 0,
                        }}
                    >
                        CAPABILITIES
                    </h2>
                </div>
                <span className="mono label-soft" style={{ paddingBottom: 8 }}>
                    0{CAPABILITIES.length} SERVICES
                </span>
            </div>

            <div>
                {CAPABILITIES.map((c, i) => (
                    <CapabilityRow key={c.id} capability={c} isLast={i === CAPABILITIES.length - 1} />
                ))}
            </div>
        </section>
    )
}

function CapabilityRow({
    capability,
    isLast,
}: {
    capability: Capability
    isLast: boolean
}) {
    const rowRef = useRef<HTMLDivElement>(null)
    const numRef = useRef<HTMLSpanElement>(null)

    const onEnter = () => {
        gsap.to(rowRef.current, { x: 12, duration: 0.4, ease: 'power3.out' })
        gsap.to(numRef.current, {
            opacity: 1,
            color: 'var(--color-tomato)',
            duration: 0.4,
            ease: 'power2.out',
        })
    }
    const onLeave = () => {
        gsap.to(rowRef.current, { x: 0, duration: 0.5, ease: 'power3.out' })
        gsap.to(numRef.current, {
            opacity: 0.2,
            color: 'var(--color-ink)',
            duration: 0.4,
            ease: 'power2.out',
        })
    }

    return (
        <div
            ref={rowRef}
            className="cap-row hair-t"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                padding: 'clamp(28px, 4vw, 56px) 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 32,
                cursor: 'pointer',
                borderBottom: isLast ? '1px solid var(--color-hair)' : undefined,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(24px, 3vw, 48px)' }}>
                <span
                    ref={numRef}
                    className="display"
                    style={{
                        fontSize: 'clamp(48px, 6vw, 96px)',
                        opacity: 0.2,
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                    }}
                >
                    {capability.id}
                </span>
                <span
                    className="display"
                    style={{
                        fontSize: 'clamp(28px, 4vw, 56px)',
                        letterSpacing: '-0.035em',
                        lineHeight: 0.9,
                    }}
                >
                    {capability.title}
                </span>
            </div>
            <span className="mono label-soft" style={{ whiteSpace: 'nowrap' }}>
                {capability.tags}
            </span>
        </div>
    )
}
