import { isFunction } from "../utils";

export function createEffectScope() {
  const effects = new Set();
  const ownedScopes = new Set();

  function effect(fn) {
    const cleanup = fn();
    if (isFunction(cleanup)) effects.add(cleanup);
  }

  function fork() {
    const scope = createEffectScope();
    ownedScopes.add(scope);
    return scope;
  }

  function disposeEffects() {
    effects.forEach(fn => fn());
    effects.clear();
  }

  function dispose() {
    ownedScopes.forEach(scope => scope.dispose());
    ownedScopes.clear();
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
      scope = ctx.scope.fork();
      render({
        ...ctx,
        scope,
      });
      mounted = true;
    }
  });
}
