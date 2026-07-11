import { ANIMAL_SPEED } from '../constants';
import { Rect } from '../engine/collision';
import { DialogContent } from '../events';
import { Animator, drawFrame, Spritesheet } from '../engine/spritesheet';
import { Entity, WorldApi } from './entity';

// Pen animal representing a hobby: wanders lazily inside its pen rect.
export class Animal implements Entity {
  w = 12;
  h = 8;
  solid = true;
  private anim = new Animator(2, 4);
  private moving = false;
  private flip = false;
  private target: { x: number; y: number } | null = null;
  private restTime: number;

  constructor(
    public x: number,
    public y: number,
    private sheet: Spritesheet,
    private pen: Rect,
    public interactPrompt: string,
    private content: DialogContent,
    private sound?: () => void,
  ) {
    this.restTime = 1 + Math.random() * 3;
  }

  interact(world: WorldApi): void {
    this.sound?.();
    world.events.emit({ type: 'openDialog', content: this.content });
  }

  update(dt: number): void {
    this.moving = false;
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1.5) {
        this.target = null;
        this.restTime = 2 + Math.random() * 4;
      } else {
        const step = Math.min(ANIMAL_SPEED * dt, dist);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.moving = true;
        if (dx !== 0) this.flip = dx < 0;
      }
    } else {
      this.restTime -= dt;
      if (this.restTime <= 0) {
        this.target = {
          x: this.pen.x + Math.random() * (this.pen.w - this.w),
          y: this.pen.y + Math.random() * (this.pen.h - this.h),
        };
      }
    }
    this.anim.update(dt, this.moving);
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const drawX = this.x - (this.sheet.frameW - this.w) / 2 - camX;
    const drawY = this.y + this.h - this.sheet.frameH - camY;
    if (this.flip) {
      ctx.save();
      ctx.translate(Math.floor(drawX) + this.sheet.frameW, Math.floor(drawY));
      ctx.scale(-1, 1);
      drawFrame(ctx, this.sheet, 0, this.moving ? this.anim.col : 0, 0, 0);
      ctx.restore();
    } else {
      drawFrame(ctx, this.sheet, 0, this.moving ? this.anim.col : 0, drawX, drawY);
    }
  }
}
