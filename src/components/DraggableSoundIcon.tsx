import { motion } from "framer-motion"
import { SpatialAudioEngine } from "../audio/SpatialAudioEngine"

interface DraggableSoundIconProps {
  id: string
  engine: SpatialAudioEngine
  emoji: string
}

export const DraggableSoundIcon = ({ id, engine, emoji }: DraggableSoundIconProps) => {
  const mapToAudio = (x: number, y: number) => ({ ax: x / 50, ay: y / 50 })

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={(_e, info) => {
        const { ax, ay } = mapToAudio(info.point.x - window.innerWidth / 2, info.point.y - window.innerHeight / 2)
        engine.updatePosition(id, ax, ay)
      }}
      className="absolute w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-grab hover:bg-white/30 transition-colors text-2xl select-none"
      whileHover={{ scale: 1.1 }}
      whileDrag={{ scale: 1.15, cursor: "grabbing" }}
    >
      {emoji}
    </motion.div>
  )
}
