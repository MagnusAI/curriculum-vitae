// Core game constants
export const TILE = 16;

// The renderer picks an integer scale so the short screen axis shows
// roughly this many game pixels (~15 tiles).
export const TARGET_VIEW_SHORT = 240;

export const FIXED_DT = 1 / 60;
export const MAX_FRAME_TIME = 0.25;

export const PLAYER_SPEED = 72; // px/s
export const DOG_SPEED = 84; // px/s, slightly faster so it can catch up
export const ANIMAL_SPEED = 16; // px/s, lazy wandering
