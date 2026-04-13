import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Props = {
    n: string
    title: string
    sub?: string
    variant?: 'ink-to-paper' | 'paper-to-klein' | 'klein-to-terminal' | 'terminal-to-tomato' | 'paper-to-ink' | 'tomato-to-ink' | 'paper-to-paper'
    tag?: string
}

const VARIANT: Record<NonNullable<Props['variant']>, { from: string; to: string; bar: string; text: string }> = {
    'ink-to-paper': { from: 'bg-ink', to: 'bg-paper', bar: 'bg-tomato', text: 'text-paper' },
    'paper-to-klein': { from: 'bg-paper', to: 'bg-klein', bar: 'bg-ink', text: 'text-ink' },
    'klein-to-terminal': { from: 'bg-klein', to: 'bg-[#0A0C08]', bar: 'bg-tomato', text: 'text-paper' },
    'terminal-to-tomato': { from: 'bg-[#0A0C08]', to: 'bg-tomato', bar: 'bg-[#7CFF8E]', text: 'text-[#7CFF8E]' },
    'paper-to-ink': { from: 'bg-paper', to: 'bg-ink', bar: 'bg-tomato', text: 'text-ink' },
    'tomato-to-ink': { from: 'bg-tomato', to: 'bg-ink', bar: 'bg-paper', text: 'text-paper' },
    'paper-to-paper': { from: 'bg-paper', to: 'bg-paper', bar: 'bg-ink', text: 'text-ink' },
}

export default function SectionBreak({ n, title, sub, variant = 'ink-to-paper', tag }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const v = VARIANT[variant]

    useLayoutEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const bars = ref.current?.querySelectorAll('[data-bar]')
            if (bars) {
                gsap.fromTo(
                    bars,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 1.1,
                        ease: 'expo.out',
                        stagger: 0.07,
                        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
                    }
                )
            }
            const lbl = ref.current?.querySelector('[data-titlebreak]')
            if (lbl) {
                gsap.fromTo(
                    lbl,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start: 'top 80%' } }
                )
            }
        }, ref)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <div ref={ref} className={`relative ${v.from} ${v.text} overflow-hidden`}>
            <div className="container-x py-10 md:py-16 grid grid-cols-12 items-center gap-y-6">
                {/* left: bars */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <span
                            key={i}
                            data-bar
                            className={`block h-[3px] origin-left ${v.bar}`}
                            style={{ width: `${100 - i * 18}%` }}
                        />
                    ))}
                </div>

                {/* middle: chapter title */}
                <div className="col-span-12 md:col-span-7 text-center overflow-hidden">
                    <div className="flex items-baseline justify-center gap-5 md:gap-8">
                        <span className="label opacity-60">{tag ?? 'Chapter'}</span>
                        <span className="label opacity-80">—</span>
                        <span className="label opacity-60">{n}</span>
                    </div>
                    <div data-titlebreak className="mt-3 display text-[12vw] md:text-[5.2vw] leading-[0.9] tracking-[-0.04em]">
                        {title.split('').map((ch, i) =>
                            ch === ' ' ? (
                                <span key={i}>&nbsp;</span>
                            ) : (
                                <span key={i} className="inline-block">
                                    {ch}
                                </span>
                            )
                        )}
                    </div>
                    {sub && (
                        <p className="mt-3 serif-italic text-xl md:text-2xl opacity-70 normal-case">{sub}</p>
                    )}
                </div>

                {/* right: meta column */}
                <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-2">
                    <span className="label opacity-60">{n}/06</span>
                    <span className="label opacity-40">— turn page</span>
                </div>
            </div>

            {/* end-of-frame edge */}
            <div className={`h-3 md:h-4 ${v.to}`} />
        </div>
    )
}
