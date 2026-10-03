/**
 * ElevenLabs API Service
 * Handles audio generation, model queries, voice fetching, and fallback demo speech
 */

export class ElevenLabsService {
  constructor() {
    this.storageKey = 'elevenlabs_api_key';
    this.apiKey = localStorage.getItem(this.storageKey) || 'sk_d05a1c15871ae53ce3d6307d94024af1f156bcd77fedef0d';
  }

  getApiKey() {
    return this.apiKey;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem(this.storageKey, this.apiKey);
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  getProxyBaseUrl() {
    // If running over HTTP/HTTPS, use origin relative path
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return '';
    }
    // When opened directly as a local file (file:///), connect to local python server
    return 'http://localhost:8000';
  }

  async safeExtractErrorMessage(response) {
    try {
      // Read body stream once as text
      const rawText = await response.text();
      try {
        const errJson = JSON.parse(rawText);
        return errJson.detail?.message || errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        return rawText || `HTTP ${response.status} ${response.statusText}`;
      }
    } catch {
      return `HTTP ${response.status} ${response.statusText}`;
    }
  }

  /**
   * Synthesize text using ElevenLabs API
   */
  async synthesizeSpeech({
    text,
    voiceId,
    modelId = 'eleven_multilingual_v2',
    voiceSettings = {}
  }) {
    if (!text || !text.trim()) {
      throw new Error('Please enter some text to narrate.');
    }

    if (!voiceId) {
      throw new Error('Please select a voice for narration.');
    }

    const requestHeaders = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      requestHeaders['xi-api-key'] = this.apiKey;
    }

    const requestPayload = {
      text: text.trim(),
      model_id: modelId,
      voice_settings: {
        stability: voiceSettings.stability ?? 0.5,
        similarity_boost: voiceSettings.similarity_boost ?? 0.75,
        style: voiceSettings.style ?? 0.0,
        use_speaker_boost: voiceSettings.use_speaker_boost ?? true
      }
    };

    const proxyBase = this.getProxyBaseUrl();
    const proxyEndpoint = `${proxyBase}/api/tts?voice_id=${encodeURIComponent(voiceId)}`;
    const directEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    let response;
    let usedDirect = false;

    try {
      response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestPayload)
      });
    } catch (proxyErr) {
      // If proxy is unreachable (e.g. server is down), fall back to direct ElevenLabs API
      console.warn('Proxy unreachable, attempting direct ElevenLabs call:', proxyErr);
      usedDirect = true;
      try {
        response = await fetch(directEndpoint, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestPayload)
        });
      } catch (directErr) {
        throw new Error(
          'Network connection error: Unable to reach ElevenLabs API or local server. ' +
          'Please ensure the server is running with run.bat or python server.py.'
        );
      }
    }

    // If proxy returned 404 or failed, try direct if not already tried
    if (!response.ok && !usedDirect && (response.status === 404 || response.status === 502)) {
      try {
        response = await fetch(directEndpoint, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestPayload)
        });
      } catch (err) {
        console.warn('Direct fallback failed:', err);
      }
    }

    if (!response.ok) {
      const errorDetail = await this.safeExtractErrorMessage(response);

      if (response.status === 401) {
        throw new Error('Invalid or missing ElevenLabs API key. Please verify your API key in Settings.');
      } else if (response.status === 429) {
        throw new Error('ElevenLabs quota exceeded or rate limit reached. Please check your account credits.');
      } else {
        throw new Error(errorDetail || `ElevenLabs API error (HTTP ${response.status})`);
      }
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioUrl,
      blob: audioBlob,
      isDemo: false
    };
  }

  /**
   * Fetch user's custom and library voices from ElevenLabs
   */
  async fetchAccountVoices() {
    const headers = {};
    if (this.apiKey) {
      headers['xi-api-key'] = this.apiKey;
    }

    const proxyBase = this.getProxyBaseUrl();
    try {
      let response = await fetch(`${proxyBase}/api/voices`, { headers });
      if (!response.ok) {
        response = await fetch('https://api.elevenlabs.io/v1/voices', { headers });
      }
      if (!response.ok) return [];
      const data = await response.json();
      return data.voices || [];
    } catch (e) {
      console.warn('Could not fetch account voices:', e);
      return [];
    }
  }

  /**
   * Fetch available models from ElevenLabs
   */
  async fetchAccountModels() {
    const headers = {};
    if (this.apiKey) {
      headers['xi-api-key'] = this.apiKey;
    }

    const proxyBase = this.getProxyBaseUrl();
    try {
      let response = await fetch(`${proxyBase}/api/models`, { headers });
      if (!response.ok) {
        response = await fetch('https://api.elevenlabs.io/v1/models', { headers });
      }
      if (!response.ok) return [];
      const data = await response.json();
      return data || [];
    } catch (e) {
      console.warn('Could not fetch models:', e);
      return [];
    }
  }

  /**
   * Browser Web Speech fallback for immediate preview/testing
   */
  synthesizeDemoSpeech(text, voiceName = 'George') {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser speech synthesis is not supported in this browser.'));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const match = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase())) ||
                      voices.find(v => v.lang.startsWith('en')) ||
                      voices[0];
        if (match) utterance.voice = match;
      }

      utterance.onend = () => {
        resolve({ isDemo: true, finished: true });
      };

      utterance.onerror = (e) => {
        reject(new Error('Speech playback error: ' + (e.error || 'unknown')));
      };

      window.speechSynthesis.speak(utterance);
      resolve({ isDemo: true, utterance });
    });
  }
}
