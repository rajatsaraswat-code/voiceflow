/**
 * Configuration, Models, Curated Voices & Presets for ElevenLabs Voice Studio
 */

export const ELEVENLABS_MODELS = [
  {
    id: 'eleven_multilingual_v2',
    name: 'Eleven Multilingual v2',
    tag: 'Recommended',
    description: 'Most lifelike and versatile model. Supports 29 languages with unmatched emotional depth, tone stability, and nuance.',
    languages: 29,
    latency: 'Standard (~200ms)',
    category: 'Narration & Audiobooks'
  },
  {
    id: 'eleven_flash_v2_5',
    name: 'Eleven Flash v2.5',
    tag: 'Ultra-Fast',
    description: 'Blazing-fast ~75ms response time with high fidelity. Supports 32 languages. Ideal for real-time applications.',
    languages: 32,
    latency: 'Ultra-Low (~75ms)',
    category: 'Real-time & Interactive'
  },
  {
    id: 'eleven_turbo_v2_5',
    name: 'Eleven Turbo v2.5',
    tag: 'High Quality',
    description: 'Super low latency with balanced studio quality across 32 languages. Great for long narrations.',
    languages: 32,
    latency: 'Low (~120ms)',
    category: 'Conversational & Podcasts'
  },
  {
    id: 'eleven_v4',
    name: 'Eleven v4 (Alpha)',
    tag: 'Next-Gen',
    description: 'Next-generation frontier vocal synthesis model with hyper-expressive cadence.',
    languages: 32,
    latency: 'Standard',
    category: 'Expressive Narration'
  },
  {
    id: 'eleven_v4_turbo',
    name: 'Eleven v4 Turbo',
    tag: 'Next-Gen Fast',
    description: 'Next-generation low latency vocal model with enhanced prosody and flow.',
    languages: 32,
    latency: 'Low',
    category: 'Fast Expressive'
  },
  {
    id: 'eleven_turbo_v2',
    name: 'Eleven Turbo v2',
    tag: 'Fast',
    description: 'Fast multilingual speech model optimized for conversational speed.',
    languages: 29,
    latency: 'Low (~150ms)',
    category: 'Conversational'
  },
  {
    id: 'eleven_flash_v2',
    name: 'Eleven Flash v2',
    tag: 'Speed',
    description: 'Cost-effective, lightning-fast generation for English speech.',
    languages: 1,
    latency: 'Ultra-Low (~75ms)',
    category: 'Fast English'
  }
];

export const PRESET_VOICES = [
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    gender: 'Male',
    accent: 'British',
    age: 'Middle Aged',
    style: 'Warm, Captivating Storyteller',
    recommendedFor: 'Audiobooks & Historical Narration'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    gender: 'Female',
    accent: 'American',
    age: 'Mature',
    style: 'Reassuring, Confident, Articulate',
    recommendedFor: 'Explainer & Commercial'
  },
  {
    voice_id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    gender: 'Male',
    accent: 'American',
    age: 'Middle Aged',
    style: 'Laid-Back, Casual, Resonant',
    recommendedFor: 'Conversations & Documentaries'
  },
  {
    voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'Alice',
    gender: 'Female',
    accent: 'British',
    age: 'Middle Aged',
    style: 'Clear, Engaging Educator',
    recommendedFor: 'Educational, Luxury & News'
  },
  {
    voice_id: 'IKne3meq5aSn9XLyUdCD',
    name: 'Charlie',
    gender: 'Male',
    accent: 'Australian',
    age: 'Middle Aged',
    style: 'Deep, Confident, Energetic',
    recommendedFor: 'Podcasts & Action Narration'
  },
  {
    voice_id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    gender: 'Female',
    accent: 'American',
    age: 'Young Adult',
    style: 'Enthusiastic, Quirky, Dynamic',
    recommendedFor: 'Animation & Social Media'
  },
  {
    voice_id: 'SAz9YHcvj6GT2YYXdXww',
    name: 'River',
    gender: 'Non-binary',
    accent: 'American',
    age: 'Young Adult',
    style: 'Relaxed, Neutral, Informative',
    recommendedFor: 'Corporate Voiceovers'
  },
  {
    voice_id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    gender: 'Male',
    accent: 'American',
    age: 'Young',
    style: 'Energetic, Social Media Creator',
    recommendedFor: 'YouTube, TikTok & Promos'
  },
  {
    voice_id: 'SOYHLrjzK2X1ezoPC6cr',
    name: 'Harry',
    gender: 'Male',
    accent: 'American',
    age: 'Young',
    style: 'Fierce, Intense, Dramatic',
    recommendedFor: 'Trailers & Video Games'
  },
  {
    voice_id: 'N2lVS1w4EtoT3dr4eOWO',
    name: 'Callum',
    gender: 'Male',
    accent: 'Transatlantic',
    age: 'Middle Aged',
    style: 'Husky Trickster, Character Voice',
    recommendedFor: 'Fantasy Stories & Characters'
  }
];

export const SAMPLE_PROMPTS = [
  {
    title: 'Epic Fantasy',
    text: 'Beyond the jagged peaks of the Obsidian Spire, an ancient clockwork heart still ticked beneath the ice. The northern winds whispered of a forgotten kingdom waiting to awaken once more.'
  },
  {
    title: 'Tech Documentary',
    text: 'Artificial intelligence is not merely accelerating our computational speed; it is transforming the very architecture of human curiosity, reasoning, and synthetic creativity across the globe.'
  },
  {
    title: 'Meditative Calm',
    text: 'Take a deep, slow breath in through your nose, letting your shoulders gently relax downward. Feel the stillness expand within this moment as the quiet world pauses with you.'
  },
  {
    title: 'Movie Trailer',
    text: 'In a world where memories can be rewritten like code, one detective uncovers a past that was never meant to be remembered. Some truths refuse to stay buried in the dark.'
  }
];

export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.50,
  similarity_boost: 0.75,
  style: 0.00,
  use_speaker_boost: true
};
