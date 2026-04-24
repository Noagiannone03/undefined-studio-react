import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Walks every descendant of `[data-split]` and wraps each character of each text
 * node into  <span class="c-line"><span class="c">x</span></span>.
 * Recursive so it preserves nested styled elements (italics, spans with colors).
 */
export function useSplitChars(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
    useLayoutEffect(() => {
        const root = ref.current
        if (!root) return
        const targets = root.querySelectorAll<HTMLElement>('[data-split]')
        const snapshots: { el: HTMLElement; html: string }[] = []

        const splitTextNodes = (node: Node) => {
            const textNodes: Text[] = []
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
            let n: Node | null
            while ((n = walker.nextNode())) textNodes.push(n as Text)

            textNodes.forEach(t => {
                const text = t.textContent ?? ''
                if (!text) return
                const frag = document.createDocumentFragment()
                const parts = text.split(/(\s+)/)
                parts.forEach(part => {
                    if (part === '') return
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode('\u00A0'))
                        return
                    }
                    const wrap = document.createElement('span')
                    wrap.className = 'inline-block whitespace-nowrap'
                    for (const ch of part) {
                        const line = document.createElement('span')
                        line.className = 'c-line'
                        const inner = document.createElement('span')
                        inner.className = 'c'
                        inner.textContent = ch
                        line.appendChild(inner)
                        wrap.appendChild(line)
                    }
                    frag.appendChild(wrap)
                })
                t.parentNode?.replaceChild(frag, t)
            })
        }

        targets.forEach(el => {
            if (el.dataset.splitDone === '1') return
            snapshots.push({ el, html: el.innerHTML })
            splitTextNodes(el)
            el.dataset.splitDone = '1'
        })

        return () => {
            snapshots.forEach(({ el, html }) => {
                el.innerHTML = html
                delete el.dataset.splitDone
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
