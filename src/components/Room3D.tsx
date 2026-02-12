import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Stars, Environment } from "@react-three/drei"
import { SoundObject3D } from "./SoundObject3D"
import { SpatialAudioEngine } from "../audio/SpatialAudioEngine"

interface Room3DProps {
  engine: SpatialAudioEngine
  sounds: Array<{ id: string; emoji: string; position: [number, number, number] }>
}

export function Room3D({ engine, sounds }: Room3DProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#e94560" />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#4a90e2" />

        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />

        {/* Room Grid */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6366f1"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#818cf8"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.8}
            metalness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Sound Objects */}
        {sounds.map((sound) => (
          <SoundObject3D
            key={sound.id}
            id={sound.id}
            engine={engine}
            emoji={sound.emoji}
            position={sound.position}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  )
}
