// useFocusTrap is exercised through a minimal harness rather than through
// DialogPanel/CvContent directly, so these assertions are about the trap
// itself (initial focus, Tab/Shift+Tab wrapping, restore-on-close) and stay
// meaningful even if either caller's own markup changes later. Each real
// caller gets its own lighter integration check in its own test file.
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

// Builds container > [firstBtn, middleBtn, lastBtn], with `outside` as a
// sibling standing in for a control hidden behind the overlay (e.g.
// StartScreen's buttons behind the CV panel, or anything behind a dialog).
function buildHarness() {
  const outside = document.createElement('button');
  outside.textContent = 'outside';
  document.body.appendChild(outside);

  const container = document.createElement('div');
  container.tabIndex = -1;
  const firstBtn = document.createElement('button');
  firstBtn.textContent = 'first';
  const middleBtn = document.createElement('button');
  middleBtn.textContent = 'middle';
  const lastBtn = document.createElement('button');
  lastBtn.textContent = 'last';
  container.append(firstBtn, middleBtn, lastBtn);
  document.body.appendChild(container);

  return { outside, container, firstBtn, middleBtn, lastBtn };
}

describe('useFocusTrap', () => {
  it('focuses the container and remembers the previously-focused trigger', () => {
    const { outside, container } = buildHarness();
    outside.focus();

    const { rerender } = renderHook(({ active }) => useFocusTrap({ current: container }, active), {
      initialProps: { active: false },
    });
    expect(document.activeElement).toBe(outside);

    rerender({ active: true });
    expect(document.activeElement).toBe(container);

    outside.remove();
    container.remove();
  });

  it('wraps Tab from the last focusable element back to the first', () => {
    const { container, firstBtn, lastBtn } = buildHarness();
    renderHook(() => useFocusTrap({ current: container }, true));

    lastBtn.focus();
    const event = new KeyboardEvent('keydown', { code: 'Tab', bubbles: true, cancelable: true });
    act(() => window.dispatchEvent(event));

    expect(document.activeElement).toBe(firstBtn);
    expect(event.defaultPrevented).toBe(true);
    container.remove();
  });

  it('wraps Shift+Tab from the first focusable element back to the last', () => {
    const { container, firstBtn, lastBtn } = buildHarness();
    renderHook(() => useFocusTrap({ current: container }, true));

    firstBtn.focus();
    const event = new KeyboardEvent('keydown', { code: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    act(() => window.dispatchEvent(event));

    expect(document.activeElement).toBe(lastBtn);
    expect(event.defaultPrevented).toBe(true);
    container.remove();
  });

  it('does not interfere with Tab between elements inside the container', () => {
    const { container, firstBtn, middleBtn } = buildHarness();
    renderHook(() => useFocusTrap({ current: container }, true));

    firstBtn.focus();
    const event = new KeyboardEvent('keydown', { code: 'Tab', bubbles: true, cancelable: true });
    act(() => window.dispatchEvent(event));

    // Real browser tab order would move focus to middleBtn on its own;
    // jsdom does not implement that, so this only asserts the trap itself
    // stayed out of the way (didn't force focus back to first/last).
    expect(event.defaultPrevented).toBe(false);
    container.remove();
    void middleBtn;
  });

  it('restores focus to the trigger when deactivated', () => {
    const { outside, container } = buildHarness();
    outside.focus();

    const { rerender } = renderHook(({ active }) => useFocusTrap({ current: container }, active), {
      initialProps: { active: true },
    });
    expect(document.activeElement).toBe(container);

    rerender({ active: false });
    expect(document.activeElement).toBe(outside);

    outside.remove();
    container.remove();
  });

  it('restores focus to the trigger when unmounted', () => {
    const { outside, container } = buildHarness();
    outside.focus();

    const { unmount } = renderHook(() => useFocusTrap({ current: container }, true));
    expect(document.activeElement).toBe(container);

    unmount();
    expect(document.activeElement).toBe(outside);

    outside.remove();
    container.remove();
  });
});
