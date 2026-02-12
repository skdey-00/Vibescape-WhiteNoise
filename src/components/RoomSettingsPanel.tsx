import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SpatialAudioEngine, RoomConfig } from "../audio/SpatialAudioEngine"

interface RoomSettingsPanelProps {
  engine: SpatialAudioEngine
  isOpen: boolean
  onClose: () => void
}

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}

const Slider = ({ label, value, onChange, min, max, step, suffix = "" }: SliderProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-xs text-white/70">
      <span>{label}</span>
      <span>{value.toFixed(2)}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:hover:bg-cyan-300 [&::-webkit-slider-thumb]:transition-colors"
    />
  </div>
)

export function RoomSettingsPanel({ engine, isOpen, onClose }: RoomSettingsPanelProps) {
  const [config, setConfig] = useState<RoomConfig>(engine.getRoomConfig())

  useEffect(() => {
    setConfig(engine.getRoomConfig())
  }, [engine, isOpen])

  const updateConfig = (key: keyof RoomConfig, value: number) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    engine.setRoomConfig({ [key]: value })
  }

  const presetRooms = [
    { name: "Small Room", config: { width: 10, depth: 10, wallReflection: 0.4, ceilingHeight: 2.5 } },
    { name: "Medium Room", config: { width: 20, depth: 20, wallReflection: 0.3, ceilingHeight: 3 } },
    { name: "Large Hall", config: { width: 40, depth: 40, wallReflection: 0.6, ceilingHeight: 5 } },
    { name: "Cathedral", config: { width: 60, depth: 80, wallReflection: 0.8, ceilingHeight: 10 } },
  ]

  const applyPreset = (roomConfig: RoomConfig) => {
    setConfig(roomConfig)
    engine.setRoomConfig(roomConfig)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-4 bottom-4 w-72"
        >
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium text-sm tracking-wide flex items-center gap-2">
                <span>🏠</span>
                <span>Room Acoustics</span>
              </h3>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors text-lg"
              >
                ×
              </button>
            </div>

            {/* Room Presets */}
            <div className="mb-4">
              <p className="text-xs text-white/50 mb-2">Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {presetRooms.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.config)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-white/80 hover:text-white transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Slider
                label="Room Width"
                value={config.width}
                onChange={(v) => updateConfig("width", v)}
                min={5}
                max={100}
                step={1}
                suffix="m"
              />
              <Slider
                label="Room Depth"
                value={config.depth}
                onChange={(v) => updateConfig("depth", v)}
                min={5}
                max={100}
                step={1}
                suffix="m"
              />
              <Slider
                label="Wall Reflection"
                value={config.wallReflection}
                onChange={(v) => updateConfig("wallReflection", v)}
                min={0}
                max={1}
                step={0.01}
              />
              <Slider
                label="Ceiling Height"
                value={config.ceilingHeight}
                onChange={(v) => updateConfig("ceilingHeight", v)}
                min={2}
                max={20}
                step={0.5}
                suffix="m"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-white/30 text-xs text-center">
                Sounds closer to walls get more reverb
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
