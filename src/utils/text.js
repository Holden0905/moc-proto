export function safeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}
