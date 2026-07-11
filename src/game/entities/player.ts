import { PLAYER_SPEED } from '../constants';
import { moveWithCollision } from '../engine/collision';
import { Animator, drawFrame, Spritesheet } from '../engine/spritesheet';
import { Dir, Entity, WorldApi, entityCenter } from './entity';

const DIR_ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };

export class Player implements Entity {
  x = 0;
  y = 0;
  w = 10;
  h = 8;
  facing: Dir = 'down';
  moving = false;
  private anim = new Animator(3, 8);

  constructor(private sheet: Spritesheet) {}

  place(x: number, y: number, facing: Dir): void {
    this.x = x;
    this.y = y;
    this.facing = facing;
  }

  move(dt: number, world: WorldApi, dx: number, dy: number): void {
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      if (Math.abs(dx) >= Math.abs(dy)) this.facing = dx < 0 ? 'left' : 'right';
      else this.facing = dy < 0 ? 'up' : 'down';
      moveWithCollision(this, dx * PLAYER_SPEED * dt, dy * PLAYER_SPEED * dt, world.map, world.solids);
    }
    this.anim.update(dt, this.moving);
  }

  // Point in front of the player used to find interactables.
  probe(): { x: number; y: number } {
    const { cx, cy } = entityCenter(this);
    const reach = 14;
    switch (this.facing) {
      case 'down':
        return { x: cx, y: cy + reach };
      case 'up':
        return { x: cx, y: cy - reach };
      case 'left':
        return { x: cx - reach, y: cy };
      case 'right':
        return { x: cx + reach, y: cy };
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const drawX = this.x - (this.sheet.frameW - this.w) / 2 - camX;
    const drawY = this.y + this.h - this.sheet.frameH - camY;
    drawFrame(ctx, this.sheet, DIR_ROW[this.facing], this.moving ? this.anim.col : 0, drawX, drawY);
  }
}
