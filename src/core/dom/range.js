export function clearBetween(start, end) {
  let node = start.nextSibling;
  while (node && node !== end) { const next = node.nextSibling; node.remove(); node = next; }
}
export function moveRange(start, end, before) {
  if (end.nextSibling === before) return;
  const parent = before.parentNode;
  let node = start;
  const stop = end.nextSibling;
  while (node && node !== stop) {
    const next = node.nextSibling;
    parent.insertBefore(node, before);
    node = next;
  }
}
