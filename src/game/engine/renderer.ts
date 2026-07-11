import { TARGET_VIEW_SHORT } from '../constants';

// Low-resolution backbuffer scaled up to the screen canvas by an integer
// factor so pixels stay crisp at any window size / devicePixelRatio.
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly bctx: CanvasRenderingContext2D;
  private buffer: HTMLCanvasElement;
  scale = 1;
  viewW = TARGET_VIEW_SHORT;
  viewH = TARGET_VIEW_SHORT;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.buffer = document.createElement('canvas');
    const bctx = this.buffer.getContext('2d');
    if (!bctx) throw new Error('2d context unavailable');
    this.bctx = bctx;
    this.resize(canvas.clientWidth || 1, canvas.clientHeight || 1, window.devicePixelRatio || 1);
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));
    this.canvas.width = pxW;
    this.canvas.height = pxH;
    this.scale = Math.max(1, Math.round(Math.min(pxW, pxH) / TARGET_VIEW_SHORT));
    this.viewW = Math.ceil(pxW / this.scale);
    this.viewH = Math.ceil(pxH / this.scale);
    this.buffer.width = this.viewW;
    this.buffer.height = this.viewH;
    this.bctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
  }

  begin(): CanvasRenderingContext2D {
    this.bctx.clearRect(0, 0, this.viewW, this.viewH);
    return this.bctx;
  }

  present(): void {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      this.buffer,
      0,
      0,
      this.viewW * this.scale,
      this.viewH * this.scale,
    );
  }
}
