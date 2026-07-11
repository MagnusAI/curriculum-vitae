import { DOG_SPEED, TILE } from '../constants';
import { playBark } from '../engine/audio';
import { Animator, drawFrame, Spritesheet } from '../engine/spritesheet';
import { Dir, Entity, WorldApi, entityCenter } from './entity';

const DIR_ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };
const FOLLOW_DISTANCE = 22; // px behind the player
const TELEPORT_DISTANCE = TILE * 6;

// Jack Russell terrier that follows the player using a breadcrumb trail.
export class Dog implements Entity {
  x = 0;
  y = 0;
  w = 10;
  h = 7;
  facing: Dir = 'down';
  private moving = false;
  private anim = new Animator(2, 7);
  private crumbs: { x: number; y: number }[] = [];
  private lastCrumb = { x: 0, y: 0 };
  private wagTime = 0;

  interactPrompt = 'Pet the dog';

  constructor(private sheet: Spritesheet) {}

  place(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.crumbs = [];
    this.lastCrumb = { x, y };
  }

  interact(): void {
    playBark();
    this.wagTime = 1.2;
  }

  update(dt: number, world: WorldApi): void {
    // Record player breadcrumbs every few px of player movement.
    const px = world.playerX - this.w / 2;
    const py = world.playerY - this.h / 2;
    if (Math.hypot(px - this.lastCrumb.x, py - this.lastCrumb.y) > 6) {
      this.crumbs.push({ x: px, y: py });
      this.lastCrumb = { x: px, y: py };
      if (this.crumbs.length > 40) this.crumbs.shift();
    }

    const distToPlayer = Math.hypot(px - this.x, py - this.y);
    if (distToPlayer > TELEPORT_DISTANCE) {
      // Lost the player (e.g. scene switch edge cases) — catch up instantly.
      this.place(px, py + 12);
      return;
    }

    this.moving = false;
    if (distToPlayer > FOLLOW_DISTANCE && this.crumbs.length > 0) {
      const target = this.crumbs[0];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        this.crumbs.shift();
      } else {
        const step = Math.min(DOG_SPEED * dt, dist);
        // The dog is not clipped against the map — it follows the player's
        // path, which is already collision-checked.
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.moving = true;
        if (Math.abs(dx) >= Math.abs(dy)) this.facing = dx < 0 ? 'left' : 'right';
        else this.facing = dy < 0 ? 'up' : 'down';
      }
    } else if (!this.moving) {
      // Face the player while idle.
      const { cx, cy } = entityCenter(this);
      const ddx = world.playerX - cx;
      const ddy = world.playerY - cy;
      if (Math.abs(ddx) >= Math.abs(ddy)) this.facing = ddx < 0 ? 'left' : 'right';
      else this.facing = ddy < 0 ? 'up' : 'down';
    }
    if (this.wagTime > 0) this.wagTime -= dt;
    this.anim.update(dt, this.moving || this.wagTime > 0);
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const drawX = this.x - (this.sheet.frameW - this.w) / 2 - camX;
    const drawY = this.y + this.h - this.sheet.frameH - camY;
    drawFrame(
      ctx,
      this.sheet,
      DIR_ROW[this.facing],
      this.moving || this.wagTime > 0 ? this.anim.col : 0,
      drawX,
      drawY,
    );
  }
}
