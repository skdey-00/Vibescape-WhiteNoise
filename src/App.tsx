import { useEffect, useMemo, useState } from "react"
import { SpatialAudioEngine } from "./audio/SpatialAudioEngine"
import { PresetPanel } from "./components/PresetPanel"
import { EffectsPanel } from "./components/EffectsPanel"
import { Preset } from "./lib/presets"

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
  const [showPresets, setShowPresets] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLofi, setIsLofi] = useState(false)
  const [mutedSounds, setMutedSounds] = useState<Set<string>>(new Set())

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

  const handleSelectPreset = (preset: Preset) => {
    // Update sound positions from preset
    setSounds(prev => prev.map(sound => {
      const presetSound = preset.sounds.find(s => s.id === sound.id)
      if (presetSound) {
        return {
          ...sound,
          x: presetSound.position[0] * 50,
          y: presetSound.position[1] * 50,
        }
      }
      return sound
    }))

    // Update lofi state
    setIsLofi(preset.lofi)
  }

  const handleToggleLofi = () => {
    const newLofi = !isLofi
    setIsLofi(newLofi)
    engine.toggleLofi(newLofi)
  }

  const handleToggleMute = (id: string) => {
    const isMuted = mutedSounds.has(id)
    const newMutedSounds = new Set(mutedSounds)

    if (isMuted) {
      newMutedSounds.delete(id)
      engine.setMuted(id, false)
      // Restore position to update volume based on current position
      const sound = sounds.find(s => s.id === id)
      if (sound) {
        engine.updatePosition(id, sound.x / 50, sound.y / 50)
      }
    } else {
      newMutedSounds.add(id)
      engine.setMuted(id, true)
    }

    setMutedSounds(newMutedSounds)
  }

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
        <button
          onClick={() => setShowPresets(!showPresets)}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: showPresets ? "rgba(168, 85, 247, 0.3)" : "rgba(255,255,255,0.1)",
            border: showPresets ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(255,255,255,0.2)",
            color: showPresets ? "#d8b4fe" : "white",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          📚 Presets
        </button>
        <button
          onClick={() => setShowEffects(!showEffects)}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: showEffects ? "rgba(168, 85, 247, 0.3)" : "rgba(255,255,255,0.1)",
            border: showEffects ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(255,255,255,0.2)",
            color: showEffects ? "#d8b4fe" : "white",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ✨ Effects
        </button>
        <button
          onClick={handleToggleLofi}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: isLofi ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.1)",
            border: isLofi ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid rgba(255,255,255,0.2)",
            color: isLofi ? "#fcd34d" : "white",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          🎵 Lofi
        </button>
      </div>

      {/* Preset Panel */}
      <PresetPanel
        engine={engine}
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Effects Panel */}
      {showEffects && <EffectsPanel engine={engine} />}

      {/* Info Button - Top Right */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: showInfo ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.1)",
          border: showInfo ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(255,255,255,0.2)",
          color: showInfo ? "#93c5fd" : "white",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}
      >
        ?
      </button>

      {/* Info Panel */}
      {showInfo && (
        <div style={{
          position: "absolute",
          top: "70px",
          right: "16px",
          width: "340px",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
          zIndex: 100
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>How It Works</h3>
            <button
              onClick={() => setShowInfo(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "20px", cursor: "pointer" }}
            >
              ×
            </button>
          </div>

          {/* Spatial Grid */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🎯</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Spatial Grid</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              The circular area represents a 2D sound space. The white dot in the center is your listening position. Drag sound icons around to control their volume and stereo position - closer sounds are louder!
            </p>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>📚</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Presets</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              Pre-configured soundscapes that instantly set sound positions and effects. Try "Cozy Rain" for a relaxing vibe or "Study Session" for focused work.
            </p>
          </div>

          {/* Effects */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>✨</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Effects</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              <strong>Reverb</strong> - Adds space and ambiance, making sounds feel like they're in a room.<br/>
              <strong>Delay</strong> - Creates echo effects. Adjust time for echo speed and feedback for echo repeats.
            </p>
          </div>

          {/* Lofi */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🎵</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Lofi Mode</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              Applies a warm low-pass filter that softens high frequencies, giving audio a vintage, nostalgic "lo-fi" character. Perfect for relaxation and study.
            </p>
          </div>

          {/* Sound Icons */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🔊</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Sound Icons</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              <span style={{ marginRight: "8px" }}>🌧️</span><strong>Rain</strong> - Gentle rain sounds<br/>
              <span style={{ marginRight: "8px" }}>☕</span><strong>Cafe</strong> - Coffee shop ambience<br/>
              <span style={{ marginRight: "8px" }}>📀</span><strong>Vinyl</strong> - Lofi music & crackle<br/><br/>
              <em>Double-click an icon to mute/unmute that sound.</em>
            </p>
          </div>
        </div>
      )}

      {/* Spatial Grid */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Center dot */}
        <div style={{ position: "absolute", width: "16px", height: "16px", borderRadius: "50%", background: "white", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />

        {/* Sound Icons */}
        {sounds.map((sound) => {
          const isMuted = mutedSounds.has(sound.id)
          return (
            <div
              key={sound.id}
              onMouseDown={() => !isMuted && setDraggingId(sound.id)}
              onDoubleClick={() => handleToggleMute(sound.id)}
              style={{
                position: "absolute",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: isMuted
                  ? "rgba(239, 68, 68, 0.3)"
                  : draggingId === sound.id
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: isMuted
                  ? "2px solid rgba(239, 68, 68, 0.5)"
                  : draggingId === sound.id
                    ? "2px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                cursor: isMuted ? "pointer" : "grab",
                left: `calc(50% + ${sound.x}px - 28px)`,
                top: `calc(50% + ${sound.y}px - 28px)`,
                userSelect: "none",
                opacity: isMuted ? 0.6 : 1,
                transition: "opacity 0.2s, background 0.2s, border 0.2s",
              }}
            >
              {isMuted ? (
                <span style={{ position: "relative" }}>
                  {sound.emoji}
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "28px",
                    color: "rgba(239, 68, 68, 0.8)"
                  }}>⊘</span>
                </span>
              ) : (
                sound.emoji
              )}
            </div>
          )
        })}
      </div>

      <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", padding: "8px 16px", borderRadius: "20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
        Drag to move sounds • Double-click to mute/unmute
      </div>
    </div>
  )
}
