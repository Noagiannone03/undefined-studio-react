import { forwardRef } from 'react'

type Props = { className?: string; color?: string }

const Asterisk = forwardRef<SVGSVGElement, Props>(function Asterisk(
    { className = '', color = 'currentColor' },
    ref
) {
    return (
        <svg ref={ref} viewBox="0 0 100 100" className={className} aria-hidden>
            <g fill={color}>
                {[0, 45, 90, 135].map((deg) => (
                    <rect
                        key={deg}
                        x="46"
                        y="6"
                        width="8"
                        height="88"
                        rx="4"
                        transform={`rotate(${deg} 50 50)`}
                    />
                ))}
            </g>
        </svg>
    )
})

export default Asterisk
