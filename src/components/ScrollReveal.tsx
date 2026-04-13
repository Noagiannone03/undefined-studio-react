import { useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Props = {
    children: ReactNode
    className?: string
}

export default function ScrollReveal({ children, className = '' }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const el = ref.current

        // Split text nodes into word spans, preserve existing element wrappers
        const walkAndSplit = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? ''
                if (!text.trim()) return
                const frag = document.createDocumentFragment()
                const parts = text.split(/(\s+)/)
                parts.forEach(p => {
                    if (!p) return
                    if (/^\s+$/.test(p)) {
                        frag.appendChild(document.createTextNode(p))
                    } else {
                        const span = document.createElement('span')
                        span.textContent = p
                        span.setAttribute('data-reveal', '1')
                        span.style.display = 'inline-block'
                        span.style.willChange = 'opacity, transform'
                        frag.appendChild(span)
                    }
                })
                node.parentNode?.replaceChild(frag, node)
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const children = Array.from(node.childNodes)
                children.forEach(walkAndSplit)
            }
        }

        walkAndSplit(el)

        const words = el.querySelectorAll<HTMLSpanElement>('[data-reveal="1"]')
        if (!words.length) return

        const ctx = gsap.context(() => {
            gsap.fromTo(
                words,
                { opacity: 0.14, y: '0.2em' },
                {
                    opacity: 1,
                    y: 0,
                    ease: 'none',
                    stagger: { each: 0.04 },
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        end: 'bottom 55%',
                        scrub: 0.8,
                    },
                }
            )
        }, el)

        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [])

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    )
}
