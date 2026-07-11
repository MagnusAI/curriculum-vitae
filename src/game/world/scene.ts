import { Rect } from '../engine/collision';
import { Spritesheet } from '../engine/spritesheet';
import { TilemapData, Tileset } from '../engine/tilemap';
import { Entity, SpawnPoint } from '../entities/entity';
import { SceneName } from '../events';

export interface GameAssets {
  tileset: Tileset;
  props: HTMLImageElement;
  player: Spritesheet;
  wife: Spritesheet;
  dog: Spritesheet;
  chicken: Spritesheet;
  sheep: Spritesheet;
  cow: Spritesheet;
}

export interface SceneTrigger {
  rect: Rect;
  target: SceneName;
  spawn: SpawnPoint;
}

export interface SceneDef {
  name: SceneName;
  map: TilemapData;
  ground: HTMLCanvasElement; // baked static layers
  entities: Entity[]; // static world entities (player/dog are added by Game)
  triggers: SceneTrigger[];
  spawn: SpawnPoint; // initial spawn when the game starts here
}

// Helper for building solid grids.
export function makeSolid(w: number, h: number): Uint8Array {
  return new Uint8Array(w * h);
}

export function markSolid(solid: Uint8Array, w: number, x: number, y: number): void {
  solid[y * w + x] = 1;
}
