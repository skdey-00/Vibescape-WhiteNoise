import { useEffect } from "react"

export const useAudioPulse = (analyser: AnalyserNode | null) => {
  useEffect(() => {
    if (!analyser) return

    const data = new Uint8Array(analyser.frequencyBinCount)

    const loop = () => {
      analyser.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < 20; i++) sum += data[i]
      const avg = sum / 20
      const scale = 1 + (avg / 255) * 0.4

      document.documentElement.style.setProperty("--pulse-scale", scale.toString())
      requestAnimationFrame(loop)
    }

    loop()
  }, [analyser])
}
