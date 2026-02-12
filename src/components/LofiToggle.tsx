import { useState } from "react"
import { motion } from "framer-motion"
import { SpatialAudioEngine } from "../audio/SpatialAudioEngine"

interface LofiToggleProps {
  engine: SpatialAudioEngine
  onToggleEffects?: () => void
  showEffects?: boolean
}

export const LofiToggle = ({ engine, onToggleEffects, showEffects }: LofiToggleProps) => {
  const [isLofi, setIsLofi] = useState(false)

  const handleToggle = () => {
    setIsLofi(!isLofi)
    engine.toggleLofi(!isLofi)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`px-5 py-2.5 rounded-xl backdrop-blur border transition-all ${
          isLofi
            ? "bg-amber-500/30 border-amber-400/50 text-amber-200"
            : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"
        }`}
      >
        <span className="text-sm font-medium">🎵 Lofi</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleEffects}
        className={`px-5 py-2.5 rounded-xl backdrop-blur border transition-all ${
          showEffects
            ? "bg-purple-500/30 border-purple-400/50 text-purple-200"
            : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"
        }`}
      >
        <span className="text-sm font-medium">✨ Effects</span>
      </motion.button>
    </>
  )
}
