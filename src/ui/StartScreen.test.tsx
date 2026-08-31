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
});
