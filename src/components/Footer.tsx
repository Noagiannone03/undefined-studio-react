import { useRef } from 'react'

export default function Footer() {
    return (
        <footer className="relative bg-black text-white py-40 overflow-hidden min-h-screen flex flex-col justify-between">

            {/* Background Noise Video/Texture would go here */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-20" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col gap-0 border-l-4 border-white pl-10">
                    <h2 className="font-display text-[12vw] font-black uppercase leading-[0.8] hover:text-lemon transition-colors cursor-pointer">
                        LET'S
                    </h2>
                    <h2 className="font-display text-[12vw] font-black uppercase leading-[0.8] ml-[10vw] hover:text-mint transition-colors cursor-pointer">
                        MAKE
                    </h2>
                    <h2 className="font-display text-[12vw] font-black uppercase leading-[0.8] hover:text-peach transition-colors cursor-pointer">
                        NOISE
                    </h2>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-6 mt-20 flex flex-col md:flex-row justify-between items-end">
                <div className="flex flex-col gap-4">
                    <a href="mailto:hello@undefined.studio" className="font-display text-4xl md:text-6xl font-bold underline decoration-4 underline-offset-8 decoration-lemon hover:text-lemon transition-colors">
                        HELLO@UNDEFINED.STUDIO
                    </a>
                    <p className="font-mono text-sm text-gray-400">
                        PARIS — TOULOUSE — INTERNET
                    </p>
                </div>

                <div className="mt-10 md:mt-0">
                    <button className="bg-white text-black font-display font-black text-2xl md:text-4xl px-12 py-6 border-4 border-transparent hover:border-white hover:bg-black hover:text-white transition-all transform hover:-translate-y-2 shadow-[8px_8px_0px_#333]">
                        DÉMARRER PROJET
                    </button>
                </div>
            </div>

            {/* Giant Footer Text Scrolling */}
            <div className="absolute bottom-0 left-0 w-full whitespace-nowrap overflow-hidden py-4 bg-lemon text-black">
                <div className="animate-marquee inline-block">
                    <span className="text-xl font-bold mx-8">UNDEFINED STUDIO © 2026</span>
                    <span className="text-xl font-bold mx-8">DESIGN REBELLE</span>
                    <span className="text-xl font-bold mx-8">NO CORPORATE BS</span>
                    <span className="text-xl font-bold mx-8">PURE IMPACT</span>
                    <span className="text-xl font-bold mx-8">UNDEFINED STUDIO © 2026</span>
                    <span className="text-xl font-bold mx-8">DESIGN REBELLE</span>
                    <span className="text-xl font-bold mx-8">NO CORPORATE BS</span>
                    <span className="text-xl font-bold mx-8">PURE IMPACT</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}} />
        </footer>
    )
}
