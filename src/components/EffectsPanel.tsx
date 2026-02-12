import { useState } from "react"
import { motion } from "framer-motion"
import { SpatialAudioEngine, EffectType } from "../audio/SpatialAudioEngine"

interface EffectSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}

const EffectSlider = ({ label, value, onChange, min, max, step, suffix = "" }: EffectSliderProps) => (
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
        [&::-webkit-slider-thumb]:bg-white/80 [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:hover:bg-white [&::-webkit-slider-thumb]:transition-colors"
    />
  </div>
)

export const EffectsPanel = ({ engine }: { engine: SpatialAudioEngine }) => {
  const [reverbAmount, setReverbAmount] = useState(0)
  const [delayAmount, setDelayAmount] = useState(0)
  const [delayTime, setDelayTime] = useState(0.3)
  const [delayFeedback, setDelayFeedback] = useState(0.4)

  const handleEffectChange = (effect: EffectType, value: number) => {
    engine.setEffectAmount(effect, value)
    if (effect === 'reverb') setReverbAmount(value)
    else setDelayAmount(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-20 right-4 w-72 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10"
    >
      <h3 className="text-white font-medium mb-4 text-sm tracking-wide">Effects</h3>

      <div className="space-y-4">
        {/* Reverb Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌊</span>
            <span className="text-xs text-white/60">Reverb</span>
          </div>
          <EffectSlider
            label="Amount"
            value={reverbAmount}
            onChange={(v) => handleEffectChange('reverb', v)}
            min={0}
            max={1}
            step={0.01}
          />
        </div>

        <div className="h-px bg-white/10" />

        {/* Delay Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔁</span>
            <span className="text-xs text-white/60">Delay</span>
          </div>
          <EffectSlider
            label="Amount"
            value={delayAmount}
            onChange={(v) => handleEffectChange('delay', v)}
            min={0}
            max={1}
            step={0.01}
          />
          <EffectSlider
            label="Time"
            value={delayTime}
            onChange={(v) => {
              setDelayTime(v)
              engine.setDelayTime(v)
            }}
            min={0.05}
            max={1}
            step={0.01}
            suffix="s"
          />
          <EffectSlider
            label="Feedback"
            value={delayFeedback}
            onChange={(v) => {
              setDelayFeedback(v)
              engine.setDelayFeedback(v)
            }}
            min={0}
            max={0.9}
            step={0.01}
          />
        </div>
      </div>
    </motion.div>
  )
}
