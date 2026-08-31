// #23: the profile photo was a 458KB PNG displayed at 96x96px - the single
// heaviest asset in the app for a small headshot. Resized (proportionally,
// so the existing object-fit: cover crop in StartScreen.tsx is unchanged)
// and re-encoded as JPEG, the right format for photographic content. This
// guards against a future replacement silently reintroducing an oversized
// asset - statSync's on the real file on disk, since Vite resolves the
// `profileImage` import to a URL string at runtime, not file bytes.
import { statSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('profile image asset size', () => {
  it('stays well under the original 458KB, proportionate to its 96x96 display size', () => {
    // process.cwd() is the repo root when tests run, both locally and in CI.
    const path = join(process.cwd(), 'src/assets/profile_image.jpg');
    const { size } = statSync(path);
    expect(size).toBeLessThan(50_000);
  });
});
