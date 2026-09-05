export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    return { ok: false, reason: 'unavailable' };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'denied' };
  }
}
