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
import LogoExport from './components/LogoExport'
import Cursor from './components/Cursor'

gsap.registerPlugin(ScrollTrigger)

// Mobile URL bar show/hide resizes the viewport; ignoring it prevents pin jumps.
// Safe because layout uses svh/dvh, not vh.
ScrollTrigger.config({ ignoreMobileResize: true })

function App() {
    const isLogoPage = typeof window !== 'undefined' && window.location.pathname === '/logo'

    useEffect(() => {
        if (isLogoPage) return

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches

        // Touch devices get native scroll — Lenis on mobile often fights with
        // the URL bar and momentum, adding lag rather than removing it.
        if (prefersReduced || isTouch) {
            ScrollTrigger.refresh()
            return
        }

        const lenis = new Lenis({
            duration: 1.1,
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
    }, [isLogoPage])

    if (isLogoPage) return <LogoExport />

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

export default App
