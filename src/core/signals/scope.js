
export function createEffectScope() {
  const effects = new Set();
  const children = new Set();

  function effect(fn) {
    const cleanup = fn();
    if (typeof cleanup === 'function') effects.add(cleanup);
  }

  function fork() {
    const child = createEffectScope();
    children.add(child);
    return child;
  }

  function disposeEffects() {
    effects.forEach(fn => fn());
    effects.clear();
  }

  function dispose() {
    children.forEach(child => child.dispose());
    children.clear();
    disposeEffects();
  }

  return {
    effect,
    fork,
    dispose,
    disposeEffects,
  };
}

// @Deprecated - prefer `Part` + `scope` ownership going forward
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
