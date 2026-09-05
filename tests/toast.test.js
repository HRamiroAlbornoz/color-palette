import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToast } from '../js/toast.js';

describe('createToast', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('p');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the message immediately', () => {
    const toast = createToast(element);

    toast.show('Copiado #4A91D9');

    expect(element.textContent).toBe('Copiado #4A91D9');
  });

  it('clears the message after the display duration', () => {
    const toast = createToast(element);

    toast.show('Copiado #4A91D9');
    vi.advanceTimersByTime(2000);

    expect(element.textContent).toBe('');
  });

  it('replaces a pending message instead of stacking it', () => {
    const toast = createToast(element);

    toast.show('Copiado #4A91D9');
    vi.advanceTimersByTime(1000);
    toast.show('Copiado hsl(210, 65%, 57%)');
    vi.advanceTimersByTime(1000);

    expect(element.textContent).toBe('Copiado hsl(210, 65%, 57%)');
  });

  it('clears the replaced message only after its own full duration', () => {
    const toast = createToast(element);

    toast.show('Copiado #4A91D9');
    vi.advanceTimersByTime(1000);
    toast.show('Copiado hsl(210, 65%, 57%)');
    vi.advanceTimersByTime(1999);

    expect(element.textContent).toBe('Copiado hsl(210, 65%, 57%)');

    vi.advanceTimersByTime(1);

    expect(element.textContent).toBe('');
  });
});
