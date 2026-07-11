import { DialogContent } from '../events';
import { Animator, drawFrame, Spritesheet } from '../engine/spritesheet';
import { Dir, Entity, WorldApi, entityCenter } from './entity';

const DIR_ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };

// Stationary character that faces the player when nearby and talks on interact.
export class Npc implements Entity {
  w = 10;
  h = 8;
  solid = true;
  facing: Dir = 'down';
  private anim = new Animator(3, 3);

  constructor(
    public x: number,
    public y: number,
    private sheet: Spritesheet,
    public interactPrompt: string,
    private content: DialogContent,
  ) {}

  interact(world: WorldApi): void {
    world.events.emit({ type: 'openDialog', content: this.content });
  }

  update(dt: number, world: WorldApi): void {
    const { cx, cy } = entityCenter(this);
    const dx = world.playerX - cx;
    const dy = world.playerY - cy;
    if (Math.hypot(dx, dy) < 40) {
      if (Math.abs(dx) >= Math.abs(dy)) this.facing = dx < 0 ? 'left' : 'right';
      else this.facing = dy < 0 ? 'up' : 'down';
    }
    this.anim.update(dt, false);
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const drawX = this.x - (this.sheet.frameW - this.w) / 2 - camX;
    const drawY = this.y + this.h - this.sheet.frameH - camY;
    drawFrame(ctx, this.sheet, DIR_ROW[this.facing], 0, drawX, drawY);
  }
}
