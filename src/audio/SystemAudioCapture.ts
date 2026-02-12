export interface AudioSource {
  id: string
  name: string
  stream: MediaStream
  track: MediaStreamTrack
}

export class SystemAudioCapture {
  private sources = new Map<string, AudioSource>()

  /**
   * Capture system audio using getDisplayMedia API
   * This will prompt the user to share their screen/audio
   */
  async captureSystemAudio(sourceName: string): Promise<AudioSource | null> {
    try {
      console.log(`[SystemAudioCapture] Starting capture for ${sourceName}`)

      // Request display media with audio
      // Note: The user must select "Share system audio" checkbox in the browser dialog
      const displayMedia = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2
        } as MediaTrackConstraints
      })

      console.log(`[SystemAudioCapture] Got stream with ${displayMedia.getTracks().length} tracks`)

      // Get the audio track from the stream
      const audioTracks = displayMedia.getAudioTracks()
      if (audioTracks.length === 0) {
        console.error('[SystemAudioCapture] No audio tracks found in stream')
        throw new Error('No audio track found. Please make sure to check "Share system audio" in the sharing dialog.')
      }

      const audioTrack = audioTracks[0]
      console.log(`[SystemAudioCapture] Found audio track: ${audioTrack.label || 'unnamed'}`)

      // Generate a unique ID for this source
      const id = `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const source: AudioSource = {
        id,
        name: sourceName,
        stream: displayMedia,
        track: audioTrack
      }

      this.sources.set(id, source)
      console.log(`[SystemAudioCapture] Successfully captured audio source ${id}`)

      // Listen for when the user stops sharing
      audioTrack.addEventListener('ended', () => {
        console.log(`[SystemAudioCapture] Audio track ended for ${id}`)
        this.sources.delete(id)
      })

      return source
    } catch (error) {
      console.error('[SystemAudioCapture] Failed to capture system audio:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Permission denied. Please allow screen and audio sharing.')
        } else if (error.name === 'NotSupportedError') {
          throw new Error('System audio capture is not supported in this browser. Please try Chrome or Edge.')
        }
      }
      throw error
    }
  }

  /**
   * Stop capturing a specific audio source
   */
  stopCapture(id: string): void {
    const source = this.sources.get(id)
    if (source) {
      // Stop all tracks in the stream
      source.stream.getTracks().forEach(track => track.stop())
      this.sources.delete(id)
    }
  }

  /**
   * Get a specific audio source by ID
   */
  getSource(id: string): AudioSource | undefined {
    return this.sources.get(id)
  }

  /**
   * Get all active audio sources
   */
  getAllSources(): AudioSource[] {
    return Array.from(this.sources.values())
  }

  /**
   * Stop all audio captures
   */
  stopAll(): void {
    this.sources.forEach((source) => {
      source.stream.getTracks().forEach(track => track.stop())
    })
    this.sources.clear()
  }
}
