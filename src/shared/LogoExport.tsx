
export default function LogoExport() {
    return (
        <div className="w-full h-screen bg-white flex items-center justify-center overflow-hidden font-display">
            <div className="relative text-center select-none">
                <h1 className="text-[20vw] font-black text-black leading-[0.8] tracking-tighter drop-shadow-[15px_15px_0px_white]">
                    UNDE<br />FINED
                </h1>
                {/* STUDIO LABEL */}
                <div className="absolute -bottom-4 right-0 md:-right-12 transform rotate-[-5deg]">
                    <div className="bg-black text-white px-6 py-2 border-4 border-mint shadow-hard">
                        <span className="text-4xl md:text-6xl font-black italic tracking-widest">STUDIO</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
