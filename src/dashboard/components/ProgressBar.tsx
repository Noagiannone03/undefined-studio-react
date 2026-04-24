import { motion } from 'motion/react'

export function ProgressBar({ value, color = 'var(--color-ink)' }: { value: number; color?: string }) {
    const clamped = Math.max(0, Math.min(100, value))
    return (
        <div className="dash-progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
                className="dash-progress__fill"
                style={{ background: color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: clamped / 100 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
        </div>
    )
}
