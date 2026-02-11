import GrainOverlay from './GrainOverlay'

const FooterLink = ({ href, label }: { href: string, label: string }) => (
    <a href={href} className="block font-display text-2xl uppercase hover:text-lemon transition-colors">
        {label}
    </a>
)

const SocialLink = ({ href, label }: { href: string, label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block font-mono text-sm uppercase opacity-70 hover:opacity-100 hover:text-lemon transition-colors underline decoration-1 underline-offset-4">
        {label}
    </a>
)

export default function Footer() {
    return (
        <footer className="relative bg-black text-white overflow-hidden border-t-4 border-white">
            <GrainOverlay opacity={0.4} />

            <div className="relative z-10 flex flex-col md:flex-row min-h-screen">

                {/* --- LEFT: MASSIVE TEXT (The Vibe) --- */}
                <div className="w-full md:w-2/3 p-6 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10 mix-blend-difference">
                        <h2 className="font-display text-[18vw] md:text-[14vw] font-black uppercase leading-[0.8] tracking-tighter hover:text-outline-white transition-all duration-300 cursor-default select-none">
                            LET'S
                        </h2>
                        <h2 className="font-display text-[18vw] md:text-[14vw] font-black uppercase leading-[0.8] tracking-tighter ml-[10vw] md:ml-[5vw] text-stroke-white text-transparent hover:text-white hover:text-stroke-0 transition-all duration-300 cursor-default select-none">
                            MAKE
                        </h2>
                        <h2 className="font-display text-[18vw] md:text-[14vw] font-black uppercase leading-[0.8] tracking-tighter hover:text-lemon transition-colors duration-300 cursor-default select-none">
                            NOISE.
                        </h2>
                    </div>
                </div>

                {/* --- RIGHT: ORGANIZED CONTENT (The Structure) --- */}
                <div className="w-full md:w-1/3 flex flex-col">

                    {/* 1. CTA Block */}
                    <div className="p-8 md:p-12 border-b-4 border-white bg-white text-black flex-1 flex flex-col justify-center items-start">
                        <div className="bg-black text-white px-4 py-1 mb-6 -rotate-2 inline-block shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                            <span className="font-mono font-bold uppercase tracking-widest text-xs">Open for business</span>
                        </div>
                        <a href="mailto:hello@undefined.studio" className="font-display text-4xl md:text-5xl font-black underline decoration-4 underline-offset-4 decoration-black hover:decoration-lemon hover:bg-black hover:text-white hover:px-2 transition-all duration-300 break-all leading-tight">
                            HELLO@<br />UNDEFINED.FR
                        </a>
                    </div>

                    {/* 2. Navigation & Socials */}
                    <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-2 h-full">
                            {/* Sitemap */}
                            <div className="p-8 border-r-4 border-white flex flex-col gap-4 justify-center">
                                <span className="font-mono text-xs uppercase opacity-50 mb-2">Explore</span>
                                <FooterLink href="#" label="Work" />
                                <FooterLink href="#" label="Services" />
                                <FooterLink href="#" label="About" />
                                <FooterLink href="#" label="Contact" />
                            </div>
                            {/* Socials */}
                            <div className="p-8 flex flex-col gap-4 justify-center">
                                <span className="font-mono text-xs uppercase opacity-50 mb-2">Connect</span>
                                <SocialLink href="#" label="Instagram" />
                                <SocialLink href="#" label="Twitter" />
                                <SocialLink href="#" label="LinkedIn" />
                                <SocialLink href="#" label="GitHub" />
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="p-8 border-t-4 border-white bg-lemon text-black">
                            <p className="font-mono text-xs font-bold uppercase tracking-widest">
                                PARIS — TOULOUSE — WORLDWIDE<br />
                                © 2026 UNDEFINED STUDIO.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- BOTTOM MARQUEE --- */}
            <div className="border-t-4 border-white bg-black text-white overflow-hidden py-3">
                <div className="animate-marquee whitespace-nowrap">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="font-display font-black text-xl md:text-3xl mx-6 uppercase text-stroke-white text-transparent">
                            UNDEFINED STUDIO — NO CORPORATE BS — PURE IMPACT —
                        </span>
                    ))}
                </div>
            </div>

        </footer>
    )
}
