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
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  // #17: the same content, made visible in place rather than clipped.
  describe('visible', () => {
    it('uses the cv-visible class instead of sr-only, with a close button', () => {
      const { container } = render(<CvContent visible onClose={vi.fn()} />);
      const root = container.firstElementChild!;
      expect(root.className).toBe('cv-visible');
      expect(screen.getByRole('button', { name: 'Close CV' })).toBeTruthy();
    });

    it('calls onClose when the close button is clicked', () => {
      const onClose = vi.fn();
      render(<CvContent visible onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close CV' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose on Escape', () => {
      const onClose = vi.fn();
      render(<CvContent visible onClose={onClose} />);
      fireEvent.keyDown(window, { code: 'Escape' });
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('still renders every heading and entry when visible', () => {
      render(<CvContent visible onClose={vi.fn()} />);
      expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
        'Work Experience',
        'Education',
        'Skills',
        'Hobbies',
      ]);
    });

    // #26: the CV is now the landing view, so the PDF (the recruiter's
    // documented escape hatch) must be reachable from here directly rather
    // than only from StartScreen.
    it('offers a PDF download button, not disabled by default', () => {
      render(<CvContent visible onClose={vi.fn()} />);
      const pdfButton = screen.getByRole('button', { name: /download as pdf/i }) as HTMLButtonElement;
      expect(pdfButton.disabled).toBe(false);
    });

    it('moves focus into the panel on open, away from whatever was focused before', () => {
      const outsideButton = document.createElement('button');
      outsideButton.textContent = 'outside, focused before the panel opens';
      document.body.appendChild(outsideButton);
      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      const { container } = render(<CvContent visible onClose={vi.fn()} />);

      expect(document.activeElement).toBe(container.firstElementChild);
      expect(document.activeElement).not.toBe(outsideButton);
      outsideButton.remove();
    });

    // #19 (updated by #26, which added the PDF button as a second focusable
    // element): Tab/Shift+Tab must wrap between the panel's two focusable
    // controls - the close button (first) and the PDF button (last) -
    // rather than escaping to a control hidden behind the panel (e.g.
    // StartScreen's own buttons, still present in the DOM underneath).
    // useFocusTrap.test.ts covers the trap's general wrapping behaviour;
    // this just proves it's wired up here, in CvContent's own real shape.
    it('traps Tab between its close and PDF buttons', () => {
      render(<CvContent visible onClose={vi.fn()} />);
      const closeBtn = screen.getByRole('button', { name: 'Close CV' });
      const pdfBtn = screen.getByRole('button', { name: /download as pdf/i });

      // Tab forward from the last focusable element wraps to the first.
      pdfBtn.focus();
      fireEvent.keyDown(window, { code: 'Tab' });
      expect(document.activeElement).toBe(closeBtn);

      // Shift+Tab backward from the first focusable element wraps to the last.
      fireEvent.keyDown(window, { code: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(pdfBtn);
    });

    it('restores focus to "Read the CV" (or whatever opened it) when closed', () => {
      const opener = document.createElement('button');
      opener.textContent = 'Read the CV';
      document.body.appendChild(opener);
      opener.focus();

      const { rerender } = render(<CvContent visible onClose={vi.fn()} />);
      expect(document.activeElement).not.toBe(opener);

      rerender(<CvContent visible={false} onClose={vi.fn()} />);
      expect(document.activeElement).toBe(opener);
      opener.remove();
    });
  });

  it('ignores Escape when not visible (the always-mounted #8 instance is not a dialog)', () => {
    const onClose = vi.fn();
    render(<CvContent onClose={onClose} />);
    fireEvent.keyDown(window, { code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
