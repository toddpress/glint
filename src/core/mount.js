import { Scope } from './scope.js';
import { NodePart } from './parts/NodePart.js';
const mounted = new WeakMap();
/** Mount once, then update in place. The returned handle owns the entire view. */
export function mount(target, value) {
  target = typeof target === 'string' ? document.querySelector(target) : target ?? document.body;
  if (!target) throw new Error('Glint mount target not found');
  mounted.get(target)?.dispose();
  const scope = new Scope('mount');
  const start = target.ownerDocument.createComment('gl:mount:start');
  const end = target.ownerDocument.createComment('gl:mount:end');
  target.replaceChildren(start, end);
  const part = new NodePart(scope, start, end);
  const handle = {
    update(next) { if (scope.disposed) throw new Error('Cannot update a disposed mount'); part.updateSource(next); },
    dispose() {
      if (scope.disposed) return;
      try { scope.dispose(); } finally {
        start.remove(); end.remove();
        if (mounted.get(target) === handle) mounted.delete(target);
      }
    },
    get disposed() { return scope.disposed; },
  };
  mounted.set(target, handle);
  try { part.wire(value); } catch (error) { handle.dispose(); throw error; }
  return handle;
}
export function unmount(target) {
  target = typeof target === 'string' ? document.querySelector(target) : target;
  mounted.get(target)?.dispose();
}
