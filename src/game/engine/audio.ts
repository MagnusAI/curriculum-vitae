// WebAudio chiptune synth — no audio assets needed.
// The AudioContext is created lazily inside a user-gesture-driven call
// (interact key / tap) to satisfy autoplay policies on iOS/Safari.

export interface Note {
  midi: number; // MIDI note number, 0 = rest
  dur: number; // beats
}

let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function scheduleNote(
  ac: AudioContext,
  midi: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gainValue: number,
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = midiToFreq(midi);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
  gain.gain.setValueAtTime(gainValue, start + dur * 0.7);
  gain.gain.linearRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

let tuneEndsAt = 0;

export function isTunePlaying(): boolean {
  return ctx !== null && ctx.currentTime < tuneEndsAt;
}

export function playTune(notes: Note[], bpm = 180, type: OscillatorType = 'triangle'): void {
  const ac = getContext();
  if (isTunePlaying()) return;
  const beat = 60 / bpm;
  let t = ac.currentTime + 0.05;
  for (const note of notes) {
    if (note.midi > 0) scheduleNote(ac, note.midi, t, note.dur * beat, type, 0.12);
    t += note.dur * beat;
  }
  tuneEndsAt = t;
}

// Short "blip" effects (dog bark, UI feedback).
export function playBlip(midi: number, dur = 0.09, type: OscillatorType = 'square'): void {
  const ac = getContext();
  scheduleNote(ac, midi, ac.currentTime, dur, type, 0.08);
}

export function playBark(): void {
  const ac = getContext();
  scheduleNote(ac, 55, ac.currentTime, 0.06, 'sawtooth', 0.12);
  scheduleNote(ac, 67, ac.currentTime + 0.07, 0.09, 'sawtooth', 0.1);
}
