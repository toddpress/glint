const STRUCTURAL = Symbol('glint.structural');
export const isStructural = value => Boolean(value?.[STRUCTURAL]);
export function each(items, keyOrView, maybeView) {
  const keyed = typeof maybeView === 'function';
  return { [STRUCTURAL]: true, kind: 'each', items, key: keyed ? keyOrView : null, view: keyed ? maybeView : keyOrView };
}
// Explicit compatibility path for the repository's former raw-item callbacks.
each.value = (items, keyOrView, maybeView) => ({ ...each(items, keyOrView, maybeView), rawItems: true });
export const when = (condition, yes, no = null) => ({ [STRUCTURAL]: true, kind: 'when', condition, yes, no });
export const match = (value, cases) => ({ [STRUCTURAL]: true, kind: 'match', value, cases });
export const callView = (view, ...args) => typeof view === 'function' ? view(...args) : view;
