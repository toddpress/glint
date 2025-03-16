export const eventListenersMap = new WeakMap();

export function removeAllEventListeners(node) {
  if (!node || !eventListenersMap.has(node)) return;

  const allNodes = [node, ...node.querySelectorAll('*')];
  allNodes.forEach((el) => {
    const listeners = eventListenersMap.get(el) || [];
    listeners.forEach(({ event, listener }) => {
      el.removeEventListener(event, listener);
    });
    eventListenersMap.delete(el);
  });
}
