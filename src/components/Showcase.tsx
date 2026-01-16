import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex Shader with more "Liquid" feeling
const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uHover;

void main() {
  vUv = uv;
  vec3 pos = position;
  float noise = sin(uv.y * 5.0 + uTime * 2.0) * cos(uv.x * 5.0 + uTime * 0.5);
  pos.z += noise * 0.5 * uHover;
  pos.x += noise * 0.2 * uHover;
  pos.y += noise * 0.2 * uHover;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uHover;
uniform float uTime;
void main() {
  vec2 uv = vUv;
  uv.x += sin(uv.y * 10.0 + uTime) * 0.05 * uHover;
  uv.y += cos(uv.x * 10.0 + uTime) * 0.05 * uHover;
  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = vec4(color.rgb, color.a * uHover);
}
`

function createPlayfulTexture(color1: string, color2: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, 512, 512)
        ctx.fillStyle = color2
        for (let i = 0; i < 8; i++) {
            ctx.beginPath()
            ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 200, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 2
        for (let i = 0; i < 512; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
        }
    }
    return new THREE.CanvasTexture(canvas)
}

function ImagePlane({ hovered, index }: { hovered: boolean, index: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const colors = [['#FFD1DC', '#E6E6FA'], ['#B8F4D4', '#FFF44F'], ['#FFF8E7', '#B8F4D4'], ['#DCD0FF', '#FFD1DC']]
    const palette = colors[index % colors.length]
    const texture = useMemo(() => createPlayfulTexture(palette[0], palette[1]), [index])

    const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 }, uTexture: { value: texture } }), [texture])

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial
            material.uniforms.uTime.value = state.clock.elapsedTime
            material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, hovered ? 1 : 0, 0.1)
        }
    })
    return (
        <mesh ref={meshRef} scale={[8, 5, 1]} rotation={[0, 0, (index % 2 === 0 ? 0.05 : -0.05)]}>
            <planeGeometry args={[1, 1, 64, 64]} />
            <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent={true} />
        </mesh>
    )
}

export default function Showcase() {
    const [hoveredProject, setHoveredProject] = useState<number | null>(null)
    const projects = [
        { title: 'ALPHA MOBILE', category: 'Produit / iOS', color: 'bg-peach' },
        { title: 'NEON LAB', category: 'Creative WebGL', color: 'bg-lavender' },
        { title: 'RETRO FLOW', category: 'Branding / UI', color: 'bg-lemon' },
        { title: 'PEAK APP', category: 'Fintech / Dash', color: 'bg-mint' },
    ]

    return (
        <section id="works" className="relative min-h-screen w-full bg-cream border-y-4 border-black py-32 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500" style={{ opacity: hoveredProject !== null ? 0.8 : 0 }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    {hoveredProject !== null && <ImagePlane hovered={true} index={hoveredProject} />}
                </Canvas>
            </div>

            <div className="relative z-10 container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-20">
                    <h2 className="font-display text-7xl font-black uppercase tracking-tighter">
                        Derniers<br /><span className="text-white drop-shadow-[4px_4px_0px_#000]">Impacts</span>
                    </h2>
                    <div className="sticker bg-white transform rotate-3 mt-8 md:mt-0 max-w-xs">
                        <p className="text-sm font-bold">Refuser le standard. Créer des émotions. Un pixel à la fois.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {projects.map((project, index) => (
                        <div key={index}
                            className="relative p-8 border-4 border-black bg-white shadow-hard hover:shadow-hard-lg hover:-translate-y-2 hover:-translate-x-2 transition-all duration-300 group cursor-pointer"
                            onMouseEnter={() => setHoveredProject(index)}
                            onMouseLeave={() => setHoveredProject(null)}
                            style={{ transform: `rotate(${(index % 2 === 0 ? 0.5 : -1)}deg) skewX(${(index % 2 === 0 ? -1 : 1)}deg)` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <span className={`inline-block px-3 py-1 border-2 border-black rounded-full text-xs font-black uppercase mb-3 ${project.color}`}>
                                        {project.category}
                                    </span>
                                    <h3 className="font-display text-4xl md:text-6xl font-black uppercase">{project.title}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6 rotate-[-45deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            <div className="squiggle bottom-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
