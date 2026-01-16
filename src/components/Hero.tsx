import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Environment, ContactShadows, Outlines, Float } from '@react-three/drei'
import * as THREE from 'three'

// Custom "Fake" Physics Engine (Optimized)
const WALL_SIZE = 9

function ToonShape({ position, color, type, scale = 1, rotationSpeed = 1 }: any) {
    const meshRef = useRef<THREE.Group>(null)

    // Physics state
    const velocity = useRef(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5))
    const pos = useRef(position.clone())
    const rot = useRef(new THREE.Vector3(Math.random(), Math.random(), Math.random()))

    useFrame((state) => {
        if (!meshRef.current) return

        // Physics
        pos.current.add(velocity.current.clone().multiplyScalar(0.1))

        // Mouse Repulsion
        const mousePos = new THREE.Vector3(state.mouse.x * WALL_SIZE, state.mouse.y * WALL_SIZE, 0)
        const distToMouse = pos.current.distanceTo(mousePos)
        if (distToMouse < 4) {
            const repulsion = pos.current.clone().sub(mousePos).normalize().multiplyScalar(0.4)
            velocity.current.add(repulsion)
        }

        // Gravity / Center
        const distToCenter = pos.current.distanceTo(new THREE.Vector3(0, 0, 0))
        if (distToCenter > WALL_SIZE) {
            const attraction = new THREE.Vector3(0, 0, 0).sub(pos.current).normalize().multiplyScalar(0.08)
            velocity.current.add(attraction)
        }

        // Friction
        velocity.current.multiplyScalar(0.97)

        // Update
        meshRef.current.position.copy(pos.current)
        meshRef.current.rotation.x += velocity.current.y * 0.1
        meshRef.current.rotation.y += velocity.current.x * 0.1

        // Constant idle rotation
        // meshRef.current.rotation.z += 0.01 * rotationSpeed
    })

    const Geometry = useMemo(() => {
        switch (type) {
            case 'box': return <boxGeometry args={[1.5, 1.5, 1.5]} />
            case 'torus': return <torusGeometry args={[0.8, 0.3, 16, 32]} />
            case 'cone': return <coneGeometry args={[0.8, 1.5, 32]} />
            case 'icosa': return <icosahedronGeometry args={[1, 0]} />
            case 'octa': return <octahedronGeometry args={[1, 0]} />
            default: return <sphereGeometry args={[1, 32, 32]} />
        }
    }, [type])

    return (
        <group ref={meshRef} scale={scale}>
            <mesh castShadow receiveShadow>
                {Geometry}
                {/* CEL SHADING MATERIAL */}
                <meshToonMaterial color={color} gradientMap={null} />
                {/* THICK OUTLINES */}
                <Outlines thickness={0.05} color="black" />
            </mesh>
        </group>
    )
}

function Scene() {
    const objects = useMemo(() => {
        const objs = []
        const colors = ['#FFF44F', '#FFD1DC', '#E6E6FA', '#B8F4D4', '#FFFFFF']
        const shapes = ['box', 'torus', 'cone', 'icosa', 'octa']

        for (let i = 0; i < 20; i++) {
            objs.push({
                pos: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 5),
                color: colors[Math.floor(Math.random() * colors.length)],
                type: shapes[Math.floor(Math.random() * shapes.length)],
                scale: Math.random() * 0.5 + 0.8,
                rotationSpeed: Math.random() + 0.5
            })
        }
        return objs
    }, [])

    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 7]} intensity={1.5} castShadow />

            {objects.map((obj, i) => (
                <ToonShape
                    key={i}
                    position={obj.pos}
                    color={obj.color}
                    type={obj.type}
                    scale={obj.scale}
                    rotationSpeed={obj.rotationSpeed}
                />
            ))}

            <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2.5} far={10} color="black" />
            <Environment preset="studio" />
        </>
    )
}

export default function Hero() {
    return (
        <section className="h-screen w-full relative bg-mint overflow-hidden border-b-4 border-black">

            {/* Noise Texture */}
            <div className="absolute inset-0 z-[1] opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat pointer-events-none mix-blend-overlay" />

            {/* Marquee Header */}
            <div className="absolute top-0 left-0 w-full z-[2] bg-black text-white py-2 overflow-hidden pointer-events-none">
                <div className="animate-marquee inline-block whitespace-nowrap">
                    <span className="font-mono text-sm uppercase font-bold mx-4">★ UNDEFINED STUDIO</span>
                    <span className="font-mono text-sm uppercase font-bold mx-4">PURE CHAOS</span>
                    <span className="font-mono text-sm uppercase font-bold mx-4">DESIGN REBELLE</span>
                    <span className="font-mono text-sm uppercase font-bold mx-4">★ UNDEFINED STUDIO</span>
                    <span className="font-mono text-sm uppercase font-bold mx-4">PURE CHAOS</span>
                    <span className="font-mono text-sm uppercase font-bold mx-4">DESIGN REBELLE</span>
                </div>
            </div>

            {/* RESTORED GIANT BACKGROUND TEXT - "PURE CHAOS" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 w-full text-center">
                <h1 className="font-display text-[22vw] font-black text-black leading-none opacity-10">
                    PURE<br />CHAOS
                </h1>
            </div>

            <div className="absolute inset-0 z-[0] cursor-none">
                <Canvas camera={{ position: [0, 0, 14], fov: 40 }} dpr={[1, 2]} shadows>
                    <Scene />
                </Canvas>
            </div>

            <div className="absolute bottom-12 left-12 z-20 pointer-events-none max-w-2xl">
                <div className="flex gap-4 mb-2">
                    <div className="bg-lemon text-black px-3 py-1 border-2 border-black rotate-[-2deg] shadow-hard-sm animate-wiggle">
                        <span className="font-mono text-xs font-bold uppercase">NOUVELLE VAGUE</span>
                    </div>
                </div>
                <h2 className="font-display text-7xl md:text-9xl font-black text-black leading-[0.85] uppercase drop-shadow-[4px_4px_0px_#FFF]">
                    L'Anomalie<br />Créative.
                </h2>
                <div className="bg-black text-white inline-block px-6 py-3 mt-6 skew-x-[-10deg] shadow-hard">
                    <p className="font-display text-xl font-bold uppercase skew-x-[10deg] tracking-wider">
                        Le studio qui dérange.
                    </p>
                </div>
            </div>

            <div className="absolute bottom-12 right-12 z-20 pointer-events-auto">
                <a href="#services" className="w-24 h-24 bg-peach rounded-full border-4 border-black flex items-center justify-center hover:scale-110 transition-transform shadow-hard animate-bounce-soft group">
                    <span className="text-3xl font-black group-hover:rotate-180 transition-transform duration-500">↓</span>
                </a>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}} />
        </section>
    )
}
