import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

export default function Hero() {
    const sceneRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Matter.Engine | null>(null)
    const renderRef = useRef<Matter.Render | null>(null)
    const runnerRef = useRef<Matter.Runner | null>(null)

    useEffect(() => {
        if (!sceneRef.current) return

        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint

        const engine = Engine.create()
        engineRef.current = engine

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: window.devicePixelRatio,
            },
        })
        renderRef.current = render

        // Walls
        const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true })
        const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true })
        const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true })

        // Playful Sticker Options
        const stickerOptions = (color: string) => ({
            restitution: 0.6,
            friction: 0.1,
            render: {
                fillStyle: '#FFFFFF',
                strokeStyle: '#000000',
                lineWidth: 4,
                // We will draw the actual "sticker" feel in afterRender
            }
        })

        const shapes: Matter.Body[] = []
        const words = ['U', 'N', 'D', 'E', 'F', 'I', 'N', 'E', 'D']

        // Create sticker letters
        words.forEach((letter, i) => {
            shapes.push(
                Bodies.rectangle(
                    (window.innerWidth / 2 - 250) + i * 60,
                    -100 - i * 50,
                    60,
                    60,
                    {
                        ...stickerOptions('#FFFFFF'),
                        label: letter,
                        chamfer: { radius: 10 }
                    }
                )
            )
        })

        // Add some random "Playful" shapes (blobs/stars)
        for (let i = 0; i < 6; i++) {
            shapes.push(
                Bodies.polygon(
                    Math.random() * window.innerWidth,
                    -500 - Math.random() * 500,
                    Math.floor(Math.random() * 3) + 3,
                    40,
                    {
                        restitution: 0.8,
                        render: {
                            fillStyle: i % 2 === 0 ? '#E6E6FA' : '#FFD1DC',
                            strokeStyle: '#000000',
                            lineWidth: 4
                        }
                    }
                )
            )
        }

        Composite.add(engine.world, [ground, leftWall, rightWall, ...shapes])

        const mouse = Mouse.create(render.canvas)
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false },
            },
        })

        Composite.add(engine.world, mouseConstraint)
        render.mouse = mouse

        Render.run(render)
        const runner = Runner.create()
        runnerRef.current = runner
        Runner.run(runner, engine)

        // Custom Drawing logic for "Stickers"
        Matter.Events.on(render, 'afterRender', () => {
            const ctx = render.context
            shapes.forEach((body) => {
                if (body.label && body.label.length === 1) {
                    const { x, y } = body.position
                    ctx.save()
                    ctx.translate(x, y)
                    ctx.rotate(body.angle)

                    // Draw shadowed border for sticker feel
                    ctx.shadowColor = 'rgba(0,0,0,1)'
                    ctx.shadowBlur = 0
                    ctx.shadowOffsetX = 4
                    ctx.shadowOffsetY = 4

                    // Background of sticker
                    ctx.fillStyle = '#FFFFFF'
                    ctx.strokeStyle = '#000000'
                    ctx.lineWidth = 4
                    ctx.beginPath()
                    ctx.roundRect(-28, -28, 56, 56, 8)
                    ctx.fill()
                    ctx.stroke()

                    // Letter
                    ctx.shadowColor = 'transparent'
                    ctx.fillStyle = '#000000'
                    ctx.font = "bold 32px 'Space Grotesk'"
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(body.label, 0, 0)

                    ctx.restore()
                }
            })
        })

        const handleResize = () => {
            render.canvas.width = window.innerWidth
            render.canvas.height = window.innerHeight
            Matter.Body.setPosition(ground, Matter.Vector.create(window.innerWidth / 2, window.innerHeight + 50))
            Matter.Body.setPosition(rightWall, Matter.Vector.create(window.innerWidth + 50, window.innerHeight / 2))
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            Render.stop(render)
            Runner.stop(runner)
            if (render.canvas) render.canvas.remove()
            Composite.clear(engine.world, false)
            Engine.clear(engine)
        }
    }, [])

    return (
        <section ref={sceneRef} className="h-screen w-full relative border-b-4 border-black overflow-hidden bg-mint">
            {/* Liquid-ish Background Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <h1
                    className="font-display text-[15vw] leading-none font-black text-white mix-blend-overlay opacity-40 uppercase italic"
                    style={{ transform: 'skewY(-5deg)' }}
                >
                    EXPERIENCE
                </h1>
                <h1
                    className="font-display text-[12vw] leading-none font-black text-black uppercase -mt-[5vw]"
                    style={{ transform: 'skewY(2deg)' }}
                >
                    MAKER
                </h1>
            </div>

            {/* Playful Sticker Label - Top Left */}
            <div className="absolute top-12 left-12 z-20 animate-float">
                <div className="sticker bg-lemon text-black rotate-[-5deg]">
                    Digital Impact.
                </div>
            </div>

            {/* Floating Star - Bottom Right */}
            <div className="absolute bottom-20 right-[15%] star animate-spin-slow opacity-20 scale-150" />

            {/* Central CTA - Skewed */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
                <button className="btn-skew group">
                    <span className="flex items-center gap-4">
                        EXPLORE STUDIO
                        <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </button>
            </div>

            {/* Human/Liquid Note */}
            <div className="absolute top-[20%] right-[10%] z-20 animate-wiggle">
                <p className="font-display text-4xl font-bold italic text-black/20" style={{ transform: 'rotate(10deg)' }}>
                    Artisanal Code.
                </p>
            </div>
        </section>
    )
}
