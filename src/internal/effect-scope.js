export function createEffectScope(parent = null) {
 const cleanups = new Set();
  const children = new Set();

  function effect(fn) {
    const cleanup = fn();
    if (typeof cleanup === 'function') cleanups.add(cleanup);
  }

  function fork() {
    const child = createEffectScope();
    children.add(child);
    return child;
  }

  function dispose() {
    children.forEach(child => child.dispose());
    cleanups.forEach(fn => fn());
    children.clear();
    cleanups.clear();
  }

  return {
    effect,
    fork,
    dispose
  };
}

export function withEffectScope(ctx, subscribe, render) {
  let scope = null;
  let mounted = false;

  subscribe((active) => {
    if (!active) {
      if (mounted) {
        scope.dispose();
        scope = null;
        mounted = false;
      }
      return;
    }

    if (!mounted) {
      scope = ctx.effectScope.fork();
      render({
        ...ctx,
        effect: scope.effect,
        effectScope: scope,
      });
      mounted = true;
    }
  });
}
