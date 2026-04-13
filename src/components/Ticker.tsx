import Asterisk from './Asterisk'

const ITEMS = [
    'Product Design',
    'Mobile Apps',
    'Brand Systems',
    'Creative Code',
    'Motion',
    'Prototyping',
    'Strategy',
    'iOS · Android',
]

export default function Ticker() {
    return (
        <section aria-hidden className="relative bg-ink text-paper overflow-hidden border-y border-ink">
            <div className="inline-flex whitespace-nowrap marq py-5 md:py-6">
                {[0, 1].map(k => (
                    <div key={k} className="inline-flex items-center">
                        {ITEMS.map((t, i) => (
                            <span key={i} className="inline-flex items-center">
                                <span className="display text-[7vw] md:text-[4vw] leading-none px-8">{t}</span>
                                <Asterisk className="w-8 h-8 md:w-10 md:h-10 text-tomato shrink-0 spin-fast" color="currentColor" />
                                <span className="px-4" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}
