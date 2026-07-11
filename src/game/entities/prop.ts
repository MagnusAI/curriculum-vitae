import { PropRegion } from '../atlas';
import { DialogContent } from '../events';
import { Entity, WorldApi } from './entity';

export interface PropOptions {
  // Feet/collision box relative to the sprite's top-left. Defaults to the
  // bottom strip of the sprite.
  feet?: { ox: number; oy: number; w: number; h: number };
  solid?: boolean;
  flat?: boolean; // drawn under everything (rugs, mats)
  interactPrompt?: string;
  dialog?: DialogContent;
  onInteract?: () => void;
  // Two-frame animation (e.g. campfire flicker).
  altRegion?: PropRegion;
  animFps?: number;
}

// A static world object drawn from the props atlas. Solidity and depth
// sorting use the feet box; the sprite may extend above it (tree canopies,
// house roofs) so the player can pass "behind".
export class Prop implements Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  solid: boolean;
  flat: boolean;
  interactPrompt?: string;
  private dialog?: DialogContent;
  private onInteractFn?: () => void;
  interact?: (world: WorldApi) => void;
  private altRegion?: PropRegion;
  private animFps: number;
  private animTime = 0;
  update?: (dt: number) => void;

  constructor(
    private sheet: CanvasImageSource,
    private region: PropRegion,
    private spriteX: number,
    private spriteY: number,
    options: PropOptions = {},
  ) {
    const feet = options.feet ?? {
      ox: 0,
      oy: Math.max(0, region.h - 12),
      w: region.w,
      h: Math.min(12, region.h),
    };
    this.x = spriteX + feet.ox;
    this.y = spriteY + feet.oy;
    this.w = feet.w;
    this.h = feet.h;
    this.solid = options.solid ?? true;
    this.flat = options.flat ?? false;
    this.interactPrompt = options.interactPrompt;
    this.dialog = options.dialog;
    this.onInteractFn = options.onInteract;
    if (this.dialog || this.onInteractFn) {
      this.interact = (world: WorldApi) => {
        this.onInteractFn?.();
        if (this.dialog) world.events.emit({ type: 'openDialog', content: this.dialog });
      };
    }
    this.altRegion = options.altRegion;
    this.animFps = options.animFps ?? 4;
    if (this.altRegion) {
      this.update = (dt: number) => {
        this.animTime += dt;
      };
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    let region = this.region;
    if (this.altRegion && Math.floor(this.animTime * this.animFps) % 2 === 1) {
      region = this.altRegion;
    }
    ctx.drawImage(
      this.sheet,
      region.x,
      region.y,
      region.w,
      region.h,
      Math.floor(this.spriteX - camX),
      Math.floor(this.spriteY - camY),
      region.w,
      region.h,
    );
  }
}
