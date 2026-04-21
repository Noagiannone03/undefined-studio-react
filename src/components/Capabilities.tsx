import { useRef, useState, useCallback } from 'react'
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'motion/react'

type Service = {
    id: string
    name: string
    stack: string[]
    accent: string
    brief: string
    visual: string
}

const SERVICES: Service[] = [
    {
        id: '01',
        name: 'FONDATIONS',
        stack: ['Stratégie', 'Architecture', 'UX Design'],
        accent: 'var(--color-klein)',
        brief: "On ne colorie pas des cases. On pose d'abord les vraies questions pour s'assurer que le produit tient debout avant même la première maquette.",
        visual: 'linear-gradient(135deg, #1D1DBF 0%, #0E0E0C 100%)',
    },
    {
        id: '02',
        name: 'DIRECTION ARTISTIQUE',
        stack: ['UI Design', 'Identité Visuelle', 'Systèmes'],
        accent: 'var(--color-ink)',
        brief: "La première impression est toujours visuelle. On crée des interfaces avec un vrai parti-pris, pour que vous ne ressembliez à personne d'autre.",
        visual: 'linear-gradient(135deg, #0E0E0C 0%, #2d2d28 100%)',
    },
    {
        id: '03',
        name: 'INGÉNIERIE FRONT',
        stack: ['React', 'TypeScript', 'WebGL'],
        accent: 'var(--color-tomato)',
        brief: "Un beau design ne vaut rien s'il rame. On écrit un code robuste, optimisé et pensé dès le premier jour pour la performance absolue.",
        visual: 'linear-gradient(135deg, #E84A2A 0%, #8B2A16 100%)',
    },
    {
        id: '04',
        name: 'PHYSIQUE & MOTION',
        stack: ['GSAP', 'Animations', 'Micro-interactions'],
        accent: 'var(--color-klein)',
        brief: "L'immobilité c'est la mort. On ajoute de la gravité, de la friction et du rythme pour rendre chaque interaction organique et foudroyante.",
        visual: 'linear-gradient(135deg, #1D1DBF 0%, #E84A2A 100%)',
    },
]

const EXPO_OUT = [0.16, 1, 0.3, 1] as const

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const headerVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: EXPO_OUT },
    },
}

