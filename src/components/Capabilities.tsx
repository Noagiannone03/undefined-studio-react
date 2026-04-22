import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'

type Service = {
    id: string
    name: string
    nameItalic: string
    stack: string[]
    accent: string
    brief: string
    gradient: string
}

const SERVICES: Service[] = [
    {
        id: '01',
        name: 'COMPRENDRE',
        nameItalic: '',
        stack: ['Cadrage', 'Architecture', 'Parcours'],
        accent: 'var(--color-klein)',
        brief: "Avant d'écrire la moindre ligne, on pose les vraies questions. Quel problème on règle. Pour qui. Ce qui se passe si on ne le fait pas. Et, parfois, si une app est vraiment la bonne réponse.",
        gradient: 'linear-gradient(135deg, #1D1DBF 0%, #0E0E0C 100%)',
    },
    {
        id: '02',
        name: 'INTERFACE &',
        nameItalic: 'identité.',
        stack: ['UI', 'Système graphique', 'Typographie'],
        accent: 'var(--color-ink)',
        brief: "Un outil qu'on garde ouvert, c'est un outil bien bâti. On construit des interfaces qu'on utilise avec plaisir — pas qu'on subit. L'identité, c'est ce qui les rend reconnaissables au premier coup d'œil.",
        gradient: 'linear-gradient(135deg, #0E0E0C 0%, #2d2d28 100%)',
    },
    {
        id: '03',
        name: 'INGÉNIERIE',
        nameItalic: 'front.',
        stack: ['React', 'TypeScript', 'SwiftUI'],
        accent: 'var(--color-tomato)',
        brief: "Un produit qui rame, c'est un produit qu'on abandonne. On tient au code comme au reste — propre, rapide, solide sur les vieux téléphones comme sur les derniers.",
        gradient: 'linear-gradient(135deg, #E84A2A 0%, #8B2A16 100%)',
    },
    {
        id: '04',
        name: 'MOUVEMENT &',
        nameItalic: 'détails.',
        stack: ['GSAP', 'Transitions', 'Micro-interactions'],
        accent: 'var(--color-klein)',
        brief: "Le mouvement sert à quelque chose ou il ne sert à rien. Il doit indiquer, rassurer, donner un poids aux choses. On le met quand il aide. Pas pour faire joli.",
        gradient: 'linear-gradient(135deg, #1D1DBF 0%, #E84A2A 100%)',
    },
]

