# 🎙️ ElevenLabs Voice Studio

A text-to-speech web application built with **ElevenLabs Neural Audio Models**.

![ElevenLabs Voice Studio](https://img.shields.io/badge/ElevenLabs-API%20v1-6366f1?style=for-the-badge)
![Audio Engine](https://img.shields.io/badge/Audio-Web%20Audio%20API-10b981?style=for-the-badge)
![Status](https://img.shields.io/badge/Server-Active%20%26%20Ready-06b6d4?style=for-the-badge)

---

## ✨ Features

- 📝 **Custom Script & Text Input**: Paste or type any text content, script, or dialogue. Includes dynamic character count, word count, and estimated narration duration.
- 🤖 **ElevenLabs Model Selector**: Choose from ElevenLabs narration models:
  - `Eleven Multilingual v2` (Recommended — 29 Languages, life-like emotional depth)
  - `Eleven Flash v2.5` (Ultra-low latency ~75ms, 32 Languages)
  - `Eleven Turbo v2.5` (High quality studio balance, 32 Languages)
  - `Eleven v4 & v4 Turbo` (Next-generation expressive vocal prosody)
  - `Eleven Turbo v2` & `Eleven Flash v2`
- 🗣️ **Curated & Account Voices**: Select curated voices (George, Sarah, Roger, Alice, Charlie, Laura, Liam, Harry, Callum, etc.) or sync your custom cloned voices directly from your ElevenLabs account with 1-click.
- ⚡ **Interactive Hero Play Button**: Seamlessly synthesizes speech with animated loading feedback and automatic playback.
- 🌊 **Real-Time Audio Visualizer**: Live canvas-based wave and frequency spectrum analyzer reacting dynamically to audio playback via Web Audio API.
- 🎚️ **Voice Fine-Tuning Drawer**: Sliders for **Stability**, **Clarity/Similarity Boost**, **Style Exaggeration**, and **Speaker Boost**.
- 🎛️ **Full Playback Controls**: Play/Pause, interactive timeline scrubber, playback speeds (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`), volume slider, and one-click **Download MP3** button.
- 📜 **Generation History**: Replay and review previous generations with timestamps, voice names, and models used.
- 🛡️ **Zero-CORS Backend Proxy**: Built-in Python proxy server (`server.py`) that eliminates browser CORS restrictions and secures API key management.

---

## 🚀 Quick Start Guide

### 1. Launch the Server

Double-click **`run.bat`** or run:

```bash
python server.py
```

The server will automatically start at **`http://localhost:8000`** and open in your default browser.

### 2. Enter Your Text & Select Your Model

1. Type or paste your text in the script input box (or click one of the preset prompt chips like *Epic Fantasy*, *Tech Documentary*, or *Movie Trailer*).
2. Choose your preferred model from the **ElevenLabs Model** dropdown.
3. Choose your desired voice from the **Narrator Voice** dropdown.
4. Click **Generate & Play Narration**.
5. Watch the glowing frequency spectrum pulse to the voice and listen to the studio-quality speech!

---

## 🔑 API Key Configuration

Your API key is pre-configured in `.env` and in the frontend. You can also view, update, or remove your key at any time by clicking the **API Key** button in the top navigation bar.

---

## 📁 Project Architecture

```
├── index.html          # Semantic, accessible UI with dark studio aesthetic
├── css/
│   └── style.css       # Obsidian glassmorphism theme, glowing neon accents, responsive layout
├── js/
│   ├── app.js          # Main UI controller & audio player lifecycle
│   ├── elevenlabs.js   # ElevenLabs API client & fallback speech synthesizer
│   ├── visualizer.js   # Web Audio API canvas frequency visualizer
│   └── config.js       # Models metadata, curated voices, sample prompts
├── server.py           # Standard library Python server & CORS-free proxy
├── run.bat             # 1-click Windows launcher
└── .env                # Configured API key
```
