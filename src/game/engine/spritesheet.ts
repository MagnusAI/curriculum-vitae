// Sprite sheets are horizontal-strip-per-row images: each row is one
// animation/direction, each column one frame.
export interface Spritesheet {
  image: CanvasImageSource;
  frameW: number;
  frameH: number;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  sheet: Spritesheet,
  row: number,
  col: number,
  x: number,
  y: number,
): void {
  ctx.drawImage(
    sheet.image,
    col * sheet.frameW,
    row * sheet.frameH,
    sheet.frameW,
    sheet.frameH,
    Math.floor(x),
    Math.floor(y),
    sheet.frameW,
    sheet.frameH,
  );
}

// Cycles through `frames` columns at `fps` while playing.
export class Animator {
  private time = 0;
  col = 0;

  constructor(
    private frames: number,
    private fps: number,
  ) {}

  update(dt: number, playing: boolean): void {
    if (!playing) {
      this.time = 0;
      this.col = 0;
      return;
    }
    this.time += dt;
    this.col = Math.floor(this.time * this.fps) % this.frames;
  }
}
