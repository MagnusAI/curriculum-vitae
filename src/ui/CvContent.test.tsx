// Proves CvContent satisfies #8's four acceptance criteria as far as a DOM
// test can: every entry from the three named data modules is present as
// text (AC1/AC3), and the section/entry structure exposes real heading
// levels with names that reflect their place in the outline (AC4).
// AC2 (browser find-in-page) rests on the .sr-only technique itself - a
// clip-rect hidden box, not display:none/visibility:hidden/aria-hidden -
// which is the standard, widely-documented pattern relied on precisely
// because browsers still search and expose that text; there is no way to
// drive a browser's native find-in-page from this test runner to assert it
// directly, so this file instead asserts the technique used is that one.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { education } from '../data/education';
import { hobbies } from '../data/hobbies';
import { gardenBeds, pottedPlants, rackTools } from '../data/skills';
import { workExperience } from '../data/work-experience';
import { CvContent } from './CvContent';

describe('CvContent', () => {
  it('is present via the sr-only technique, not display:none or aria-hidden', () => {
    const { container } = render(<CvContent />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('sr-only');
    expect(root.getAttribute('aria-hidden')).toBeNull();
    expect(getComputedStyle(root).display).not.toBe('none');
  });

  it('exposes exactly one h1, naming the person', () => {
    render(<CvContent />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toContain('Magnus Arnild');
  });

  it('exposes one h2 per major section, in outline order', () => {
    render(<CvContent />);
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual(['Work Experience', 'Education', 'Skills', 'Hobbies']);
  });

  it('gives every work-experience, education and hobby entry its own h3', () => {
    render(<CvContent />);
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    for (const item of workExperience) expect(h3s).toContain(`${item.title} — ${item.organization}`);
    for (const item of education) expect(h3s).toContain(`${item.title} — ${item.organization}`);
    for (const hobby of hobbies) expect(h3s).toContain(hobby.name);
  });

  it('includes every work-experience entry as text', () => {
    const { container } = render(<CvContent />);
    for (const item of workExperience) {
      expect(container.textContent).toContain(item.organization);
      expect(container.textContent).toContain(item.period);
    }
  });

  it('includes every education entry as text', () => {
    const { container } = render(<CvContent />);
    for (const item of education) {
      expect(container.textContent).toContain(item.organization);
      expect(container.textContent).toContain(item.period);
    }
  });

  it('includes every skills entry as text: garden beds, potted plants and rack tools', () => {
    const { container } = render(<CvContent />);
    for (const bed of gardenBeds) {
      expect(container.textContent).toContain(bed.name);
      for (const skill of bed.skills) expect(container.textContent).toContain(skill);
    }
    for (const plant of pottedPlants) expect(container.textContent).toContain(plant.name);
    for (const tool of rackTools) expect(container.textContent).toContain(tool.name);
  });
});
