// First test for StartScreen - added alongside its one new behaviour (#17):
// a "Read the CV" button distinct from Explore (starts the game) and the
// PDF download, calling a plain callback rather than any game control.
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StartScreen } from './StartScreen';

describe('StartScreen', () => {
  it('calls onViewCv, not onStart, when "Read the CV" is clicked', () => {
    const onStart = vi.fn();
    const onViewCv = vi.fn();
    render(<StartScreen onStart={onStart} onViewCv={onViewCv} isTouch={false} />);

    fireEvent.click(screen.getByRole('button', { name: /read the cv/i }));

    expect(onViewCv).toHaveBeenCalledOnce();
    expect(onStart).not.toHaveBeenCalled();
  });

  it('still calls onStart, not onViewCv, when Explore is clicked', () => {
    const onStart = vi.fn();
    const onViewCv = vi.fn();
    render(<StartScreen onStart={onStart} onViewCv={onViewCv} isTouch={false} />);

    fireEvent.click(screen.getByRole('button', { name: /explore/i }));

    expect(onStart).toHaveBeenCalledOnce();
    expect(onViewCv).not.toHaveBeenCalled();
  });

  // #28: since #26 made the CV the default landing view, this screen is reached
  // by leaving it rather than being the site's front door - its copy should say so.
  describe('copy reflects that the CV, not this screen, is the landing view', () => {
    it('describes itself as reached from the CV, not as the entry point', () => {
      render(<StartScreen onStart={vi.fn()} onViewCv={vi.fn()} isTouch={false} />);
      expect(screen.getByText(/stepped out of the cv/i)).toBeTruthy();
      expect(screen.queryByText(/welcome to my little pixel-world cv/i)).toBeNull();
    });

    it('tells a screen reader user "Read the CV" goes back, not that it is the non-playing option', () => {
      render(<StartScreen onStart={vi.fn()} onViewCv={vi.fn()} isTouch={false} />);
      expect(screen.getByText(/go back to it/i)).toBeTruthy();
      expect(screen.queryByText(/this page is an interactive game/i)).toBeNull();
    });
  });
});
