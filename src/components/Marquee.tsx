import type { ReactNode } from 'react'

type Props = {
    items: string[]
    accent?: boolean
    speed?: 'slow' | 'normal'
    separator?: ReactNode
}

export default function Marquee({ items, accent = false, speed = 'normal', separator }: Props) {
    const dur = speed === 'slow' ? 110 : 70
    return (
        <div aria-hidden className="relative bg-paper text-ink overflow-hidden hair-t hair-b">
            <div
                className="inline-flex whitespace-nowrap py-5 md:py-6"
                style={{ animation: `marq ${dur}s linear infinite` }}
            >
                {[0, 1].map(k => (
                    <div key={k} className="inline-flex items-center shrink-0">
                        {items.map((t, i) => (
                            <span key={i} className="inline-flex items-center shrink-0">
                                <span className={`serif-italic text-[7vw] md:text-[4vw] leading-none px-6 md:px-10 ${
                                    accent && i % 3 === 1 ? 'text-tomato' : accent && i % 3 === 2 ? 'text-klein' : ''
                                }`}>
                                    {t}
                                </span>
                                <span className="text-ink-mute serif-italic text-[7vw] md:text-[4vw] leading-none shrink-0">
                                    {separator ?? '·'}
                                </span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
