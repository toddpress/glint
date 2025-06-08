// glint/stores/index.js
const storeCache = new WeakMap();

/**
 * defineStore(factory: () => object): () => object
 *
 * Usage:
 *   const useCounter = defineStore(() => {...});
 *   const counter = useCounter(); // singleton instance per context
 */
export function defineStore(factory) {
  return function useStore(context = globalThis) {
    if (!storeCache.has(context)) {
      storeCache.set(context, factory());
    }
    return storeCache.get(context);
  };
}
export function resetStores() {
  storeCache.clear();
}
