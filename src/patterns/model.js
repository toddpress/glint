import { createStateContainer } from '../core/signals/index.js';
import { warn } from '../diagnostics/config.js';
const sharedModels = new Map();
function validate(factory) {
  if (typeof factory !== 'function') throw new TypeError('model(factory) expects a function');
  return factory;
}
export function model(factory) {
  validate(factory);
  return function useModel(state) {
    if (!state) { warn('Pass ctx.state to model() to own its resources'); state = createStateContainer(); }
    return factory(state);
  };
}
model.owned = factory => {
  validate(factory);
  return ctx => {
    if (!ctx?.state) throw new TypeError('model.owned requires a component context');
    const instance = factory(ctx.state);
    if (typeof instance?.dispose === 'function') ctx.state.own(() => instance.dispose());
    return instance;
  };
};
model.shared = (key, factory) => {
  validate(factory);
  return () => {
    if (!sharedModels.has(key)) {
      const state = createStateContainer();
      try { sharedModels.set(key, { state, instance: factory(state) }); }
      catch (error) { state.dispose(); throw error; }
    }
    return sharedModels.get(key).instance;
  };
};
model.disposeShared = key => {
  const shared = sharedModels.get(key);
  if (!shared) return;
  sharedModels.delete(key);
  try { shared.instance?.dispose?.(); } finally { shared.state.dispose(); }
};
