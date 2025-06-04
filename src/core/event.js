// === event.js ===
export const eventListenersMap = new WeakMap();

/**
 * Removes all tracked event listeners from a node and its descendants.
 */
export const removeAllEventListeners = (root) => {
  if (!root || !eventListenersMap.has(root)) return;

  const nodes = [root, ...root.querySelectorAll('*')];
  nodes.forEach(removeListenersFrom);
};


const removeListenersFrom = (node) => {
  const listeners = eventListenersMap.get(node);
  if (!listeners) return;
  listeners.forEach(({ event, listener }) => node.removeEventListener(event, listener));
  eventListenersMap.delete(node);
};
