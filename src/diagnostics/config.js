const config = { diagnostics: false };
export function configure(next = {}) {
  if ('diagnostics' in next) config.diagnostics = Boolean(next.diagnostics);
}
export const getConfig = () => ({ ...config });
export function warn(message, detail) {
  if (config.diagnostics) console.warn(`[glint] ${message}`, ...(detail === undefined ? [] : [detail]));
}
const frames = [];
let trackingDepth = 0;
export function tracked(fn) {
  trackingDepth++;
  try { return fn(); } finally { trackingDepth--; }
}
export function beginConstructionDiagnostics(label = 'component') {
  const frame = { label, reads: new Set() };
  frames.push(frame);
  return frame;
}
export function endConstructionDiagnostics(frame) {
  if (frames.at(-1) !== frame) throw new Error('Glint construction diagnostics stack mismatch.');
  frames.pop();
  if (frame.reads.size) warn('signal read during component construction will not update reactively; use a function, computed, or peek(...)', { label: frame.label, count: frame.reads.size });
}
export function recordConstructionRead(value) {
  if (!trackingDepth) frames.at(-1)?.reads.add(value);
}
