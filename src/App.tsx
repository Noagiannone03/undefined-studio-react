import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Services from './components/Services'
import Showcase from './components/Showcase'
import Footer from './components/Footer'
import EasterEggs from './components/EasterEggs'
import LogoExport from './components/LogoExport'

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

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
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
