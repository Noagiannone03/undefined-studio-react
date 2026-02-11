export default function GrainOverlay({ opacity = 0.35 }: { opacity?: number }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none mix-blend-overlay"
            style={{ opacity }}
        >
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    )
}
