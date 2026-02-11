import GrainOverlay from './GrainOverlay'

const services = [
    {
        id: '01',
        title: "DÉVELOPPEMENT\nCRÉATIF",
        desc: "Nous ne codons pas.\nNous traduisons des rêves en pixel.",
        tools: ["WebGL", "Three.js", "GLSL", "React"],
        bg: "bg-lemon",
        textColor: "text-black",
        rotate: -2
    },
    {
        id: '02',
        title: "MOTION\nDESIGN",
        desc: "L'inertie est notre ennemie.\nTout doit bouger, tout doit vivre.",
        tools: ["After Effects", "Rive", "GSAP", "Lottie"],
        bg: "bg-black",
        textColor: "text-white",
        rotate: 1
    },
    {
        id: '03',
        title: "IDENTITÉ\nVISUELLE",
        desc: "Des marques qui claquent.\nDes logos qui racontent une histoire.",
        tools: ["Branding", "Typos", "Systèmes", "DA"],
        bg: "bg-mint",
        textColor: "text-black",
        rotate: -1
    },
    {
        id: '04',
        title: "AUDACE\nNUMÉRIQUE",
        desc: "Stratégie de rupture.\nOn fait ce que les autres n'osent pas.",
        tools: ["Concept", "Copywriting", "Activation", "Buzz"],
        bg: "bg-peach",
        textColor: "text-black",
        rotate: 2
    },
]

export default function Services() {
    return (
        <section id="services" className="relative w-full bg-lilac py-20 pb-40 border-b-4 border-black overflow-hidden">

            {/* INCREASED GRAIN OPACITY TO 0.5 */}
            <GrainOverlay opacity={0.5} />

            {/* Giant Background Title */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5">
                <h2 className="font-display text-[25vw] font-black uppercase text-black leading-none whitespace-nowrap -translate-y-1/4">
                    SERVICES
                </h2>
            </div>

            <div className="container mx-auto px-6 mb-24 relative z-10 flex flex-col items-center">
                <div className="bg-black text-white px-6 py-2 -rotate-2 inline-block shadow-[6px_6px_0px_#B8F4D4] mb-8">
                    <span className="font-mono font-bold uppercase tracking-widest">Ce qu'on fait de mieux</span>
                </div>
                <h2 className="font-display text-[12vw] font-black uppercase text-black leading-none text-center drop-shadow-[6px_6px_0px_white]">
                    NOS ARMES
                </h2>
            </div>

            <div className="flex flex-col items-center gap-0 w-full px-4 md:px-0 relative z-10">
                {services.map((s, i) => (
                    <div
                        key={i}
                        className={`sticky top-32 w-full max-w-6xl ${s.bg} border-4 border-black p-8 md:p-12 rounded-none md:rounded-3xl shadow-[8px_8px_0px_black] mb-24 transform transition-transform hover:scale-[1.02] hover:-rotate-1 relative overflow-hidden`}
                        style={{ transform: `rotate(${s.rotate}deg)` }}
                    >
                        <GrainOverlay opacity={0.15} />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className={`font-display text-4xl font-black ${s.textColor} opacity-30`}>#{s.id}</span>
                                    <div className={`h-1 flex-1 ${s.textColor === 'text-white' ? 'bg-white' : 'bg-black'} opacity-30`}></div>
                                </div>

                                <h3 className={`font-display text-5xl md:text-7xl font-black uppercase whitespace-pre-line leading-[0.85] tracking-tighter ${s.textColor} drop-shadow-sm`}>
                                    {s.title}
                                </h3>
                            </div>

                            <div className="max-w-md flex-1">
                                <p className={`font-body text-xl md:text-2xl font-bold mb-8 leading-tight whitespace-pre-line ${s.textColor}`}>
                                    {s.desc}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {s.tools.map(t => (
                                        <span key={t} className={`text-sm font-mono font-bold border-2 border-current px-3 py-1 uppercase ${s.textColor} hover:bg-current hover:text-${s.bg.replace('bg-', '')} transition-colors cursor-default`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Corner Decoration */}
                        <div className="absolute top-4 right-4 w-4 h-4 border-2 border-current rounded-full" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-2 border-current rounded-full" />
                    </div>
                ))}
            </div>

        </section>
    )
}
