import { useEffect, useMemo, useState } from "react"
import { SpatialAudioEngine } from "./audio/SpatialAudioEngine"
import { EffectsPanel } from "./components/EffectsPanel"
import { SystemAudioCapture, AudioSource } from "./audio/SystemAudioCapture"

interface Sound {
  id: string
  emoji: string
  x: number
  y: number
  name?: string
  isCustom?: boolean
  isSystemAudio?: boolean
}

export default function App() {
  const engine = useMemo(() => new SpatialAudioEngine(), [])
  const audioCapture = useMemo(() => new SystemAudioCapture(), [])
  const [started, setStarted] = useState(false)
  const [sounds, setSounds] = useState<Sound[]>([])
  const [audioSources, setAudioSources] = useState<AudioSource[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [showEffects, setShowEffects] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLofi, setIsLofi] = useState(false)
  const [mutedSounds, setMutedSounds] = useState<Set<string>>(new Set())
  const [sourceNameCounter, setSourceNameCounter] = useState(1)
  const [masterVolume, setMasterVolume] = useState(1.0)

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
      console.log(`[App] Dragging ${draggingId} to audio coords: x=${ax.toFixed(2)}, y=${ay.toFixed(2)} (screen: ${finalX.toFixed(0)}, ${finalY.toFixed(0)})`)
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

  const handleCaptureAudio = async () => {
    // Ensure audio context is running
    await engine.ensureAudioContextStarted()

    const sourceName = `Audio ${sourceNameCounter}`
    try {
      const source = await audioCapture.captureSystemAudio(sourceName)
      if (source) {
        setAudioSources(prev => [...prev, source])

        // Position the new sound at a random angle
        const angle = Math.random() * Math.PI * 2
        const distance = 100
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance

        const newSound: Sound = {
          id: source.id,
          emoji: "🔊",
          x,
          y,
          name: sourceName,
          isSystemAudio: true
        }

        setSounds(prev => [...prev, newSound])
        setSourceNameCounter(prev => prev + 1)

        // Play the stream
        engine.playStreamSound(source.id, source.stream, x / 50, y / 50)

        // Show important reminder
        setTimeout(() => {
          alert("⚠️ IMPORTANT: To avoid echo/duplicate audio, please mute the original audio source (e.g., mute the YouTube video, Spotify tab, etc.). You should now hear the audio ONLY through Lofi Flow's spatial positioning.")
        }, 500)
      }
    } catch (error) {
      console.error("Failed to capture audio:", error)
      alert(error instanceof Error ? error.message : "Failed to capture audio")
    }
  }

  const handleToggleLofi = () => {
    const newLofi = !isLofi
    setIsLofi(newLofi)
    engine.toggleLofi(newLofi)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value)
    setMasterVolume(volume)
    engine.setMasterVolume(volume)
  }

  const handleToggleMute = (id: string) => {
    const isMuted = mutedSounds.has(id)
    const newMutedSounds = new Set(mutedSounds)

    if (isMuted) {
      // Unmute: remove from muted set and restore volume
      newMutedSounds.delete(id)
      const sound = sounds.find(s => s.id === id)
      if (sound) {
        // Use dedicated unmute method
        engine.unmute(id, sound.x / 50, sound.y / 50)
      }
    } else {
      // Mute: add to muted set and silence
      newMutedSounds.add(id)
      engine.setMuted(id, true)
    }

    setMutedSounds(newMutedSounds)
  }

  const handleRemoveSound = (id: string) => {
    // Stop system audio capture if it's a system audio source
    if (audioSources.find(s => s.id === id)) {
      audioCapture.stopCapture(id)
      setAudioSources(prev => prev.filter(s => s.id !== id))
    }

    // Stop and remove from engine
    engine.stopSound(id)

    // Remove from sounds state
    setSounds(prev => prev.filter(s => s.id !== id))

    // Remove from muted set
    setMutedSounds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  if (!started) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #1e1e2f, #2b2b40)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "16px" }}>🔊 Spatial Audio Mixer</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", marginBottom: "32px" }}>Capture and spatialize your laptop's audio</p>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: "16px 32px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "16px", cursor: "pointer" }}
        >
          Click to Start
        </button>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "24px", textAlign: "center", maxWidth: "400px" }}>
          You'll be able to capture system audio and position each source in 3D space
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #1e1e2f, #2b2b40)", position: "relative", overflow: "hidden" }}>
      {/* Top Bar */}
      <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "16px", alignItems: "center", zIndex: 100 }}>
        <button
          onClick={handleCaptureAudio}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: "rgba(34, 197, 94, 0.3)",
            border: "1px solid rgba(34, 197, 94, 0.5)",
            color: "#86efac",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          + Capture Audio
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <span style={{ color: "white", fontSize: "14px" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={masterVolume}
            onChange={handleVolumeChange}
            style={{ width: "100px", cursor: "pointer" }}
          />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", minWidth: "30px" }}>
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
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

          {/* Capturing Audio */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>+ Capture Audio</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5", marginBottom: "8px" }}>
              Click to capture your laptop's system audio. When prompted, select a tab, window, or your entire screen, and <strong>make sure to check "Share system audio"</strong>.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: "1.4" }}>
              <strong>💡 Browser Limitation:</strong> The original source must play audio for this to capture it. Use the master volume slider (🔊) to balance Lofi Flow's output against the original audio. For perfect isolation, see <code>VIRTUAL_AUDIO_SETUP.md</code>.
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
              Applies a warm low-pass filter that softens high frequencies, giving audio a vintage, nostalgic "lo-fi" character.
            </p>
          </div>

          {/* Sound Icons */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🔊</span>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>Sound Sources</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.5" }}>
              Each captured audio source appears as a draggable icon. <br/>
              <em>Double-click to mute/unmute. Hover and click × to remove.</em>
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
              title={sound.name || sound.id}
              onMouseDown={() => !isMuted && setDraggingId(sound.id)}
              onDoubleClick={() => handleToggleMute(sound.id)}
              className="sound-icon-wrapper"
              style={{
                position: "absolute",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: isMuted
                  ? "rgba(239, 68, 68, 0.3)"
                  : sound.isSystemAudio
                    ? "rgba(34, 197, 94, 0.2)"
                    : draggingId === sound.id
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: isMuted
                  ? "2px solid rgba(239, 68, 68, 0.5)"
                  : sound.isSystemAudio
                    ? "2px solid rgba(34, 197, 94, 0.4)"
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
              {/* Delete button for system audio sounds - visible on hover */}
              {sound.isSystemAudio && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSound(sound.id)
                  }}
                  className="delete-btn"
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(239, 68, 68, 0.9)",
                    border: "none",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "auto"
                  }}
                >
                  ×
                </button>
              )}
              <style>{`
                .sound-icon-wrapper:hover .delete-btn {
                  opacity: 1 !important;
                }
              `}</style>
            </div>
          )
        })}
      </div>

      <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", padding: "8px 16px", borderRadius: "20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
        {sounds.length === 0 ? "Click + Capture Audio to start" : "Drag to move sounds • Use 🔊 volume slider to balance audio"}
      </div>
    </div>
  )
}
