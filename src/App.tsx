import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Work from './components/Work'
import About from './components/About'
import Capabilities from './components/Capabilities'
import Footer from './components/Footer'
import LogoExport from './components/LogoExport'
import Cursor from './components/Cursor'

gsap.registerPlugin(ScrollTrigger)

function App() {
    const lenisRef = useRef<Lenis | null>(null)
    const isLogoPage = typeof window !== 'undefined' && window.location.pathname === '/logo'

    useEffect(() => {
        if (isLogoPage) return
        const lenis = new Lenis({
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        })
        lenisRef.current = lenis
        const onLenisTick = (time: number) => lenis.raf(time * 1000)
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add(onLenisTick)
        gsap.ticker.lagSmoothing(0)
        ScrollTrigger.refresh()
        return () => {
            lenis.off('scroll', ScrollTrigger.update)
            gsap.ticker.remove(onLenisTick)
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
                <Work />
                <Capabilities />
                <Footer />
            </main>
        </div>
    )
}

export default App
