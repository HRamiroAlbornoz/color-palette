const SHORTCUT_KEY = ' ';

function hasModifier({ ctrlKey, altKey, shiftKey, metaKey }) {
  return ctrlKey || altKey || shiftKey || metaKey;
}

export function getSpaceShortcutAction(event, { focusCameFromKeyboard }) {
  if (event.key !== SHORTCUT_KEY || hasModifier(event) || focusCameFromKeyboard) {
    return 'ignore';
  }

  return event.repeat ? 'block' : 'generate';
}

export function trackKeyboardFocus(root) {
  let lastInputWasPointer = false;
  let focusArrivedByKeyboard = false;

  root.addEventListener(
    'pointerdown',
    () => {
      lastInputWasPointer = true;
    },
    true,
  );
  root.addEventListener(
    'keydown',
    () => {
      lastInputWasPointer = false;
    },
    true,
  );
  root.addEventListener('focusin', () => {
    focusArrivedByKeyboard = !lastInputWasPointer;
  });

  return function focusCameFromKeyboard() {
    const focusIsOnAControl = root.activeElement !== null && root.activeElement !== root.body;
    return focusIsOnAControl && focusArrivedByKeyboard;
  };
}
