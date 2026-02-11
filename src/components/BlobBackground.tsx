import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function BlobBackground({ colors = ['bg-mint', 'bg-peach', 'bg-lilac'] }: { colors?: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.to('.blob', {
            y: "random(-50, 50)",
            x: "random(-50, 50)",
            scale: "random(0.8, 1.2)",
            rotation: "random(-20, 20)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: {
                amount: 2,
                from: "random"
            }
        })
    }, { scope: containerRef })

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className={`blob absolute top-[10%] left-[10%] w-[40vw] h-[40vw] ${colors[0]} rounded-full mix-blend-multiply filter blur-[80px] opacity-70`} />
            <div className={`blob absolute bottom-[10%] right-[10%] w-[45vw] h-[45vw] ${colors[1]} rounded-full mix-blend-multiply filter blur-[80px] opacity-70`} />
            <div className={`blob absolute top-[40%] left-[40%] w-[30vw] h-[30vw] ${colors[2]} rounded-full mix-blend-multiply filter blur-[80px] opacity-70`} />
        </div>
    )
}
