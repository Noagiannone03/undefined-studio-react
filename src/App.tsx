import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Showcase from './components/Showcase'
import Footer from './components/Footer'
import FloatingDecorations from './components/FloatingDecorations'

function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
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
  }, [])

  return (
    <div className="w-full min-h-screen bg-mint font-body overflow-hidden relative">
      {/* Floating Decorative Elements */}
      <FloatingDecorations />

      <Menu />

      <main className="w-full relative z-10">
        <Hero />
        <Showcase />
      </main>

      <Footer />
    </div>
  )
}

export default App
