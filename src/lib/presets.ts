export interface Preset {
  id: string
  name: string
  emoji: string
  description: string
  sounds: Array<{
    id: string
    position: [number, number]
    volume: number
  }>
  effects: {
    reverb: number
    delay: number
    delayTime: number
    delayFeedback: number
  }
  lofi: boolean
}

export const PRESETS: Preset[] = [
  {
    id: "cozy-rain",
    name: "Cozy Rain",
    emoji: "🌧️☕",
    description: "Rain against the window with warm cafe ambience",
    sounds: [
      { id: "rain", position: [-2, 1], volume: 0.8 },
      { id: "cafe", position: [2, -1], volume: 0.6 },
      { id: "vinyl", position: [0, 3], volume: 0.4 },
    ],
    effects: {
      reverb: 0.3,
      delay: 0.1,
      delayTime: 0.25,
      delayFeedback: 0.3,
    },
    lofi: true,
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    emoji: "☕📀",
    description: "Busy cafe with vinyl music in the background",
    sounds: [
      { id: "cafe", position: [0, 0], volume: 0.9 },
      { id: "vinyl", position: [3, 2], volume: 0.5 },
      { id: "rain", position: [-4, -3], volume: 0.2 },
    ],
    effects: {
      reverb: 0.5,
      delay: 0.2,
      delayTime: 0.35,
      delayFeedback: 0.4,
    },
    lofi: false,
  },
  {
    id: "late-night",
    name: "Late Night",
    emoji: "🌙📀",
    description: "Quiet vinyl session for focus",
    sounds: [
      { id: "vinyl", position: [0, 0], volume: 0.7 },
      { id: "rain", position: [-5, 2], volume: 0.3 },
      { id: "cafe", position: [5, -2], volume: 0.1 },
    ],
    effects: {
      reverb: 0.6,
      delay: 0.3,
      delayTime: 0.4,
      delayFeedback: 0.5,
    },
    lofi: true,
  },
  {
    id: "stormy",
    name: "Stormy Night",
    emoji: "⛈️🌧️",
    description: "Heavy rain with distant thunder vibes",
    sounds: [
      { id: "rain", position: [0, 0], volume: 1.0 },
      { id: "cafe", position: [4, 3], volume: 0.2 },
      { id: "vinyl", position: [-4, 3], volume: 0.3 },
    ],
    effects: {
      reverb: 0.7,
      delay: 0.4,
      delayTime: 0.5,
      delayFeedback: 0.6,
    },
    lofi: false,
  },
  {
    id: "study-session",
    name: "Study Session",
    emoji: "📚☕",
    description: "Balanced ambience for focused work",
    sounds: [
      { id: "rain", position: [-3, 2], volume: 0.5 },
      { id: "cafe", position: [3, 2], volume: 0.5 },
      { id: "vinyl", position: [0, -3], volume: 0.4 },
    ],
    effects: {
      reverb: 0.2,
      delay: 0.05,
      delayTime: 0.2,
      delayFeedback: 0.2,
    },
    lofi: false,
  },
]
