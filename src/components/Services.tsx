import { useRef } from 'react'

const services = [
    {
        id: '01',
        title: "DÉVELOPPEMENT\nCRÉATIF",
        desc: "Nous ne codons pas. Nous traduisons des rêves en pixel.",
        tools: ["WebGL", "Three.js", "GLSL", "React"],
        bg: "bg-mint",
        textColor: "text-black"
    },
    {
        id: '02',
        title: "MOTION\nDESIGN",
        desc: "L'inertie est notre ennemie. Tout doit bouger, tout doit vivre.",
        tools: ["After Effects", "Rive", "GSAP", "Lottie"],
        bg: "bg-peach",
        textColor: "text-black"
    },
    {
        id: '03',
        title: "IDENTITÉ\nVISUELLE",
        desc: "Des marques qui claquent. Des logos qui racontent une histoire.",
        tools: ["Branding", "Typos", "Systèmes", "DA"],
        bg: "bg-black",
        textColor: "text-white"
    },
    {
        id: '04',
        title: "AUDACE\nNUMÉRIQUE",
        desc: "Stratégie de rupture. On fait ce que les autres n'osent pas.",
        tools: ["Concept", "Copywriting", "Activation", "Buzz"],
        bg: "bg-lemon",
        textColor: "text-black"
    },
]

export default function Services() {
    return (
        <section className="relative w-full bg-cream py-20 pb-40">
            <div className="container mx-auto px-6 mb-20">
                <h2 className="font-display text-[10vw] font-black uppercase text-black leading-none text-center">
                    NOS ARMES
                </h2>
            </div>

            <div className="flex flex-col items-center gap-0 w-full px-4 md:px-0">
                {services.map((s, i) => (
                    <div
                        key={i}
                        className={`sticky top-24 w-full max-w-5xl ${s.bg} border-4 border-black p-10 md:p-20 rounded-3xl shadow-[0px_-10px_40px_rgba(0,0,0,0.1)] mb-20 transform transition-transform hover:scale-[1.02]`}
                        style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                            <div>
                                <span className={`font-mono text-xl font-bold border-2 border-current px-3 py-1 rounded-full mb-6 inline-block ${s.textColor}`}>
                                    SERVICE #{s.id}
                                </span>
                                <h3 className={`font-display text-5xl md:text-8xl font-black uppercase whitespace-pre-line leading-[0.9] ${s.textColor}`}>
                                    {s.title}
                                </h3>
                            </div>

                            <div className="max-w-xs">
                                <p className={`font-body text-xl font-bold mb-8 ${s.textColor}`}>
                                    {s.desc}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {s.tools.map(t => (
                                        <span key={t} className={`text-xs font-mono border border-current px-2 py-1 ${s.textColor}`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Giant Number Background */}
                        <div className={`absolute -bottom-10 -right-10 font-display text-[20rem] font-black opacity-10 pointer-events-none select-none ${s.textColor}`}>
                            {s.id}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
