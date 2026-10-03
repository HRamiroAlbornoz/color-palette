import { afterEach, describe, expect, it } from 'vitest';
import { getSpaceShortcutAction, trackKeyboardFocus } from '../js/shortcut.js';

function keydown(overrides = {}) {
  return {
    key: ' ',
    repeat: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...overrides,
  };
}

describe('getSpaceShortcutAction', () => {
  it('generates on Space when no control was reached with the keyboard', () => {
    expect(getSpaceShortcutAction(keydown(), { focusCameFromKeyboard: false })).toBe('generate');
  });

  it('leaves Space to the control when the focus arrived with the keyboard', () => {
    expect(getSpaceShortcutAction(keydown(), { focusCameFromKeyboard: true })).toBe('ignore');
  });

  it('ignores every key other than Space', () => {
    expect(
      getSpaceShortcutAction(keydown({ key: 'Enter' }), { focusCameFromKeyboard: false }),
    ).toBe('ignore');
  });

  it('ignores Space combined with Ctrl, Alt, Shift or Meta', () => {
    for (const modifier of ['ctrlKey', 'altKey', 'shiftKey', 'metaKey']) {
      expect(
        getSpaceShortcutAction(keydown({ [modifier]: true }), { focusCameFromKeyboard: false }),
      ).toBe('ignore');
    }
  });

  it('only blocks the page scroll on a held-down Space, so one press generates once', () => {
    expect(
      getSpaceShortcutAction(keydown({ repeat: true }), { focusCameFromKeyboard: false }),
    ).toBe('block');
  });
});

describe('trackKeyboardFocus', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  function setUp() {
    const button = document.createElement('button');
    document.body.append(button);
    return { button, focusCameFromKeyboard: trackKeyboardFocus(document) };
  }

  it('reports no keyboard focus before anything is focused', () => {
    const { focusCameFromKeyboard } = setUp();

    expect(focusCameFromKeyboard()).toBe(false);
  });

  it('reports keyboard focus when a key was the last input before the control got focus', () => {
    const { button, focusCameFromKeyboard } = setUp();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    button.focus();

    expect(focusCameFromKeyboard()).toBe(true);
  });

  it('reports pointer focus when a click focused the control, even after a later key press', () => {
    const { button, focusCameFromKeyboard } = setUp();

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    button.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(focusCameFromKeyboard()).toBe(false);
  });

  it('treats a focus that fell back to the page as no control at all', () => {
    const { button, focusCameFromKeyboard } = setUp();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    button.focus();
    button.blur();

    expect(focusCameFromKeyboard()).toBe(false);
  });
});
