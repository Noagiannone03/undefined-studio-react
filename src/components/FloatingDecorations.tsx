export default function FloatingDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Large Blob Background - Top Right */}
            <div
                className="blob w-[600px] h-[600px] bg-peach/30 -top-40 -right-40 animate-blob"
                style={{ animationDelay: '0s' }}
            />

            {/* Medium Blob - Bottom Left */}
            <div
                className="blob w-[400px] h-[400px] bg-lemon/20 -bottom-20 -left-20 animate-blob"
                style={{ animationDelay: '2s' }}
            />

            {/* Small Blob - Center */}
            <div
                className="blob w-[200px] h-[200px] bg-lilac/40 top-1/3 left-1/4 animate-blob"
                style={{ animationDelay: '4s' }}
            />

            {/* Decorative Stars */}
            <div className="star top-20 left-[10%] animate-spin-slow opacity-20" style={{ width: '60px', height: '60px' }} />
            <div className="star top-[60%] right-[15%] animate-spin-slow opacity-15" style={{ width: '40px', height: '40px', animationDirection: 'reverse' }} />
            <div className="star bottom-[30%] left-[5%] animate-spin-slow opacity-10" style={{ width: '80px', height: '80px' }} />

            {/* Squiggles */}
            <div className="squiggle top-[40%] right-[5%] animate-wiggle opacity-20" style={{ width: '150px' }} />
            <div className="squiggle bottom-[20%] left-[20%] animate-wiggle opacity-15" style={{ width: '120px', animationDelay: '1s' }} />
        </div>
    )
}
