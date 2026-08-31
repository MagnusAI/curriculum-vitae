// Proves DialogContent actually reaches the DOM through DialogPanel - the
// half of "reachable in the rendered output" that dialogs.test.ts cannot
// cover on its own, since that file only exercises the data -> DialogContent
// transform. Together the two files cover the full path for issue #13.
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { workExperience } from '../data/work-experience';
import { gardenBeds } from '../data/skills';
import { careerDialog, bedDialog } from '../game/content/dialogs';
import { DialogPanel } from './DialogPanel';

describe('DialogPanel', () => {
  it('renders a real career dialog: title, subtitle, meta and description lines', () => {
    const content = careerDialog(workExperience[0]);
    render(<DialogPanel content={content} onClose={vi.fn()} onAction={vi.fn()} isTouch={false} />);

    expect(screen.getByRole('dialog', { name: content.title })).toBeTruthy();
    expect(screen.getByText(content.subtitle!)).toBeTruthy();
    expect(screen.getByText(content.sections[0].meta!)).toBeTruthy();
    for (const line of content.sections[0].lines ?? []) {
      expect(screen.getByText(line)).toBeTruthy();
    }
  });

  it('renders skill tags from a real garden-bed dialog', () => {
    const content = bedDialog(gardenBeds[0]);
    render(<DialogPanel content={content} onClose={vi.fn()} onAction={vi.fn()} isTouch={false} />);

    for (const skill of gardenBeds[0].skills) {
      expect(screen.getByText(skill)).toBeTruthy();
    }
  });
});
