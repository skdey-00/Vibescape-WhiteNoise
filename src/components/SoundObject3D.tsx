import { useRef, useState } from "react"
import { useFrame, ThreeEvent } from "@react-three/fiber"
import { Text, Sphere } from "@react-three/drei"
import { SpatialAudioEngine } from "../audio/SpatialAudioEngine"
import * as THREE from "three"

interface SoundObject3DProps {
  id: string
  engine: SpatialAudioEngine
  emoji: string
  position: [number, number, number]
}

export function SoundObject3D({ id, engine, emoji, position }: SoundObject3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)

  useFrame((state) => {
    if (meshRef.current && !dragging) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
  }

  const handlePointerUp = () => {
    setDragging(false)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (dragging && meshRef.current) {
      const x = e.point.x
      const z = e.point.z
      meshRef.current.position.set(x, meshRef.current.position.y, z)
      engine.updatePosition(id, x, z)
    }
  }

  const toggleSound = () => {
    if (isPlaying) {
      engine.stopSound(id)
    } else {
      engine.playSound(id)
    }
    setIsPlaying(!isPlaying)
  }

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    toggleSound()
  }

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Glow effect */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={isPlaying ? "#e94560" : "#666"}
          emissive={isPlaying ? "#e94560" : "#333"}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Main sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : "#f0f0f0"}
          emissive={isPlaying ? "#e94560" : "#000"}
          emissiveIntensity={isPlaying ? 0.5 : 0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Emoji label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {emoji}
      </Text>

      {/* Status indicator */}
      {!isPlaying && (
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
        >
          PAUSED
        </Text>
      )}
    </group>
  )
}
