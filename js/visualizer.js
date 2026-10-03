/**
 * Canvas-based Real-time Wave & Spectrum Audio Visualizer
 */

export class AudioVisualizer {
  constructor(canvasElement, audioElement) {
    this.canvas = canvasElement;
    this.audio = audioElement;
    this.ctx = canvasElement.getContext('2d');
    
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.isPlaying = false;
    this.animationId = null;
    
    this.idlePhase = 0;
    this.idleSpeed = 0.03;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
    
    // Start ambient idle animation immediately
    this.animate();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  setupAudioContext() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Note: createMediaElementSource can only be called once per audio element
      this.source = this.audioCtx.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
    } catch (e) {
      console.warn('Web Audio API setup error or already bound:', e);
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setPlaying(playing) {
    this.isPlaying = playing;
    if (playing) {
      this.setupAudioContext();
      this.resumeContext();
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.draw();
  }

  draw() {
    const { width, height, ctx } = this;
    if (!width || !height) return;

    ctx.clearRect(0, 0, width, height);

    if (this.isPlaying && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.drawSpectrumBars();
    } else {
      this.drawIdleWave();
    }
  }

  drawSpectrumBars() {
    const { width, height, ctx, dataArray } = this;
    const barCount = 48;
    const barWidth = (width / barCount) - 3;
    const halfHeight = height / 2;

    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#a855f7');
    gradient.addColorStop(1, '#06b6d4');

    for (let i = 0; i < barCount; i++) {
      // Sample logarithmic bins for more visually appealing voice activity
      const sampleIndex = Math.floor(Math.pow(i / barCount, 1.4) * (dataArray.length - 1));
      const val = dataArray[sampleIndex] || 0;
      const barHeight = Math.max(4, (val / 255) * (height - 16));

      const x = i * (barWidth + 3) + 2;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
      ctx.shadowBlur = 8;

      // Draw rounded pill bar
      this.drawRoundedRect(ctx, x, y, barWidth, barHeight, barWidth / 2);
    }
    ctx.shadowBlur = 0;
  }

  drawIdleWave() {
    const { width, height, ctx } = this;
    this.idlePhase += this.idleSpeed;

    const centerY = height / 2;
    const points = 60;
    const step = width / points;

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      // Gentle ambient dual sine wave
      const wave1 = Math.sin((i * 0.15) + this.idlePhase) * 6;
      const wave2 = Math.cos((i * 0.08) - (this.idlePhase * 0.7)) * 4;
      const y = centerY + wave1 + wave2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius * 2) radius = height / 2;
    if (width < radius * 2) radius = width / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }
}
