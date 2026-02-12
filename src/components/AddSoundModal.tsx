import { useState, useRef, DragEvent, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AddSoundModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSound: (sound: { id: string; name: string; emoji: string; file: File }) => void
}

const EMOJI_OPTIONS = ["🎵", "🎶", "🎸", "🎹", "🎺", "🎻", "🥁", "🎤", "🎧", "🎼", "🌊", "🔥", "💨", "🌲", "🐦", "🌙", "⚡", "🔔", "📢", "💫"]

export function AddSoundModal({ isOpen, onClose, onAddSound }: AddSoundModalProps) {
  const [name, setName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("🎵")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError("")

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile)
      if (!name) {
        setName(droppedFile.name.replace(/\.[^/.]+$/, ""))
      }
    } else {
      setError("Please drop an audio file (MP3, WAV, etc.)")
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError("")
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = () => {
    if (!file) {
      setError("Please select an audio file")
      return
    }
    if (!name.trim()) {
      setError("Please enter a name for your sound")
      return
    }

    const id = `custom-${Date.now()}`
    onAddSound({
      id,
      name: name.trim(),
      emoji: selectedEmoji,
      file
    })

    // Reset form
    setName("")
    setSelectedEmoji("🎵")
    setFile(null)
    setError("")
    onClose()
  }

  const handleClose = () => {
    setName("")
    setSelectedEmoji("🎵")
    setFile(null)
    setError("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 200
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              marginTop: "-280px",
              marginLeft: "-200px",
              width: "400px",
              padding: "24px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #1e1e2f, #2b2b40)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              zIndex: 201
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "white", fontSize: "18px", fontWeight: "600", margin: 0 }}>Add Custom Sound</h2>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "24px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? "2px dashed rgba(59, 130, 246, 0.8)" : "2px dashed rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "32px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: isDragging ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.02)",
                marginBottom: "20px"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              {file ? (
                <div>
                  <span style={{ fontSize: "32px", marginBottom: "8px", display: "block" }}>🎵</span>
                  <p style={{ color: "white", fontSize: "14px", margin: 0 }}>{file.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "4px" }}>
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: "32px", marginBottom: "8px", display: "block" }}>📁</span>
                  <p style={{ color: "white", fontSize: "14px", margin: 0 }}>Drop audio file here</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "4px" }}>
                    or click to browse (MP3, WAV, etc.)
                  </p>
                </div>
              )}
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "12px", marginBottom: "8px" }}>
                Sound Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Sound"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Emoji Picker */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "12px", marginBottom: "8px" }}>
                Choose Emoji
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: selectedEmoji === emoji ? "2px solid rgba(59, 130, 246, 0.8)" : "1px solid rgba(255,255,255,0.2)",
                      background: selectedEmoji === emoji ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)",
                      fontSize: "18px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px", margin: "0 0 16px 0" }}>
                {error}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Add Sound
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
