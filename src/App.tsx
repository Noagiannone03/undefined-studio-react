import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Services from './components/Services'
import Showcase from './components/Showcase'
import Footer from './components/Footer'
import EasterEggs from './components/EasterEggs'
import LogoExport from './components/LogoExport'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const isLogoPage = typeof window !== 'undefined' && window.location.pathname === '/logo'

  useEffect(() => {
    if (isLogoPage) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })
    lenisRef.current = lenis

    const onLenisTick = (time: number) => {
      lenis.raf(time * 1000)
    }

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

  if (isLogoPage) {
    return <LogoExport />
  }

  return (
    <div className="w-full min-h-screen bg-mint font-body relative">
      <Menu />

      <main className="w-full relative z-10 flex flex-col">
        <Hero />
        <Services />
        <Showcase />
        <Footer />
      </main>

      <EasterEggs />
    </div>
  )
}

export default App
