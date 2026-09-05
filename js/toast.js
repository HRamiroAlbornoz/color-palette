const TOAST_DURATION_MS = 2000;

export function createToast(element) {
  let hideTimeoutId = null;

  function show(message) {
    element.textContent = message;

    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId);
    }

    hideTimeoutId = setTimeout(() => {
      element.textContent = '';
      hideTimeoutId = null;
    }, TOAST_DURATION_MS);
  }

  return { show };
}
