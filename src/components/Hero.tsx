import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Center, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

// Custom "Fake" Physics Engine for stability and performance
// We simulate spheres bumping into each other and the mouse
const COUNT = 30
const WALL_SIZE = 8

function PhysicsSphere({ position, color, scale = 1, type = 'sphere', label = '' }: { position: THREE.Vector3, color: string, scale?: number, type?: 'sphere' | 'box', label?: string }) {
    const meshRef = useRef<THREE.Group>(null)

    // Physics state
    const velocity = useRef(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5))
    const pos = useRef(position.clone())

    useFrame((state) => {
        if (!meshRef.current) return

        // 1. Apply Velocity
        pos.current.add(velocity.current.clone().multiplyScalar(0.1))

        // 2. Mouse Repulsion
        const mousePos = new THREE.Vector3(state.mouse.x * WALL_SIZE, state.mouse.y * WALL_SIZE, 0)
        const distToMouse = pos.current.distanceTo(mousePos)
        if (distToMouse < 3) {
            const repulsion = pos.current.clone().sub(mousePos).normalize().multiplyScalar(0.2)
            velocity.current.add(repulsion)
        }

        // 3. Gravity / Center attraction (Keep them in the nice box)
        const distToCenter = pos.current.distanceTo(new THREE.Vector3(0, 0, 0))
        if (distToCenter > WALL_SIZE) {
            const attraction = new THREE.Vector3(0, 0, 0).sub(pos.current).normalize().multiplyScalar(0.05)
            velocity.current.add(attraction)
        }

        // 4. Dampening (Friction)
        velocity.current.multiplyScalar(0.98)

        // 5. Update Mesh
        meshRef.current.position.copy(pos.current)

        // Rotation based on velocity
        meshRef.current.rotation.x += velocity.current.y * 0.2
        meshRef.current.rotation.y += velocity.current.x * 0.2
    })

    return (
        <group ref={meshRef} scale={scale}>
            {type === 'sphere' ? (
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
                </mesh>
            ) : (
                <group>
                    <mesh>
                        <boxGeometry args={[1.5, 1.5, 1.5]} />
                        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
                    </mesh>
                    {label && (
                        <Text
                            position={[0, 0, 0.8]}
                            fontSize={0.8}
                            color="black"
                            font="https://fonts.gstatic.com/s/spacegrotesk/v13/V8mDoQDj3_WNi7bc8d_k4g.woff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {label}
                        </Text>
                    )}
                </group>
            )}
        </group>
    )
}

function Scene() {
    const letters = "UNDEFINED".split("")
    const colors = ['#B8F4D4', '#FFF44F', '#FFD1DC', '#E6E6FA', '#FFFFFF']

    const objects = useMemo(() => {
        const objs = []

        // Add Letter Boxes
        letters.forEach((letter, i) => {
            objs.push({
                pos: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2),
                color: '#FFFFFF',
                type: 'box',
                label: letter,
                scale: 1.2
            })
        })

        // Add Random Spheres (The "Balls")
        for (let i = 0; i < 20; i++) {
            objs.push({
                pos: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5),
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'sphere',
                label: '',
                scale: Math.random() * 0.8 + 0.5
            })
        }
        return objs
    }, [])

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#B8F4D4" />

            {objects.map((obj, i) => (
                <PhysicsSphere
                    key={i}
                    position={obj.pos}
                    color={obj.color}
                    type={obj.type as any}
                    label={obj.label}
                    scale={obj.scale}
                />
            ))}

            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2} far={10} color="black" />
            <Environment preset="studio" />
        </>
    )
}

export default function Hero() {
    return (
        <section className="h-screen w-full relative bg-mint overflow-hidden border-b-4 border-black">
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 2]}>
                    <Scene />
                </Canvas>
            </div>

            {/* Massive Overlay Text (Background) - "THE BRAND" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-10">
                <h1 className="font-display text-[25vw] font-black text-black leading-none text-center">
                    CHAOS<br />STUDIO
                </h1>
            </div>

            {/* Foreground UI */}
            <div className="absolute top-10 w-full flex justify-between px-10 pointer-events-none z-20">
                <div className="sticker bg-white rotate-[-3deg] animate-float">
                    <span className="font-bold">v3.0.PHYSICS</span>
                </div>
                <div className="sticker bg-black text-white rotate-[3deg] animate-wiggle">
                    <span className="font-bold">INTERACTIF</span>
                </div>
            </div>

            <div className="absolute bottom-12 left-12 z-20 pointer-events-none">
                <h2 className="font-display text-6xl md:text-8xl font-black text-black leading-none uppercase drop-shadow-[4px_4px_0px_#FFF]">
                    Undefined<br />Studio
                </h2>
                <div className="bg-black text-white inline-block px-4 py-2 mt-4 skew-x-[-10deg]">
                    <p className="font-mono text-sm uppercase skew-x-[10deg]">Le terrain de jeu numérique</p>
                </div>
            </div>

            <div className="absolute bottom-12 right-12 z-20 pointer-events-auto">
                <button className="w-20 h-20 bg-lemon rounded-full border-4 border-black flex items-center justify-center hover:scale-110 transition-transform shadow-hard animate-bounce-soft">
                    <span className="text-2xl">↓</span>
                </button>
            </div>
        </section>
    )
}
