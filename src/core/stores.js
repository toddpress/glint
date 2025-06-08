// glint/stores/index.js

const storeCache = new WeakMap();
const scopedCaches = new WeakMap();

/**
 * defineStore(factory: () => object): () => object
 * Global/singleton store, optionally keyed by `context`
 */
export function defineStore(factory) {
  return function useStore(context = globalThis) {
    if (!storeCache.has(context)) {
      storeCache.set(context, factory());
    }
    return storeCache.get(context);
  };
}

/**
 * defineScopedStore(factory: () => object): (host: object) => object
 * Per-component scoped store keyed to the host element instance
 */
export function defineScopedStore(factory) {
  return function useScopedStore(host) {
    if (!host) throw new Error('useScopedStore requires a host context');
    if (!scopedCaches.has(host)) {
      scopedCaches.set(host, factory());
    }
    return scopedCaches.get(host);
  };
}

/**
 * withMiddleware(store, ...middlewares): applies enhancers to a store object
 */
export function withMiddleware(store, ...middlewares) {
  return middlewares.reduce((acc, mw) => mw(acc), store);
}

/**
 * resetStores — test/debug only
 */
export function resetStores() {
  storeCache.clear();
  scopedCaches.clear();
}
