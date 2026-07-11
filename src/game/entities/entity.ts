import { Rect } from '../engine/collision';
import { TilemapData } from '../engine/tilemap';
import { GameEvents, SceneName } from '../events';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface SpawnPoint {
  x: number; // world px, collision-box top-left
  y: number;
  facing: Dir;
}

// What entities can see of the world without importing Game directly.
export interface WorldApi {
  map: TilemapData;
  solids: Rect[]; // solid entity collision boxes (excluding the asking entity)
  events: GameEvents;
  playerX: number; // player collision-box center
  playerY: number;
  switchScene(target: SceneName, spawn: SpawnPoint): void;
}

export interface Entity {
  // Collision box ("feet" box) in world px.
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: boolean;
  update?(dt: number, world: WorldApi): void;
  // Entities draw in camera space; sorted by (y + h) for depth.
  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void;
  interact?(world: WorldApi): void;
  interactPrompt?: string;
}

export function entityCenter(e: { x: number; y: number; w: number; h: number }): {
  cx: number;
  cy: number;
} {
  return { cx: e.x + e.w / 2, cy: e.y + e.h / 2 };
}