const rowVariants = {
    hidden: { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
    visible: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        transition: { duration: 0.7, ease: EXPO_OUT },
    },
}

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-15%' })
    const [activeId, setActiveId] = useState<string | null>(null)

    // Spring-tracked cursor for floating card
    const rawX = useMotionValue(-600)
    const rawY = useMotionValue(-600)
    const cardX = useSpring(rawX, { stiffness: 130, damping: 18, mass: 0.5 })
    const cardY = useSpring(rawY, { stiffness: 130, damping: 18, mass: 0.5 })

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            rawX.set(e.clientX + 28)
            rawY.set(e.clientY + 28)
        },
        [rawX, rawY]
    )

    const activeService = SERVICES.find((s) => s.id === activeId) ?? null

    return (
        <section
            ref={sectionRef}
            id="services"
            className="capabilities-section container-x section-y"
            style={{ background: 'var(--color-paper)', position: 'relative' }}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                {/* Header */}
                <motion.div
                    variants={headerVariants}
                    className="cap-header"
                    style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}
                >
                    <span className="mono label-soft" style={{ display: 'block', marginBottom: 14 }}>
                        ( 04 ) — Ce qu'on fait
                    </span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(44px, 6.5vw, 96px)',
                            lineHeight: 0.9,
                            margin: 0,
                            letterSpacing: '-0.045em',
                        }}
                    >
                        NOS{' '}
                        <span className="serif-italic" style={{ letterSpacing: '-0.02em' }}>
                            métiers.
                        </span>
                    </h2>
                </motion.div>

                {/* Service list */}
                <div className="cap-list" style={{ borderTop: '1px solid var(--color-hair)' }}>
                    {SERVICES.map((service, i) => (
                        <motion.div key={service.id} variants={rowVariants} custom={i}>
                            <ServiceRow
                                service={service}
                                onEnter={() => setActiveId(service.id)}
                                onLeave={() => setActiveId(null)}
                            />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Floating cursor card — desktop only (no touch events) */}
            <AnimatePresence mode="wait">
                {activeService && (
                    <motion.div
                        key={activeService.id}
                        initial={{ opacity: 0, scale: 0.86, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.86, filter: 'blur(10px)' }}
                        transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            x: cardX,
                            y: cardY,
                            zIndex: 9999,
                            pointerEvents: 'none',
                            width: 268,
                        }}
                    >
                        <div
                            style={{
                                border: '2px solid var(--color-ink)',
                                boxShadow: `7px 7px 0 ${activeService.accent}`,
                                background: 'var(--color-paper)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Visual header */}
                            <div
                                style={{
                                    height: 88,
                                    background: activeService.visual,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div className="grain" style={{ opacity: 0.08 }} />
                                <span
                                    className="display"
                                    style={{
                                        position: 'absolute',
                                        bottom: -10,
                                        right: 10,
                                        fontSize: 72,
                                        color: 'rgba(255,255,255,0.10)',
                                        lineHeight: 1,
                                        letterSpacing: '-0.06em',
                                        userSelect: 'none',
                                    }}
                                >
                                    {activeService.id}
                                </span>
                                {/* Accent bar top */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        background: 'rgba(255,255,255,0.18)',
                                    }}
                                />
                            </div>

                            {/* Brief */}
                            <div style={{ padding: '14px 16px 18px' }}>
                                <span
                                    className="mono"
                                    style={{
                                        display: 'block',
                                        fontSize: 9,
                                        letterSpacing: '0.2em',
                                        color: 'var(--color-ink)',
                                        opacity: 0.38,
                                        marginBottom: 9,
                                    }}
                                >
                                    {activeService.stack.join(' · ')}
                                </span>
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: 'Satoshi, sans-serif',
                                        fontSize: 12.5,
                                        lineHeight: 1.55,
                                        color: 'var(--color-ink)',
                                        opacity: 0.82,
                                    }}
                                >
                                    {activeService.brief}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

function ServiceRow({
    service,
    onEnter,
    onLeave,
}: {
    service: Service
    onEnter: () => void
    onLeave: () => void
}) {
    const [hovered, setHovered] = useState(false)

    const handleEnter = () => { setHovered(true); onEnter() }
    const handleLeave = () => { setHovered(false); onLeave() }

    return (
        <div
            className="cap-row"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
                position: 'relative',
                padding: 'clamp(26px, 3.2vw, 44px) 0',
                borderBottom: '1px solid var(--color-hair)',
                cursor: 'default',
                overflow: 'hidden',
            }}
        >
            {/* Fill — slides from left */}
            <motion.div
                initial={false}
                animate={{ scaleX: hovered ? 1 : 0 }}
                transition={{ duration: 0.42, ease: EXPO_OUT }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: service.accent,
                    transformOrigin: 'left',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            {/* Decorative large number */}
            <AnimatePresence>
                {hovered && (
                    <motion.span
                        key="bignum"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 0.07, x: 0 }}
                        exit={{ opacity: 0, x: 14 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="display"
                        style={{
                            position: 'absolute',
                            right: 'clamp(8px, 2vw, 24px)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 'clamp(80px, 16vw, 200px)',
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

            {/* Row content — shifts right on hover */}
            <motion.div
                animate={{ x: hovered ? 8 : 0 }}
                transition={{ duration: 0.38, ease: EXPO_OUT }}
                style={{ position: 'relative', zIndex: 2, padding: '0 clamp(4px, 1vw, 16px)' }}
            >
                <div
                    className="cap-row-main"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(16px, 3vw, 40px)',
                        flexWrap: 'wrap',
                    }}
                >
                    <motion.span
                        animate={{ color: hovered ? 'var(--color-paper)' : 'var(--color-ink)' }}
                        transition={{ duration: 0.18 }}
                        className="mono"
                        style={{
                            fontSize: 11,
                            letterSpacing: '0.22em',
                            opacity: hovered ? 0.5 : 0.4,
                            flexShrink: 0,
                        }}
                    >
                        {service.id}
                    </motion.span>

                    <motion.h3
                        animate={{ color: hovered ? 'var(--color-paper)' : 'var(--color-ink)' }}
                        transition={{ duration: 0.18 }}
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 4vw, 56px)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            flex: 1,
                            minWidth: 200,
                        }}
                    >
                        {service.name}
                    </motion.h3>

                    <motion.span
                        animate={{ color: hovered ? 'var(--color-paper)' : 'var(--color-ink)' }}
                        transition={{ duration: 0.18 }}
                        className="mono"
                        style={{
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            opacity: hovered ? 0.55 : 0.45,
                            flexShrink: 0,
                        }}
                    >
                        {service.stack.join(' · ')}
                    </motion.span>

                    <motion.span
                        animate={{
                            color: hovered ? 'var(--color-paper)' : 'var(--color-ink)',
                            x: hovered ? 4 : 0,
                            opacity: hovered ? 0.9 : 0.5,
                        }}
                        transition={{ duration: 0.22, ease: EXPO_OUT }}
                        style={{ fontSize: 18, flexShrink: 0 }}
                    >
                        →
                    </motion.span>
                </div>

                {/* Brief — in-row expand for mobile / fallback */}
                <AnimatePresence>
                    {hovered && (
                        <motion.p
                            key="brief"
                            initial={{ opacity: 0, y: 12, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 6, height: 0 }}
                            transition={{ duration: 0.35, ease: EXPO_OUT, delay: 0.06 }}
                            className="serif cap-brief brief-mobile-only"
                            style={{
                                fontSize: 'clamp(14px, 1.2vw, 17px)',
                                lineHeight: 1.5,
                                color: 'var(--color-paper)',
                                margin: 0,
                                marginTop: 'clamp(12px, 1.5vw, 20px)',
                                paddingLeft: 'clamp(40px, 5vw, 70px)',
                                maxWidth: '48ch',
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
