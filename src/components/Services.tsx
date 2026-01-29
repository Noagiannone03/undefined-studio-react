import { useRef } from 'react'

const services = [
    {
        id: '01',
        title: "DÉVELOPPEMENT\nCRÉATIF",
        desc: "Nous ne codons pas.\nNous traduisons des rêves en pixel.",
        tools: ["WebGL", "Three.js", "GLSL", "React"],
        bg: "bg-lemon",
        textColor: "text-black"
    },
    {
        id: '02',
        title: "MOTION\nDESIGN",
        desc: "L'inertie est notre ennemie.\nTout doit bouger, tout doit vivre.",
        tools: ["After Effects", "Rive", "GSAP", "Lottie"],
        bg: "bg-black",
        textColor: "text-white"
    },
    {
        id: '03',
        title: "IDENTITÉ\nVISUELLE",
        desc: "Des marques qui claquent.\nDes logos qui racontent une histoire.",
        tools: ["Branding", "Typos", "Systèmes", "DA"],
        bg: "bg-mint",
        textColor: "text-black"
    },
    {
        id: '04',
        title: "AUDACE\nNUMÉRIQUE",
        desc: "Stratégie de rupture.\nOn fait ce que les autres n'osent pas.",
        tools: ["Concept", "Copywriting", "Activation", "Buzz"],
        bg: "bg-lemon",
        textColor: "text-black"
    },
]

export default function Services() {
    return (
        <section id="services" className="relative w-full bg-[#FFF8E7] py-20 pb-40">
            {/* Background Noise Texture */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat pointer-events-none" />

            <div className="container mx-auto px-6 mb-20 relative z-10">
                <h2 className="font-display text-[12vw] font-black uppercase text-black leading-none text-center drop-shadow-[6px_6px_0px_#E6E6FA]">
                    NOS ARMES
                </h2>
            </div>

            <div className="flex flex-col items-center gap-0 w-full px-4 md:px-0 relative z-10">
                {services.map((s, i) => (
                    <div
                        key={i}
                        className={`sticky top-24 w-full max-w-5xl ${s.bg} border-4 border-black p-8 md:p-16 rounded-3xl shadow-[0px_-10px_40px_rgba(0,0,0,0.1)] mb-20 transform transition-transform hover:scale-[1.02] overflow-hidden`}
                        style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                            <div className="flex-1">
                                <span className={`font-mono text-lg font-bold border-2 border-current px-3 py-1 rounded-full mb-6 inline-block ${s.textColor}`}>
                                    SERVICE #{s.id}
                                </span>
                                <h3 className={`font-display text-5xl md:text-8xl font-black uppercase whitespace-pre-line leading-[0.85] tracking-tighter ${s.textColor}`}>
                                    {s.title}
                                </h3>
                            </div>

                            <div className="max-w-sm flex-1">
                                <p className={`font-body text-xl font-bold mb-6 leading-tight whitespace-pre-line ${s.textColor}`}>
                                    {s.desc}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {s.tools.map(t => (
                                        <span key={t} className={`text-xs font-mono border border-current px-2 py-1 uppercase ${s.textColor}`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Giant Number Background */}
                        <div className={`absolute -bottom-20 -right-10 font-display text-[30vh] font-black opacity-10 pointer-events-none select-none z-0 ${s.textColor} leading-none`}>
                            {s.id}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
