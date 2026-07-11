import { DialogContent } from '../events';
import { Entity, WorldApi } from './entity';

// Invisible interactable region — the visuals (sign, tree, piano, …) are
// baked into the tilemap; this entity only carries the interaction.
export class Hotspot implements Entity {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    public interactPrompt: string,
    private content: DialogContent,
    private onInteract?: () => void,
  ) {}

  interact(world: WorldApi): void {
    this.onInteract?.();
    world.events.emit({ type: 'openDialog', content: this.content });
  }

  draw(): void {
    // Intentionally invisible.
  }
}
