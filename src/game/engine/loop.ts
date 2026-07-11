import { FIXED_DT, MAX_FRAME_TIME } from '../constants';

// Fixed-timestep update loop driven by requestAnimationFrame, with a
// setInterval watchdog fallback for environments where rAF is starved
// (hidden/background tabs).
export class Loop {
  private rafId = 0;
  private watchdogId = 0;
  private lastTime = 0;
  private lastStep = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
  ) {}

  private step(now: number): void {
    this.lastStep = now;
    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
    this.accumulator += frameTime;
    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }
    this.render();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.lastStep = this.lastTime;
    this.accumulator = 0;
    const frame = (now: number) => {
      if (!this.running) return;
      this.step(now);
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
    this.watchdogId = window.setInterval(() => {
      const now = performance.now();
      if (now - this.lastStep > 250) this.step(now);
    }, 100);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    clearInterval(this.watchdogId);
  }
}
