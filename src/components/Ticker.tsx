import Asterisk from './Asterisk'

const ITEMS = [
    'Product', 'Mobile', 'Motion', 'Brand', 'Code', 'Strategy', 'iOS', 'Android', 'Prototype',
]

export default function Ticker() {
    return (
        <section aria-hidden className="relative frame-ink overflow-hidden hair-t hair-b border-paper/20">
            {/* top row — serif italic, slow, pale */}
            <div className="relative border-b border-paper/10">
                <div className="inline-flex whitespace-nowrap marq py-6 md:py-7">
                    {[0, 1].map(k => (
                        <div key={k} className="inline-flex items-center">
                            {ITEMS.map((t, i) => (
                                <span key={i} className="inline-flex items-center">
                                    <span className="serif-italic text-[9vw] md:text-[5vw] leading-none px-8 text-paper/75">{t}</span>
                                    <span className="text-tomato serif-italic text-[9vw] md:text-[5vw] leading-none">·</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* bottom row — display, fast, reverse */}
            <div className="relative">
                <div className="inline-flex whitespace-nowrap marq-rev py-5">
                    {[0, 1].map(k => (
                        <div key={k} className="inline-flex items-center">
                            {ITEMS.map((t, i) => (
                                <span key={i} className="inline-flex items-center">
                                    <span className="display text-[6vw] md:text-[3.2vw] leading-none px-6 text-paper">{t}</span>
                                    <Asterisk className="w-6 h-6 md:w-7 md:h-7 text-tomato shrink-0 spin-fast" color="currentColor" />
                                    <span className="px-2" />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
