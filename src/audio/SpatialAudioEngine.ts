export type SoundNodeChain = {
  source: AudioBufferSourceNode | MediaStreamAudioSourceNode
  gain: GainNode
  panner: PannerNode
  filter: BiquadFilterNode
  sendGain: GainNode
}

export type EffectType = 'reverb' | 'delay'

export interface RoomConfig {
  width: number
  depth: number
  wallReflection: number
  ceilingHeight: number
}

export class SpatialAudioEngine {
  private ctx = new AudioContext()
  private masterGain = this.ctx.createGain()
  private masterVolumeGain = this.ctx.createGain()
  private analyser = this.ctx.createAnalyser()
  private masterLowpass = this.ctx.createBiquadFilter()
  private sounds = new Map<string, SoundNodeChain>()
  private buffers = new Map<string, AudioBuffer>()

  // Effect nodes
  private reverbGain: GainNode
  private reverbConvolver: ConvolverNode
  private delayGain: GainNode
  private delayNode: DelayNode
  private delayFeedback: GainNode
  private delayInput: GainNode

  // Room acoustics
  private roomConfig: RoomConfig = {
    width: 20,
    depth: 20,
    wallReflection: 0.3,
    ceilingHeight: 3,
  }

  constructor() {
    console.log(`[SpatialAudioEngine] Constructor called, audio context state: ${this.ctx.state}`)

    this.masterLowpass.type = "lowpass"
    this.masterLowpass.frequency.value = 18000

    this.analyser.fftSize = 512

    // Setup reverb
    this.reverbConvolver = this.ctx.createConvolver()
    this.reverbGain = this.ctx.createGain()
    this.reverbGain.gain.value = 0

    // Setup delay with proper feedback routing
    this.delayNode = this.ctx.createDelay(1.0)
    this.delayNode.delayTime.value = 0.4 // Slightly longer default delay
    this.delayFeedback = this.ctx.createGain()
    this.delayFeedback.gain.value = 0.5 // Higher feedback for more repeats
    this.delayGain = this.ctx.createGain()
    this.delayGain.gain.value = 0

    // Create impulse response for reverb
    this.createImpulseResponse()

    // Create a separate node for delay input to avoid feedback loop issues
    const delayInput = this.ctx.createGain()
    delayInput.gain.value = 1

    // Connect delay: input -> delayNode -> (output + feedback -> back to input)
    delayInput.connect(this.delayNode)
    this.delayNode.connect(this.delayGain)
    this.delayNode.connect(this.delayFeedback)
    this.delayFeedback.connect(delayInput)

    // Store delayInput for connecting sounds
    this.delayInput = delayInput

    // Connect effects to master
    this.reverbConvolver.connect(this.reverbGain)
    this.reverbGain.connect(this.masterGain)
    this.delayGain.connect(this.masterGain)

    // Main signal chain (added masterVolumeGain for volume control)
    this.masterGain.connect(this.masterVolumeGain)
    this.masterVolumeGain.connect(this.masterLowpass)
    this.masterLowpass.connect(this.analyser)
    this.analyser.connect(this.ctx.destination)

    console.log(`[SpatialAudioEngine] Audio graph connected successfully`)
  }

  /**
   * Ensure audio context is running (browsers suspend until user interaction)
   */
  async ensureAudioContextStarted() {
    if (this.ctx.state === 'suspended') {
      console.log(`[SpatialAudioEngine] Resuming suspended audio context...`)
      await this.ctx.resume()
      console.log(`[SpatialAudioEngine] Audio context resumed, state: ${this.ctx.state}`)
    } else {
      console.log(`[SpatialAudioEngine] Audio context already running: ${this.ctx.state}`)
    }
  }

  private createImpulseResponse() {
    const sampleRate = this.ctx.sampleRate
    const length = sampleRate * 3 // 3 seconds for longer reverb
    const impulse = this.ctx.createBuffer(2, length, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        // Stronger exponential decay with more initial energy
        const decay = Math.pow(1 - i / length, 1.5)
        channelData[i] = (Math.random() * 2 - 1) * decay * 2.5 // Increased amplitude
      }
    }

