import tilesetUrl from '../assets/game/tileset.png';
import propsUrl from '../assets/game/props.png';
import playerUrl from '../assets/game/player.png';
import wifeUrl from '../assets/game/wife.png';
import dogUrl from '../assets/game/dog.png';
import chickenUrl from '../assets/game/chicken.png';
import sheepUrl from '../assets/game/sheep.png';
import cowUrl from '../assets/game/cow.png';

import { TILESET_COLS } from './atlas';
import { Camera } from './engine/camera';
import { Rect, rectsOverlap } from './engine/collision';
import { Input, VirtualInput } from './engine/input';
import { loadImages } from './engine/assets';
import { Loop } from './engine/loop';
import { Renderer } from './engine/renderer';
import { Dog } from './entities/dog';
import { Entity, SpawnPoint, WorldApi, entityCenter } from './entities/entity';
import { Player } from './entities/player';
import { GameEvents, SceneName } from './events';
import { buildHouse } from './world/house';
import { buildMountain } from './world/mountain';
import { buildOverworld } from './world/overworld';
import { GameAssets, SceneDef } from './world/scene';

export class Game {
  readonly events = new GameEvents();
  private input = new Input();
  private renderer: Renderer;
  private camera: Camera;
  private loop: Loop;
  private scenes!: Record<SceneName, SceneDef>;
  private scene!: SceneDef;
  private player!: Player;
  private dog!: Dog;
  private paused = false;
  private destroyed = false;
  private started = false;
  private currentPrompt: string | null = null;
  private pendingSwitch: { target: SceneName; spawn: SpawnPoint } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.camera = new Camera(this.renderer.viewW, this.renderer.viewH);
    this.loop = new Loop(
      (dt) => this.update(dt),
      () => this.render(),
    );
  }

  get virtualInput(): VirtualInput {
    return this.input.virtual;
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    const images = await loadImages({
      tileset: tilesetUrl,
      props: propsUrl,
      player: playerUrl,
      wife: wifeUrl,
      dog: dogUrl,
      chicken: chickenUrl,
      sheep: sheepUrl,
      cow: cowUrl,
    });
    if (this.destroyed) return;

    const assets: GameAssets = {
      tileset: { image: images.tileset, cols: TILESET_COLS },
      props: images.props,
      player: { image: images.player, frameW: 16, frameH: 24 },
      wife: { image: images.wife, frameW: 16, frameH: 24 },
      dog: { image: images.dog, frameW: 16, frameH: 16 },
      chicken: { image: images.chicken, frameW: 16, frameH: 16 },
      sheep: { image: images.sheep, frameW: 16, frameH: 16 },
      cow: { image: images.cow, frameW: 16, frameH: 16 },
    };

    this.scenes = {
      overworld: buildOverworld(assets),
      house: buildHouse(assets),
      mountain: buildMountain(assets),
    };
    this.scene = this.scenes.overworld;
    this.player = new Player(assets.player);
    this.dog = new Dog(assets.dog);
    const spawn = this.scene.spawn;
    this.player.place(spawn.x, spawn.y, spawn.facing);
    this.dog.place(spawn.x + 14, spawn.y + 10);

    this.input.attach();
    this.loop.start();
    this.events.emit({ type: 'sceneChanged', scene: this.scene.name });
    this.events.emit({ type: 'ready' });
  }

  destroy(): void {
    this.destroyed = true;
    this.loop.stop();
    this.input.detach();
    this.events.clear();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.input.setEnabled(!paused);
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.renderer.resize(cssW, cssH, dpr);
  }

  private worldApi(exclude: Entity): WorldApi {
    const solids: Rect[] = [];
    for (const e of this.scene.entities) {
      if (e !== exclude && e.solid) solids.push({ x: e.x, y: e.y, w: e.w, h: e.h });
    }
    if (this.player !== exclude && this.player) {
      // nothing pushes the player around; entities may still overlap them
    }
    const { cx, cy } = entityCenter(this.player);
    return {
      map: this.scene.map,
      solids,
      events: this.events,
      playerX: cx,
      playerY: cy,
      switchScene: (target, spawn) => {
        this.pendingSwitch = { target, spawn };
      },
    };
  }

  // Used by dialog action buttons (e.g. the summit sign) to skip the walk back.
  returnHome(): void {
    if (!this.scenes) return;
    this.switchScene('overworld', { x: 107, y: 250, facing: 'down' });
  }

  private switchScene(target: SceneName, spawn: SpawnPoint): void {
    this.scene = this.scenes[target];
    this.player.place(spawn.x, spawn.y, spawn.facing);
    const behind = spawn.facing === 'up' ? 12 : -12;
    this.dog.place(spawn.x + 2, spawn.y + behind);
    this.events.emit({ type: 'sceneChanged', scene: target });
    this.setPrompt(null);
  }

  private setPrompt(prompt: string | null): void {
    if (prompt !== this.currentPrompt) {
      this.currentPrompt = prompt;
      this.events.emit({ type: 'promptChange', prompt });
    }
  }

  private findInteractTarget(): Entity | null {
    const probe = this.player.probe();
    let best: Entity | null = null;
    let bestDist = Infinity;
    const candidates: Entity[] = [...this.scene.entities, this.dog];
    for (const e of candidates) {
      if (!e.interact) continue;
      const margin = 8;
      if (
        probe.x >= e.x - margin &&
        probe.x <= e.x + e.w + margin &&
        probe.y >= e.y - margin &&
        probe.y <= e.y + e.h + margin
      ) {
        const { cx, cy } = entityCenter(e);
        const d = Math.hypot(cx - probe.x, cy - probe.y);
        if (d < bestDist) {
          bestDist = d;
          best = e;
        }
      }
    }
    return best;
  }

  private update(dt: number): void {
    if (!this.scene || this.paused) return;

    const snapshot = this.input.poll();
    this.player.move(dt, this.worldApi(this.player), snapshot.dx, snapshot.dy);
    this.dog.update(dt, this.worldApi(this.dog));
    for (const e of this.scene.entities) {
      e.update?.(dt, this.worldApi(e));
    }

    // scene triggers (doors)
    const playerRect: Rect = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };
    for (const trigger of this.scene.triggers) {
      if (rectsOverlap(playerRect, trigger.rect)) {
        this.pendingSwitch = { target: trigger.target, spawn: trigger.spawn };
        break;
      }
    }
    if (this.pendingSwitch) {
      const { target, spawn } = this.pendingSwitch;
      this.pendingSwitch = null;
      this.switchScene(target, spawn);
      return;
    }

    // interaction
    const target = this.findInteractTarget();
    this.setPrompt(target?.interactPrompt ?? null);
    if (snapshot.interact && target?.interact) {
      target.interact(this.worldApi(target));
    }
  }

  private render(): void {
    if (!this.scene) return;
    const ctx = this.renderer.begin();
    this.camera.viewW = this.renderer.viewW;
    this.camera.viewH = this.renderer.viewH;
    const { cx, cy } = entityCenter(this.player);
    const mapW = this.scene.map.w * 16;
    const mapH = this.scene.map.h * 16;
    this.camera.follow(cx, cy, mapW, mapH);
    const camX = this.camera.x;
    const camY = this.camera.y;

    // background outside the map
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, this.renderer.viewW, this.renderer.viewH);
    ctx.drawImage(this.scene.ground, -camX, -camY);

    // y-sorted world entities (flat props first)
    const drawList: Entity[] = [...this.scene.entities, this.player, this.dog];
    drawList.sort((a, b) => {
      const fa = (a as { flat?: boolean }).flat ? 1 : 0;
      const fb = (b as { flat?: boolean }).flat ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return a.y + a.h - (b.y + b.h);
    });
    const viewW = this.renderer.viewW;
    const viewH = this.renderer.viewH;
    for (const e of drawList) {
      // generous culling margin: sprites may extend well above their feet box
      if (e.x + e.w < camX - 48 || e.x > camX + viewW + 48 || e.y + e.h < camY - 96 || e.y > camY + viewH + 96) {
        continue;
      }
      e.draw(ctx, camX, camY);
    }

    this.renderer.present();
  }
}
