import { useState } from "react"

interface Props {
  onClose: () => void
  onComplete: () => void
}

export function VirtualAudioGuide({ onClose, onComplete }: Props) {
  const [step, setStep] = useState(1)

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        width: "90%",
        maxWidth: "700px",
        maxHeight: "80vh",
        overflowY: "auto",
        background: "linear-gradient(135deg, #1e1e2f, #2b2b40)",
        borderRadius: "24px",
        padding: "32px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            🎧 Setup: Control Any App's Audio
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#86efac", fontSize: "18px", marginBottom: "12px" }}>
                Why You Need This
              </h3>
              <p style={{ lineHeight: "1.6", color: "rgba(255,255,255,0.8)" }}>
                To control audio from ANY application (Spotify, YouTube, Discord, games, etc.) independently,
                you need to install a <strong>Virtual Audio Cable</strong>. This creates an internal audio
                path that routes audio from any app into Lofi Flow, giving you complete control.
              </p>
            </div>

            <div style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>✓</span>
                <strong style={{ color: "#86efac" }}>What You'll Be Able To Do:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: "32px", color: "rgba(255,255,255,0.8)", lineHeight: "1.8" }}>
                <li>Mute Spotify but keep Discord playing</li>
                <li>Position YouTube audio to the left, game audio to the right</li>
                <li>Apply effects (reverb, delay, lofi) to ANY app's audio</li>
                <li>Control volume of each app independently</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(34, 197, 94, 0.3)",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#86efac",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Next: Install Virtual Audio Cable →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#86efac", fontSize: "18px", marginBottom: "12px" }}>
                Step 1: Install VB-Audio Cable (Windows)
              </h3>
              <ol style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", paddingLeft: "20px" }}>
                <li style={{ marginBottom: "12px" }}>
                  <strong>Download:</strong>{" "}
                  <a
                    href="https://vb-audio.com/Cable/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#60a5fa", textDecoration: "underline" }}
                  >
                    vb-audio.com/Cable/
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <strong>Install:</strong> Download and install "VB-Cable" (it's free, donationware)
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <strong>Restart:</strong> Restart your computer when prompted
                </li>
                <li>
                  <strong>Verify:</strong> In Windows Sound Settings, you should see "Cable Input" and "Cable Output"
                </li>
              </ol>
            </div>

            <div style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>ℹ️</span>
                <strong style={{ color: "#93c5fd" }}>For Mac Users:</strong>
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                Use <strong>BlackHole</strong> instead (free, open-source):<br/>
                <code style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px" }}>
                  brew install blackhole-2ch
                </code>
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(34, 197, 94, 0.3)",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#86efac",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Next: Route Your Apps →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#86efac", fontSize: "18px", marginBottom: "12px" }}>
                Step 2: Route Your Apps to the Virtual Cable
              </h3>
              <p style={{ lineHeight: "1.6", color: "rgba(255,255,255,0.8)", marginBottom: "16px" }}>
                Now configure each app you want to control to output to the virtual cable instead of your speakers:
              </p>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "white" }}>
                  Option A: Windows Volume Mixer (Recommended)
                </h4>
                <ol style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", paddingLeft: "20px", fontSize: "14px" }}>
                  <li style={{ marginBottom: "8px" }}>
                    Right-click the speaker icon in your taskbar → <strong>Open Volume Mixer</strong>
                  </li>
                  <li style={{ marginBottom: "8px" }}>
                    For each app (Chrome, Spotify, Discord, etc.), change the output to <strong>"Cable Input"</strong>
                  </li>
                  <li>
                    The app's audio will now go to Lofi Flow instead of your speakers!
                  </li>
                </ol>
              </div>

              <div style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "20px" }}>🎵</span>
                  <strong style={{ color: "#fcd34d" }}>Spotify-Specific Instructions:</strong>
                </div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                  In Spotify: <strong>Settings → Audio Output → Cable Input</strong><br/>
                  Then you can control Spotify independently while keeping other apps on default output!
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "white" }}>
                  Option B: System-Wide (All Apps)
                </h4>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: "1.6" }}>
                  Go to <strong>Windows Settings → System → Sound → Choose output</strong><br/>
                  Set it to <strong>"Cable Input"</strong> to route ALL apps through Lofi Flow.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(34, 197, 94, 0.3)",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#86efac",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Next: Capture in Lofi Flow →
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#86efac", fontSize: "18px", marginBottom: "12px" }}>
                Step 3: Capture Audio in Lofi Flow
              </h3>
              <ol style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", paddingLeft: "20px" }}>
                <li style={{ marginBottom: "12px" }}>
                  <strong>Click "+ Capture Audio"</strong> button
                </li>
                <li style={{ marginBottom: "12px" }}>
                  Choose what to share: <strong>"Chrome Tab"</strong>, <strong>"Window"</strong>, or <strong>"Entire Screen"</strong>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <strong>✓ Check "Share system audio"</strong> - THIS IS CRITICAL!
                </li>
                <li style={{ marginBottom: "12px" }}>
                  Click <strong>"Share"</strong>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  Start playing audio in your app (Spotify, YouTube, etc.)
                </li>
                <li>
                  Drag the sound icon to position it in 3D space!
                </li>
              </ol>
            </div>

            <div style={{
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>✨</span>
                <strong style={{ color: "#d8b4fe" }}>Pro Tip:</strong>
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                If you routed apps to VB-Cable, the original app might still play audio to your speakers.
                Use the <strong>master volume slider</strong> to balance Lofi Flow's output against the original,
                or mute the original app for complete control!
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  onComplete()
                  onClose()
                }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(34, 197, 94, 0.3)",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#86efac",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Got It, Start Capturing! 🎉
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
