import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Work from './components/Work'
import About from './components/About'
import BrandMark from './components/BrandMark'
import Capabilities from './components/Capabilities'
import Manifesto from './components/Manifesto'
import Footer from './components/Footer'
import Cursor from './components/Cursor'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * Site — the marketing vitrine.
 * Single long-scroll experience. Lenis + ScrollTrigger, desktop only.
 */
export default function Site() {
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches

        if (prefersReduced || isTouch) {
            ScrollTrigger.refresh()
            return
        }

        const lenis = new Lenis({
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        })

        const raf = (time: number) => lenis.raf(time * 1000)
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add(raf)
        gsap.ticker.lagSmoothing(0)
        ScrollTrigger.refresh()

        return () => {
            lenis.off('scroll', ScrollTrigger.update)
            gsap.ticker.remove(raf)
            lenis.destroy()
        }
    }, [])

    return (
        <div className="w-full min-h-screen bg-paper text-ink font-body relative">
            <Cursor />
            <main className="w-full relative z-10 flex flex-col">
                <Hero />
                <Marquee />
                <About />
                <Manifesto />
                <BrandMark />
                <Work />
                <Capabilities />
                <Footer />
            </main>
        </div>
    )
}