    this.reverbConvolver.buffer = impulse
  }

  getAnalyser() {
    return this.analyser
  }

  async loadSound(id: string, url: string) {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    const audio = await this.ctx.decodeAudioData(buf)
    this.buffers.set(id, audio)
  }

  playSound(id: string) {
    const buffer = this.buffers.get(id)
    if (!buffer) return

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = this.ctx.createGain()
    const panner = this.ctx.createPanner()
    const filter = this.ctx.createBiquadFilter()
    const sendGain = this.ctx.createGain()

    panner.panningModel = "HRTF"
    panner.distanceModel = "exponential"
    panner.refDistance = 1
    panner.maxDistance = 20
    panner.rolloffFactor = 1

    filter.type = "lowpass"
    filter.frequency.value = 12000
    sendGain.gain.value = 1.0

    // Connect dry signal
    source.connect(gain).connect(panner).connect(filter).connect(this.masterGain)

    // Connect to effects sends
    filter.connect(sendGain)
    sendGain.connect(this.reverbConvolver)
    sendGain.connect(this.delayInput)

    source.start()

    this.sounds.set(id, { source, gain, panner, filter, sendGain })
  }

  /**
   * Play a live audio stream from system audio capture
   */
  playStreamSound(id: string, stream: MediaStream, initialX: number = 0, initialY: number = 0) {
    // Check if already playing
    if (this.sounds.has(id)) {
      console.warn(`[SpatialAudioEngine] Sound ${id} is already playing`)
      return
    }

    console.log(`[SpatialAudioEngine] Creating stream sound ${id} with ${stream.getAudioTracks().length} audio tracks`)

    const source = this.ctx.createMediaStreamSource(stream)

    const gain = this.ctx.createGain()
    const panner = this.ctx.createPanner()
    const filter = this.ctx.createBiquadFilter()
    const sendGain = this.ctx.createGain()

    panner.panningModel = "HRTF"
    panner.distanceModel = "exponential"
    panner.refDistance = 1
    panner.maxDistance = 20
    panner.rolloffFactor = 1

    filter.type = "lowpass"
    filter.frequency.value = 12000
    sendGain.gain.value = 1.0

    // Connect dry signal
    source.connect(gain).connect(panner).connect(filter).connect(this.masterGain)

    // Connect to effects sends
    filter.connect(sendGain)
    sendGain.connect(this.reverbConvolver)
    sendGain.connect(this.delayInput)

    this.sounds.set(id, { source, gain, panner, filter, sendGain })

    console.log(`[SpatialAudioEngine] Stream sound ${id} created and connected`)

    // Set initial position
    this.updatePosition(id, initialX, initialY)
  }

  stopSound(id: string) {
    const sound = this.sounds.get(id)
    if (!sound) return

    const now = this.ctx.currentTime
    sound.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    setTimeout(() => {
      // Only call stop() on AudioBufferSourceNode
      // MediaStreamAudioSourceNode doesn't have a stop() method
      if ('stop' in sound.source) {
        sound.source.stop()
      }
      this.sounds.delete(id)
    }, 500)
  }

  /**
   * Update sound position with improved physics:
   * - Distance-based volume attenuation (inverse square law)
   * - Distance-based filtering (air absorption)
   * - Wall reflections (calculate distance to walls)
   * - Position-based reverb (more reverb when further from center)
   */
  updatePosition(id: string, x: number, y: number) {
    const sound = this.sounds.get(id)
    if (!sound) return
    const now = this.ctx.currentTime

    // Update 3D position - use setValueAtTime for immediate response when dragging
    sound.panner.positionX.setValueAtTime(x, now)
    sound.panner.positionZ.setValueAtTime(y, now)

    // Calculate distance from center (listener position)
    const distance = Math.sqrt(x * x + y * y)

    // Physics: Inverse square law for volume attenuation
    // Minimum volume of 0.1, max of 1.0
    const volume = Math.max(0.1, 1 / (1 + distance * 0.3))

    // Physics: Air absorption - higher frequencies are attenuated more with distance
    const cutoffFreq = Math.max(600, 15000 - distance * 1200)

    // Physics: Calculate wall reflections
    const { width, depth } = this.roomConfig
    const distToLeft = Math.abs(x + width / 2)
    const distToRight = Math.abs(x - width / 2)
    const distToFront = Math.abs(y + depth / 2)
    const distToBack = Math.abs(y - depth / 2)

    const minWallDistance = Math.min(distToLeft, distToRight, distToFront, distToBack)

    // Increase reverb when closer to walls (sound reflects off walls)
    const wallReverbBoost = Math.max(0, 1 - minWallDistance / 5) * this.roomConfig.wallReflection * 2

    // Apply all physics calculations IMMEDIATELY (no ramps for instant response)
    sound.gain.gain.setValueAtTime(volume, now)
    sound.filter.frequency.setValueAtTime(cutoffFreq, now)
    sound.sendGain.gain.setValueAtTime(0.8 + wallReverbBoost, now)
  }

  toggleLofi(on: boolean) {
    this.masterLowpass.frequency.setValueAtTime(on ? 2000 : 18000, this.ctx.currentTime)
  }

  setEffectAmount(effect: EffectType, value: number) {
    const now = this.ctx.currentTime

    if (effect === 'reverb') {
      // Multiply by 2 for more pronounced reverb effect
      const scaledValue = value * 2
      this.reverbGain.gain.setValueAtTime(this.reverbGain.gain.value, now)
      this.reverbGain.gain.linearRampToValueAtTime(scaledValue, now + 0.1)
    } else if (effect === 'delay') {
      // Multiply by 1.5 for more pronounced delay effect
      const scaledValue = value * 1.5
      this.delayGain.gain.setValueAtTime(this.delayGain.gain.value, now)
      this.delayGain.gain.linearRampToValueAtTime(scaledValue, now + 0.1)
    }
  }

  setDelayTime(time: number) {
    const now = this.ctx.currentTime
    this.delayNode.delayTime.setValueAtTime(this.delayNode.delayTime.value, now)
    this.delayNode.delayTime.linearRampToValueAtTime(time, now + 0.05)
  }

  setDelayFeedback(feedback: number) {
    const now = this.ctx.currentTime
    this.delayFeedback.gain.setValueAtTime(this.delayFeedback.gain.value, now)
    this.delayFeedback.gain.linearRampToValueAtTime(feedback, now + 0.05)
  }

  getEffectAmount(effect: EffectType): number {
    if (effect === 'reverb') {
      return this.reverbGain.gain.value
    } else {
      return this.delayGain.gain.value
    }
  }

  setRoomConfig(config: Partial<RoomConfig>) {
    this.roomConfig = { ...this.roomConfig, ...config }
  }

  getRoomConfig(): RoomConfig {
    return { ...this.roomConfig }
  }

  isPlaying(id: string): boolean {
    return this.sounds.has(id)
  }

  getLoadedSounds(): string[] {
    return Array.from(this.buffers.keys())
  }

  setMuted(id: string, muted: boolean) {
    const sound = this.sounds.get(id)
    if (!sound) return

    const now = this.ctx.currentTime
    if (muted) {
      sound.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    } else {
      // When unmuting, set a base value first then ramp to restore volume
      sound.gain.gain.setValueAtTime(0.001, now)
      sound.gain.gain.exponentialRampToValueAtTime(0.5, now + 0.1)
    }
  }

  unmute(id: string, x: number, y: number) {
    const sound = this.sounds.get(id)
    if (!sound) return

    const now = this.ctx.currentTime

    // Calculate distance from center (listener position)
    const distance = Math.sqrt(x * x + y * y)

    // Physics: Inverse square law for volume attenuation
    const volume = Math.max(0.1, 1 / (1 + distance * 0.3))

    // First set a minimum value, then ramp to target volume
    sound.gain.gain.setValueAtTime(0.01, now)
    sound.gain.gain.linearRampToValueAtTime(volume, now + 0.1)
  }

  setMasterVolume(volume: number) {
    const now = this.ctx.currentTime
    this.masterVolumeGain.gain.setValueAtTime(volume, now)
  }
}
