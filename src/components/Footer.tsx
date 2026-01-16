import { useRef, useEffect, useState } from 'react'

export default function Footer() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLElement>(null)
    const [scratchDone, setScratchDone] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            const rect = container.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.height

            // Soft Silver Pattern
            ctx.fillStyle = '#E2E2E2'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw some "dirty" hand-drawn circles for texture
            ctx.strokeStyle = '#CCCCCC'
            ctx.lineWidth = 1
            for (let i = 0; i < 100; i++) {
                ctx.beginPath()
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 50, 0, Math.PI * 2)
                ctx.stroke()
            }

            // Add "SCRATCH" indicator in center with Neo-Brutal look
            ctx.globalCompositeOperation = 'source-over'

            // Draw a big black circle in center first
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2)
            ctx.fill()

            ctx.font = "bold 20px 'Space Grotesk'"
            ctx.fillStyle = '#FFFFFF'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 10)
            ctx.fillText('🎁', canvas.width / 2, canvas.height / 2 + 25)
        }

        resize()
        window.addEventListener('resize', resize)

        let isDrawing = false
        let totalScratched = 0
        let points: { x: number, y: number }[] = []

        const getPosition = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
            return { x: clientX - rect.left, y: clientY - rect.top }
        }

        const startDraw = (e: MouseEvent | TouchEvent) => {
            isDrawing = true
            points = [getPosition(e)]
        }

        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing) return
            e.preventDefault()

            const currentPoint = getPosition(e)
            const lastPoint = points[points.length - 1]

            ctx.globalCompositeOperation = 'destination-out'
            ctx.lineWidth = 80
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.beginPath()
            ctx.moveTo(lastPoint.x, lastPoint.y)
            ctx.lineTo(currentPoint.x, currentPoint.y)
            ctx.stroke()

            points.push(currentPoint)
            totalScratched++

            // Auto-reveal if scratched enough
            if (totalScratched > 500 && !scratchDone) {
                setScratchDone(true)
            }
        }

        const endDraw = () => { isDrawing = false }

        canvas.addEventListener('mousedown', startDraw)
        canvas.addEventListener('mousemove', draw)
        canvas.addEventListener('mouseup', endDraw)
        canvas.addEventListener('touchstart', startDraw, { passive: false })
        canvas.addEventListener('touchmove', draw, { passive: false })
        canvas.addEventListener('touchend', endDraw)

        return () => {
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousedown', startDraw)
            canvas.removeEventListener('mousemove', draw)
            canvas.removeEventListener('mouseup', endDraw)
            canvas.removeEventListener('touchstart', startDraw)
            canvas.removeEventListener('touchmove', draw)
            canvas.removeEventListener('touchend', endDraw)
        }
    }, [scratchDone])

    return (
        <footer ref={containerRef} className="relative w-full h-[80vh] bg-black text-white overflow-hidden">

            {/* Hidden Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-mint p-6">
                <div className="star w-40 h-40 bg-lemon absolute top-10 right-10 animate-spin-slow" />
                <div className="star w-20 h-20 bg-peach absolute bottom-20 left-10 animate-wiggle" />

                <h2 className="font-display text-8xl md:text-[12vw] font-black text-black text-center leading-none italic uppercase mb-12" style={{ transform: 'skewX(-5deg)' }}>
                    WANT<br />MORE?
                </h2>

                <div className="flex flex-col items-center gap-8 relative z-20">
                    <a href="mailto:hello@undefined.studio" className="font-display text-2xl md:text-5xl font-black text-black hover:scale-110 transition-transform">
                        HELLO@UNDEFINED.STUDIO
                    </a>

                    <button className="btn-skew bg-lemon text-black text-3xl px-12 py-6 h-auto">
                        <span>LET'S START!</span>
                    </button>
                </div>

                {/* Floating Stickers */}
                <div className="sticker absolute top-1/4 left-10 -rotate-12 bg-white">Pop & Cool</div>
                <div className="sticker absolute bottom-1/4 right-10 rotate-6 bg-white">No Corporate</div>
            </div>

            {/* Surface */}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 z-10 cursor-crosshair transition-opacity duration-1000 ${scratchDone ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />

            <div className="absolute bottom-6 w-full text-center z-20 pointer-events-none">
                <p className="font-display font-bold text-black/40 text-xs tracking-widest uppercase">UNDEFINED STUDIO © HUMAN EXPERIENCE 2026</p>
            </div>
        </footer>
    )
}
