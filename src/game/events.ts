// Typed event channel between the game (canvas world) and the React UI layer.

export interface DialogSection {
  heading?: string;
  meta?: string; // e.g. "Copenhagen, Denmark · 2021 – 2023"
  lines?: string[];
  tags?: string[];
}

export interface DialogAction {
  label: string;
  type: 'teleport-home';
}

export interface DialogContent {
  title: string;
  subtitle?: string;
  icon?: string; // emoji used in the panel header
  sections: DialogSection[];
  action?: DialogAction; // optional button rendered at the bottom of the panel
}

export type SceneName = 'overworld' | 'house' | 'mountain';

export type GameEvent =
  | { type: 'openDialog'; content: DialogContent }
  | { type: 'promptChange'; prompt: string | null }
  | { type: 'sceneChanged'; scene: SceneName }
  | { type: 'ready' };

export type GameEventListener = (event: GameEvent) => void;

export class GameEvents {
  private listeners = new Set<GameEventListener>();

  on(listener: GameEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: GameEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}
