const FALLBACK_COLORS = ['#fd7d99', '#83bffd', '#68d4a5', '#7e6394'];

function toRgba(hex, alpha) {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255}, ${alpha})`;
}

export class Gradient {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.frameId = null;
    this.width = 0;
    this.height = 0;
    this.colors = FALLBACK_COLORS;
    this.reducedMotionQuery = null;
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleMotionChange = this.handleMotionChange.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
  }

  initGradient(selector) {
    this.destroy();
    const canvas = document.querySelector(selector);
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    this.canvas = canvas;
    this.context = context;
    const styles = window.getComputedStyle(canvas);
    this.colors = FALLBACK_COLORS.map((fallback, index) => (
      styles.getPropertyValue(`--gradient-color-${index + 1}`).trim() || fallback
    ));
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.reducedMotionQuery.addEventListener('change', this.handleMotionChange);

    this.handleResize();
    this.updatePlayback();
  }

  handleResize() {
    if (!this.canvas || !this.context) return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(0);
  }

  handleVisibilityChange() {
    this.updatePlayback();
  }

  handleMotionChange() {
    this.updatePlayback();
  }

  updatePlayback() {
    if (!this.canvas) return;
    this.stop();

    const shouldAnimate = !document.hidden && !this.reducedMotionQuery?.matches;
    this.canvas.dataset.gradientState = shouldAnimate ? 'active' : 'static';
    if (shouldAnimate) {
      this.frameId = window.requestAnimationFrame(this.renderFrame);
    } else {
      this.draw(0);
    }
  }

  renderFrame(time) {
    this.draw(time);
    this.frameId = window.requestAnimationFrame(this.renderFrame);
  }

  draw(time) {
    if (!this.context) return;
    const { context, width, height, colors } = this;
    const phase = time * 0.000025;
    const longSide = Math.max(width, height);

    context.globalCompositeOperation = 'source-over';
    context.fillStyle = '#06080d';
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'screen';

    const lights = [
      [0.12 + Math.sin(phase) * 0.08, 0.18 + Math.cos(phase * 0.8) * 0.07, 0.82, colors[0], 0.62],
      [0.88 + Math.cos(phase * 0.7) * 0.08, 0.25 + Math.sin(phase * 0.9) * 0.09, 0.78, colors[1], 0.58],
      [0.72 + Math.sin(phase * 0.6 + 2.1) * 0.1, 0.86 + Math.cos(phase * 0.75) * 0.08, 0.86, colors[2], 0.5],
      [0.22 + Math.cos(phase * 0.65 + 1.3) * 0.09, 0.74 + Math.sin(phase * 0.7 + 0.8) * 0.08, 0.76, colors[3], 0.56],
    ];

    lights.forEach(([x, y, radiusScale, color, alpha]) => {
      const radius = longSide * radiusScale;
      const gradient = context.createRadialGradient(
        width * x,
        height * y,
        0,
        width * x,
        height * y,
        radius,
      );
      gradient.addColorStop(0, toRgba(color, alpha));
      gradient.addColorStop(0.48, toRgba(color, alpha * 0.34));
      gradient.addColorStop(1, toRgba(color, 0));
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });

    context.globalCompositeOperation = 'source-over';
    context.fillStyle = 'rgba(2, 4, 8, 0.42)';
    context.fillRect(0, 0, width, height);
  }

  stop() {
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.reducedMotionQuery?.removeEventListener('change', this.handleMotionChange);
    if (this.canvas) delete this.canvas.dataset.gradientState;
    this.canvas = null;
    this.context = null;
    this.reducedMotionQuery = null;
  }
}
