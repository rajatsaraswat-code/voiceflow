/**
 * ElevenLabs Voice Studio - Application Controller
 */

import { ELEVENLABS_MODELS, PRESET_VOICES, SAMPLE_PROMPTS, DEFAULT_VOICE_SETTINGS } from './config.js';
import { ElevenLabsService } from './elevenlabs.js';
import { AudioVisualizer } from './visualizer.js';

class VoiceStudioApp {
  constructor() {
    this.service = new ElevenLabsService();
    this.currentAudioUrl = null;
    this.currentBlob = null;
    this.currentGeneration = null;
    this.history = [];
    this.voiceSettings = { ...DEFAULT_VOICE_SETTINGS };

    this.initElements();
    this.initAudioVisualizer();
    this.populateModels();
    this.populateVoices();
    this.renderPromptChips();
    this.initEventListeners();
    this.updateApiKeyStatus();
    this.updateTextCounters();
    this.loadHistoryFromStorage();
  }

  initElements() {
    // Top Bar
    this.apiKeyBtn = document.getElementById('apiKeyBtn');
    this.apiKeyStatusDot = document.getElementById('apiKeyStatusDot');
    this.apiKeyStatusText = document.getElementById('apiKeyStatusText');

    // Text Section
    this.textInput = document.getElementById('textInput');
    this.charCountEl = document.getElementById('charCount');
    this.wordCountEl = document.getElementById('wordCount');
    this.readTimeEl = document.getElementById('readTime');
    this.clearTextBtn = document.getElementById('clearTextBtn');
    this.pasteTextBtn = document.getElementById('pasteTextBtn');
    this.promptChipsContainer = document.getElementById('promptChips');

    // Dropdowns
    this.modelSelect = document.getElementById('modelSelect');
    this.modelBadgeInfo = document.getElementById('modelBadgeInfo');
    this.voiceSelect = document.getElementById('voiceSelect');
    this.voiceBadgeInfo = document.getElementById('voiceBadgeInfo');
    this.refreshVoicesBtn = document.getElementById('refreshVoicesBtn');

    // Play & Hero Actions
    this.playHeroBtn = document.getElementById('playHeroBtn');
    this.playBtnText = document.getElementById('playBtnText');

    // Audio & Player Elements
    this.audioElement = document.getElementById('mainAudio');
    this.canvas = document.getElementById('audioVisualizer');
    this.visualizerIndicator = document.getElementById('visualizerIndicator');
    this.visualizerStatusText = document.getElementById('visualizerStatusText');

    // Playback Controls
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.playPauseIcon = document.getElementById('playPauseIcon');
    this.seekBar = document.getElementById('seekBar');
    this.currentTimeEl = document.getElementById('currentTime');
    this.totalDurationEl = document.getElementById('totalDuration');
    this.speedSelect = document.getElementById('speedSelect');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.downloadBtn = document.getElementById('downloadBtn');

    // Tuning Sliders
    this.stabilitySlider = document.getElementById('stabilitySlider');
    this.stabilityVal = document.getElementById('stabilityVal');
    this.similaritySlider = document.getElementById('similaritySlider');
    this.similarityVal = document.getElementById('similarityVal');
    this.styleSlider = document.getElementById('styleSlider');
    this.styleVal = document.getElementById('styleVal');
    this.speakerBoostToggle = document.getElementById('speakerBoostToggle');

    // History
    this.historyList = document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // API Key Modal
    this.apiKeyModal = document.getElementById('apiKeyModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.toggleKeyVisibilityBtn = document.getElementById('toggleKeyVisibilityBtn');
    this.saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    this.removeApiKeyBtn = document.getElementById('removeApiKeyBtn');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  initAudioVisualizer() {
    this.visualizer = new AudioVisualizer(this.canvas, this.audioElement);
  }

  populateModels() {
    this.modelSelect.innerHTML = '';
    ELEVENLABS_MODELS.forEach((model, index) => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} (${model.tag})`;
      if (index === 0) option.selected = true;
      this.modelSelect.appendChild(option);
    });

    this.updateModelDescription();
  }

  updateModelDescription() {
    const selectedId = this.modelSelect.value;
    const model = ELEVENLABS_MODELS.find(m => m.id === selectedId) || ELEVENLABS_MODELS[0];
    this.modelBadgeInfo.innerHTML = `
      <span class="tag">${model.category}</span>
      <span>${model.languages} Languages</span> &bull;
      <span>${model.latency}</span>
    `;
  }

  populateVoices(customVoices = []) {
    this.voiceSelect.innerHTML = '';

    // If custom voices exist from user account
    if (customVoices.length > 0) {
      const customGroup = document.createElement('optgroup');
      customGroup.label = 'My Account Voices';
      customVoices.forEach(voice => {
        const opt = document.createElement('option');
        opt.value = voice.voice_id;
        opt.textContent = `${voice.name} (${voice.category || 'Cloned'})`;
        customGroup.appendChild(opt);
      });
      this.voiceSelect.appendChild(customGroup);
    }

    // Default curated voices
    const curatedGroup = document.createElement('optgroup');
    curatedGroup.label = 'Curated ElevenLabs Voices';
    PRESET_VOICES.forEach(voice => {
      const opt = document.createElement('option');
      opt.value = voice.voice_id;
      opt.textContent = `${voice.name} — ${voice.gender}, ${voice.accent} (${voice.style})`;
      curatedGroup.appendChild(opt);
    });
    this.voiceSelect.appendChild(curatedGroup);

    this.updateVoiceDescription();
  }

  updateVoiceDescription() {
    const selectedId = this.voiceSelect.value;
    const preset = PRESET_VOICES.find(v => v.voice_id === selectedId);
    if (preset) {
      this.voiceBadgeInfo.textContent = `Recommended for: ${preset.recommendedFor}`;
    } else {
      this.voiceBadgeInfo.textContent = 'Account Voice selected';
    }
  }

  renderPromptChips() {
    this.promptChipsContainer.innerHTML = '';
    SAMPLE_PROMPTS.forEach(prompt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'prompt-chip';
      chip.innerHTML = `<span>✨</span> ${prompt.title}`;
      chip.addEventListener('click', () => {
        this.textInput.value = prompt.text;
        this.updateTextCounters();
        this.showToast(`Loaded "${prompt.title}" sample prompt`, 'info');
      });
      this.promptChipsContainer.appendChild(chip);
    });
  }

  initEventListeners() {
    // Text Input Events
    this.textInput.addEventListener('input', () => this.updateTextCounters());
    
    this.clearTextBtn.addEventListener('click', () => {
      this.textInput.value = '';
      this.updateTextCounters();
      this.textInput.focus();
    });

    this.pasteTextBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.textInput.value = text;
          this.updateTextCounters();
          this.showToast('Pasted from clipboard!', 'success');
        }
      } catch (err) {
        this.showToast('Please press Ctrl+V to paste', 'info');
      }
    });

    // Dropdowns
    this.modelSelect.addEventListener('change', () => this.updateModelDescription());
    this.voiceSelect.addEventListener('change', () => this.updateVoiceDescription());

    // Refresh Voices Button
    if (this.refreshVoicesBtn) {
      this.refreshVoicesBtn.addEventListener('click', () => this.handleRefreshVoices());
    }

    // Play Hero Button
    this.playHeroBtn.addEventListener('click', () => this.handleGenerateAndPlay());

    // Audio Element Events
    this.audioElement.addEventListener('timeupdate', () => this.handleAudioTimeUpdate());
    this.audioElement.addEventListener('loadedmetadata', () => this.handleAudioMetadataLoaded());
    this.audioElement.addEventListener('play', () => this.handleAudioPlayState(true));
    this.audioElement.addEventListener('pause', () => this.handleAudioPlayState(false));
    this.audioElement.addEventListener('ended', () => this.handleAudioPlayState(false));

    // Player Controls
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.seekBar.addEventListener('input', (e) => this.handleSeek(e));
    this.speedSelect.addEventListener('change', (e) => {
      this.audioElement.playbackRate = parseFloat(e.target.value);
    });
    this.volumeSlider.addEventListener('input', (e) => {
      this.audioElement.volume = parseFloat(e.target.value);
    });
    this.downloadBtn.addEventListener('click', () => this.handleDownloadAudio());

    // Tuning Sliders
    this.stabilitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.voiceSettings.stability = val;
      this.stabilityVal.textContent = `${Math.round(val * 100)}%`;
    });

    this.similaritySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.voiceSettings.similarity_boost = val;
      this.similarityVal.textContent = `${Math.round(val * 100)}%`;
    });

    this.styleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.voiceSettings.style = val;
      this.styleVal.textContent = `${Math.round(val * 100)}%`;
    });

    this.speakerBoostToggle.addEventListener('change', (e) => {
      this.voiceSettings.use_speaker_boost = e.target.checked;
    });

    // API Key Modal
    this.apiKeyBtn.addEventListener('click', () => this.openApiKeyModal());
    this.closeModalBtn.addEventListener('click', () => this.closeApiKeyModal());
    this.apiKeyModal.addEventListener('click', (e) => {
      if (e.target === this.apiKeyModal) this.closeApiKeyModal();
    });

    this.toggleKeyVisibilityBtn.addEventListener('click', () => {
      const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
      this.apiKeyInput.type = type;
    });

    this.saveApiKeyBtn.addEventListener('click', () => {
      const key = this.apiKeyInput.value.trim();
      this.service.setApiKey(key);
      this.updateApiKeyStatus();
      this.closeApiKeyModal();
      this.showToast(key ? 'ElevenLabs API Key saved!' : 'API Key cleared', 'success');
      if (key) {
        this.handleRefreshVoices();
      }
    });

    this.removeApiKeyBtn.addEventListener('click', () => {
      this.service.setApiKey('');
      this.apiKeyInput.value = '';
      this.updateApiKeyStatus();
      this.closeApiKeyModal();
      this.showToast('API Key removed', 'info');
    });

    // Clear History Button
    this.clearHistoryBtn.addEventListener('click', () => {
      this.history = [];
      this.saveHistoryToStorage();
      this.renderHistory();
      this.showToast('Audio history cleared', 'info');
    });
  }

  updateTextCounters() {
    const text = this.textInput.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Average speech rate is roughly 140-150 words per minute (~2.4 words/sec)
    const estimatedSeconds = Math.ceil(words / 2.4);
    const estTimeStr = estimatedSeconds > 60 
      ? `~${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`
      : `~${estimatedSeconds}s`;

    this.charCountEl.textContent = chars.toLocaleString();
    this.wordCountEl.textContent = words.toLocaleString();
    this.readTimeEl.textContent = words > 0 ? estTimeStr : '0s';
  }

  updateApiKeyStatus() {
    const hasKey = this.service.hasApiKey();
    if (hasKey) {
      this.apiKeyStatusDot.classList.add('active');
      this.apiKeyStatusText.textContent = 'API Key Configured';
      this.apiKeyInput.value = this.service.getApiKey();
    } else {
      this.apiKeyStatusDot.classList.remove('active');
      this.apiKeyStatusText.textContent = 'Configure API Key';
      this.apiKeyInput.value = '';
    }
  }

  openApiKeyModal() {
    this.apiKeyModal.classList.add('open');
    this.apiKeyInput.focus();
  }

  closeApiKeyModal() {
    this.apiKeyModal.classList.remove('open');
  }

  async handleRefreshVoices() {
    if (!this.service.hasApiKey()) {
      this.showToast('Please configure your API key first to fetch account voices', 'info');
      return;
    }

    try {
      this.showToast('Fetching your ElevenLabs voices...', 'info');
      const voices = await this.service.fetchAccountVoices();
      if (voices && voices.length > 0) {
        this.populateVoices(voices);
        this.showToast(`Loaded ${voices.length} voices from ElevenLabs!`, 'success');
      } else {
        this.showToast('Loaded curated voices', 'info');
      }
    } catch (err) {
      this.showToast('Could not fetch voices: ' + err.message, 'error');
    }
  }

  async handleGenerateAndPlay() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.showToast('Please enter or paste text to narrate', 'error');
      this.textInput.focus();
      return;
    }

    const voiceId = this.voiceSelect.value;
    const modelId = this.modelSelect.value;
    const voiceName = this.voiceSelect.options[this.voiceSelect.selectedIndex].text.split('—')[0].trim();
    const modelName = this.modelSelect.options[this.modelSelect.selectedIndex].text.split('(')[0].trim();

    // If user has not configured API Key, prompt them or offer demo
    if (!this.service.hasApiKey()) {
      const proceedWithDemo = confirm(
        'No ElevenLabs API Key configured yet!\n\n' +
        'Would you like to:\n' +
        '• Click OK to preview with Web Speech Synthesis (Demo Mode)\n' +
        '• Click Cancel to enter your ElevenLabs API Key for authentic AI voices'
      );

      if (!proceedWithDemo) {
        this.openApiKeyModal();
        return;
      }

      // Demo speech playback
      try {
        this.setPlayButtonLoading(true, 'Speaking Demo Voice...');
        this.visualizerIndicator.classList.add('playing');
        this.visualizerStatusText.textContent = 'Playing Demo Voice';
        await this.service.synthesizeDemoSpeech(text, voiceName);
        this.showToast('Finished demo speech! Add your ElevenLabs key for authentic AI narration.', 'info');
      } catch (err) {
        this.showToast(err.message, 'error');
      } finally {
        this.setPlayButtonLoading(false);
        this.visualizerIndicator.classList.remove('playing');
        this.visualizerStatusText.textContent = 'Visualizer Ready';
      }
      return;
    }

    // ElevenLabs API Synthesis
    try {
      this.setPlayButtonLoading(true, 'Synthesizing with ElevenLabs...');
      this.visualizerStatusText.textContent = 'Synthesizing Audio...';

      const result = await this.service.synthesizeSpeech({
        text,
        voiceId,
        modelId,
        voiceSettings: this.voiceSettings
      });

      // Cleanup old URL
      if (this.currentAudioUrl) {
        URL.revokeObjectURL(this.currentAudioUrl);
      }

      this.currentAudioUrl = result.audioUrl;
      this.currentBlob = result.blob;
      this.audioElement.src = result.audioUrl;

      // Autoplay
      await this.audioElement.play();
      this.visualizer.setPlaying(true);
      this.showToast('Audio generated successfully!', 'success');

      // Add to generation history
      const historyItem = {
        id: Date.now(),
        text,
        voiceName,
        modelName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioUrl: result.audioUrl,
        blob: result.blob
      };
      this.addHistoryItem(historyItem);

    } catch (err) {
      console.error(err);
      this.showToast(err.message, 'error');
    } finally {
      this.setPlayButtonLoading(false);
    }
  }

  setPlayButtonLoading(loading, label = 'Synthesizing Audio...') {
    if (loading) {
      this.playHeroBtn.disabled = true;
      this.playHeroBtn.classList.add('loading');
      this.playBtnText.textContent = label;
    } else {
      this.playHeroBtn.disabled = false;
      this.playHeroBtn.classList.remove('loading');
      this.playBtnText.textContent = 'Generate & Play Narration';
    }
  }

  togglePlayPause() {
    if (!this.audioElement.src) {
      if (this.textInput.value.trim()) {
        this.handleGenerateAndPlay();
      } else {
        this.showToast('Enter text and click Generate & Play', 'info');
      }
      return;
    }

    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  handleAudioPlayState(isPlaying) {
    this.visualizer.setPlaying(isPlaying);

    if (isPlaying) {
      this.visualizerIndicator.classList.add('playing');
      this.visualizerStatusText.textContent = 'Live Audio Spectrum';
      this.playPauseIcon.innerHTML = `
        <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
        <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
      `;
    } else {
      this.visualizerIndicator.classList.remove('playing');
      this.visualizerStatusText.textContent = 'Visualizer Paused';
      this.playPauseIcon.innerHTML = `
        <polygon points="5,3 19,12 5,21" fill="currentColor"></polygon>
      `;
    }
  }

  handleAudioMetadataLoaded() {
    const duration = this.audioElement.duration || 0;
    this.totalDurationEl.textContent = this.formatTime(duration);
    this.seekBar.max = Math.floor(duration);
    this.seekBar.value = 0;
  }

  handleAudioTimeUpdate() {
    const cur = this.audioElement.currentTime || 0;
    const dur = this.audioElement.duration || 0;
    this.currentTimeEl.textContent = this.formatTime(cur);
    this.seekBar.value = Math.floor(cur);

    if (dur && !isNaN(dur)) {
      this.totalDurationEl.textContent = this.formatTime(dur);
    }
  }

  handleSeek(e) {
    const targetTime = parseFloat(e.target.value);
    this.audioElement.currentTime = targetTime;
  }

  handleDownloadAudio() {
    if (!this.currentBlob && !this.audioElement.src) {
      this.showToast('No audio generated yet to download', 'info');
      return;
    }

    const voiceName = this.voiceSelect.options[this.voiceSelect.selectedIndex].text.split('—')[0].trim();
    const a = document.createElement('a');
    a.href = this.audioElement.src;
    a.download = `elevenlabs_${voiceName.toLowerCase()}_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast('Downloading narration audio...', 'success');
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // History Management
  addHistoryItem(item) {
    this.history.unshift(item);
    if (this.history.length > 20) {
      this.history.pop();
    }
    this.renderHistory();
    this.saveHistoryToStorage();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<div class="empty-history">No generations yet. Synthesized clips will appear here.</div>';
      return;
    }

    this.historyList.innerHTML = '';
    this.history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <div class="history-info">
          <div class="history-text" title="${this.escapeHtml(item.text)}">${this.escapeHtml(item.text)}</div>
          <div class="history-meta">
            <span><strong>${this.escapeHtml(item.voiceName)}</strong></span>
            <span>&bull;</span>
            <span>${this.escapeHtml(item.modelName)}</span>
            <span>&bull;</span>
            <span>${item.timestamp}</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn-icon-tiny history-play-btn" title="Replay">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          </button>
        </div>
      `;

      const playBtn = row.querySelector('.history-play-btn');
      playBtn.addEventListener('click', () => {
        if (item.audioUrl) {
          this.audioElement.src = item.audioUrl;
          this.audioElement.play();
          this.showToast(`Replaying "${item.voiceName}" clip`, 'info');
        }
      });

      this.historyList.appendChild(row);
    });
  }

  saveHistoryToStorage() {
    try {
      const serializable = this.history.map(item => ({
        id: item.id,
        text: item.text,
        voiceName: item.voiceName,
        modelName: item.modelName,
        timestamp: item.timestamp
      }));
      localStorage.setItem('elevenlabs_history', JSON.stringify(serializable));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('elevenlabs_history');
      if (stored) {
        this.history = JSON.parse(stored);
        this.renderHistory();
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✨';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOutToast 0.3s forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.voiceStudioApp = new VoiceStudioApp();
});
