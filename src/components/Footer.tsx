import GrainOverlay from './GrainOverlay'

export default function Footer() {
    return (
        <footer className="relative bg-black text-white pt-40 pb-20 overflow-hidden min-h-screen flex flex-col justify-between border-t-4 border-white">

            {/* INCREASED GRAIN OPACITY TO 0.4 */}
            <GrainOverlay opacity={0.4} />

            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start gap-20">

                <div className="flex flex-col gap-0 border-l-4 border-white pl-4 md:pl-10">
                    <h2 className="font-display text-[15vw] font-black uppercase leading-[0.75] hover:text-lemon transition-colors cursor-pointer select-none mix-blend-difference">
                        LET'S
                    </h2>
                    <h2 className="font-display text-[15vw] font-black uppercase leading-[0.75] ml-[5vw] hover:text-gray-400 transition-colors cursor-pointer select-none mix-blend-difference">
                        MAKE
                    </h2>
                    <h2 className="font-display text-[15vw] font-black uppercase leading-[0.75] hover:text-mint transition-colors cursor-pointer select-none mix-blend-difference">
                        NOISE
                    </h2>
                </div>

                <div className="flex flex-col gap-8 items-start md:items-end">
                    <div className="bg-white text-black px-4 py-2 rotate-6 border-2 border-black shadow-[4px_4px_0px_#FFF]">
                        <span className="font-mono font-bold uppercase">Ready to start?</span>
                    </div>
                    <a href="mailto:hello@undefined.studio" className="font-display text-4xl md:text-6xl font-bold underline decoration-4 underline-offset-8 decoration-lemon hover:bg-lemon hover:text-black hover:no-underline px-2 transition-all">
                        HELLO@UNDEFINED.FR
                    </a>
                    <div className="flex flex-col items-start md:items-end font-mono text-sm text-gray-400 mt-10">
                        <p>PARIS — TOULOUSE — INTERNET</p>
                        <p>© 2026 UNDEFINED STUDIO</p>
                    </div>
                </div>

            </div>

            {/* Giant Footer Text Scrolling */}
            <div className="w-full whitespace-nowrap overflow-hidden py-6 bg-lemon text-black border-y-4 border-black mt-20 rotate-1 scale-105">
                <div className="animate-marquee inline-block">
                    <span className="text-3xl font-black font-display mx-12">UNDEFINED STUDIO © 2026</span>
                    <span className="text-3xl font-black font-display mx-12">DESIGN REBELLE</span>
                    <span className="text-3xl font-black font-display mx-12">NO CORPORATE BS</span>
                    <span className="text-3xl font-black font-display mx-12">PURE IMPACT</span>
                    <span className="text-3xl font-black font-display mx-12">UNDEFINED STUDIO © 2026</span>
                    <span className="text-3xl font-black font-display mx-12">DESIGN REBELLE</span>
                    <span className="text-3xl font-black font-display mx-12">NO CORPORATE BS</span>
                    <span className="text-3xl font-black font-display mx-12">PURE IMPACT</span>
                </div>
            </div>

        </footer>
    )
}
