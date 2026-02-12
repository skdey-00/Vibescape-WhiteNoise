import { useEffect, useMemo, useState } from "react"
import { SpatialAudioEngine } from "./audio/SpatialAudioEngine"

const SOUND_CONFIG = [
  { id: "rain", emoji: "🌧️", x: 0, y: -100 },
  { id: "cafe", emoji: "☕", x: 0, y: 100 },
  { id: "vinyl", emoji: "📀", x: 100, y: 0 },
]

export default function App() {
  const engine = useMemo(() => new SpatialAudioEngine(), [])
  const [started, setStarted] = useState(false)
  const [sounds, setSounds] = useState(SOUND_CONFIG.map(s => ({ ...s, volume: 0.5 })))
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    if (!started) return

    engine.loadSound("rain", "/sounds/rain.mp3").then(() => engine.playSound("rain"))
    engine.loadSound("cafe", "/sounds/cafe.mp3").then(() => engine.playSound("cafe"))
    engine.loadSound("vinyl", "/sounds/vinyl.mp3").then(() => engine.playSound("vinyl"))
  }, [started])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const newX = e.clientX - centerX
      const newY = e.clientY - centerY

      // Limit to circle bounds
      const distance = Math.sqrt(newX * newX + newY * newY)
      const maxDist = 280
      let finalX = newX
      let finalY = newY

      if (distance > maxDist) {
        const angle = Math.atan2(newY, newX)
        finalX = Math.cos(angle) * maxDist
        finalY = Math.sin(angle) * maxDist
      }

      const ax = finalX / 50
      const ay = finalY / 50
      engine.updatePosition(draggingId, ax, ay)

      setSounds(prev => prev.map(s => s.id === draggingId ? { ...s, x: finalX, y: finalY } : s))
    }

    const handleMouseUp = () => {
      setDraggingId(null)
    }

    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingId, engine])

  if (!started) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #1e1e2f, #2b2b40)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "16px" }}>🎵 Lofi Flow</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", marginBottom: "32px" }}>Physics-based Audio Mixer</p>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: "16px 32px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "16px", cursor: "pointer" }}
        >
          Click to Start
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #1e1e2f, #2b2b40)", position: "relative", overflow: "hidden" }}>
      {/* Top Bar */}
      <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "16px", zIndex: 100 }}>
        <button style={{ padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", cursor: "pointer" }}>
          📚 Presets
        </button>
        <button style={{ padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", cursor: "pointer" }}>
          ✨ Effects
        </button>
        <button style={{ padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", cursor: "pointer" }}>
          🎵 Lofi
        </button>
      </div>

      {/* Spatial Grid */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Center dot */}
        <div style={{ position: "absolute", width: "16px", height: "16px", borderRadius: "50%", background: "white", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />

        {/* Sound Icons */}
        {sounds.map((sound) => (
          <div
            key={sound.id}
            onMouseDown={() => setDraggingId(sound.id)}
            style={{
              position: "absolute",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: draggingId === sound.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
              backdropFilter: "blur(12px)",
              border: draggingId === sound.id ? "2px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              cursor: "grab",
              left: `calc(50% + ${sound.x}px - 28px)`,
              top: `calc(50% + ${sound.y}px - 28px)`,
              userSelect: "none",
            }}
          >
            {sound.emoji}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", padding: "8px 16px", borderRadius: "20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
        Drag emojis to move sounds in space
      </div>
    </div>
  )
}