const EXPO = [0.16, 1, 0.3, 1] as const

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-12%' })
    const [activeId, setActiveId] = useState<string>('01')

    const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0]

    return (
        <section
            ref={sectionRef}
            id="services"
            className="capabilities-section container-x section-y"
            style={{ background: 'var(--color-paper)', position: 'relative' }}
        >
            {/* ── Desktop layout: 2 columns ── */}
            <div className="cap-inner" style={{
                display: 'grid',
                gap: 'clamp(40px, 6vw, 96px)',
                alignItems: 'start',
            }}>

                {/* LEFT: header + list */}
                <div>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: EXPO }}
                        style={{ marginBottom: 'clamp(40px, 5.5vw, 72px)' }}
                    >
                        <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                            ( 04 ) — Ce qu'on sait faire
                        </span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(48px, 7.5vw, 112px)',
                                lineHeight: 0.88,
                                margin: 0,
                                letterSpacing: '-0.048em',
                            }}
                        >
                            LES{' '}
                            <span className="serif-italic" style={{ letterSpacing: '-0.02em' }}>
                                quatre
                            </span>{' '}
                            ÉTAPES.
                        </h2>
                    </motion.div>

                    {/* Service rows */}
                    <div style={{ borderTop: '1px solid var(--color-hair)' }}>
                        {SERVICES.map((service, i) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                                animate={isInView ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' } : {}}
                                transition={{ duration: 0.65, ease: EXPO, delay: 0.08 + i * 0.10 }}
                            >
                                <ServiceRow
                                    service={service}
                                    isActive={activeId === service.id}
                                    onEnter={() => setActiveId(service.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: sticky preview card */}
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.9, ease: EXPO, delay: 0.22 }}
                    style={{
                        position: 'sticky',
                        top: 'clamp(80px, 10vh, 120px)',
                    }}
                    className="cap-preview"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeService.id}
                            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.28, ease: EXPO }}
                            style={{
                                border: '2px solid var(--color-ink)',
                                boxShadow: `8px 8px 0 ${activeService.accent}`,
                                background: 'var(--color-paper)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Visual header */}
                            <div style={{
                                height: 'clamp(100px, 14vw, 160px)',
                                background: activeService.gradient,
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <div className="grain" style={{ opacity: 0.09 }} />

                                {/* Accent bar top */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0,
                                    height: 3, background: 'rgba(255,255,255,0.20)',
                                }} />

                                {/* Giant number watermark */}
                                <span
                                    className="display"
                                    style={{
                                        position: 'absolute',
                                        bottom: -16,
                                        right: 12,
                                        fontSize: 'clamp(80px, 12vw, 130px)',
                                        color: 'rgba(255,255,255,0.10)',
                                        lineHeight: 1,
                                        letterSpacing: '-0.06em',
                                        userSelect: 'none',
                                    }}
                                >
                                    {activeService.id}
                                </span>

                                {/* Service name overlay */}
                                <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
                                    <span className="display" style={{
                                        fontSize: 'clamp(11px, 1.4vw, 16px)',
                                        color: 'rgba(255,255,255,0.88)',
                                        letterSpacing: '0.22em',
                                        display: 'block',
                                    }}>
                                        {activeService.name}
                                        {activeService.nameItalic && (
                                            <span className="serif-italic" style={{ letterSpacing: '0.1em', marginLeft: '0.3em' }}>
                                                {activeService.nameItalic}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
                                {/* Stack pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                    {activeService.stack.map((tag) => (
                                        <span
                                            key={tag}
                                            className="mono"
                                            style={{
                                                fontSize: 9,
                                                letterSpacing: '0.18em',
                                                color: 'var(--color-ink)',
                                                border: '1px solid var(--color-hair)',
                                                padding: '3px 8px',
                                                display: 'inline-block',
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Brief */}
                                <p style={{
                                    margin: 0,
                                    fontFamily: 'Satoshi, sans-serif',
                                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                                    lineHeight: 1.58,
                                    color: 'var(--color-ink)',
                                    opacity: 0.82,
                                }}>
                                    {activeService.brief}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    )
}

function ServiceRow({
    service,
    isActive,
    onEnter,
}: {
    service: Service
    isActive: boolean
    onEnter: () => void
}) {
    return (
        <div
            className="cap-row"
            onMouseEnter={onEnter}
            style={{
                position: 'relative',
                padding: 'clamp(22px, 2.8vw, 38px) 0',
                borderBottom: '1px solid var(--color-hair)',
                cursor: 'default',
                overflow: 'hidden',
            }}
        >
            {/* Fill slides from left on active */}
            <motion.div
                initial={false}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{ duration: 0.40, ease: EXPO }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: service.accent,
                    transformOrigin: 'left',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            {/* Large ghost number */}
            <AnimatePresence>
                {isActive && (
                    <motion.span
                        key="num"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 0.06, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.32, ease: 'easeOut' }}
                        className="display"
                        style={{
                            position: 'absolute',
                            right: 'clamp(6px, 1.5vw, 20px)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 'clamp(72px, 14vw, 180px)',
                            lineHeight: 1,
                            color: 'var(--color-paper)',
                            pointerEvents: 'none',
                            zIndex: 1,
                            letterSpacing: '-0.05em',
                        }}
                    >
                        {service.id}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Row content */}
            <motion.div
                animate={{ x: isActive ? 6 : 0 }}
                transition={{ duration: 0.36, ease: EXPO }}
                style={{ position: 'relative', zIndex: 2, padding: '0 clamp(2px, 0.8vw, 12px)' }}
            >
                <div className="cap-row-main" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(12px, 2.4vw, 36px)',
                    flexWrap: 'wrap',
                }}>
                    {/* Number */}
                    <motion.span
                        animate={{ color: isActive ? 'var(--color-paper)' : 'var(--color-ink)' }}
                        transition={{ duration: 0.16 }}
                        className="mono"
                        style={{ fontSize: 11, letterSpacing: '0.22em', opacity: 0.44, flexShrink: 0 }}
                    >
                        {service.id}
                    </motion.span>

                    {/* Name — display + serif italic mix */}
                    <motion.h3
                        animate={{ color: isActive ? 'var(--color-paper)' : 'var(--color-ink)' }}
                        transition={{ duration: 0.16 }}
                        className="display cap-service-name"
                        style={{
                            fontSize: 'clamp(24px, 3.6vw, 52px)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {service.name}
                        {service.nameItalic && (
                            <span
                                className="serif-italic"
                                style={{
                                    letterSpacing: '-0.015em',
                                    marginLeft: '0.2em',
                                    fontSize: '0.88em',
                                }}
                            >
                                {service.nameItalic}
                            </span>
                        )}
                    </motion.h3>

                    {/* Arrow */}
                    <motion.span
                        animate={{
                            color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                            x: isActive ? 4 : 0,
                            opacity: isActive ? 0.9 : 0.4,
                        }}
                        transition={{ duration: 0.20, ease: EXPO }}
                        style={{ fontSize: 20, flexShrink: 0 }}
                    >
                        →
                    </motion.span>
                </div>

                {/* Brief — expands on mobile (no floating card) */}
                <AnimatePresence>
                    {isActive && (
                        <motion.p
                            key="brief"
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 6 }}
                            transition={{ duration: 0.32, ease: EXPO, delay: 0.05 }}
                            className="serif cap-brief brief-mobile-only"
                            style={{
                                fontSize: 'clamp(13px, 1.1vw, 16px)',
                                lineHeight: 1.55,
                                color: 'var(--color-paper)',
                                margin: 0,
                                marginTop: 'clamp(10px, 1.4vw, 18px)',
                                paddingLeft: 'clamp(36px, 4.5vw, 64px)',
                                maxWidth: '44ch',
                                overflow: 'hidden',
                            }}
                        >
                            {service.brief}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
