// === core.js ===

export {
  component,
  render,
  registerComponent,
  registerAllComponents,
  componentRegistry
} from './component.js';

export {
  registerLazyGlob,
  getLazyLoaderForTag
} from './lazy.js';

export {
  html,
  css
} from './templating.js';

export {
  signal,
  computed,
  effect,
  debouncedSignal,
  withTracking
} from './reactivity.js';

export {
  onMount,
  onDestroy,
  getCurrentComponent,
  pushCurrentComponent,
  popCurrentComponent
} from './lifecycle.js';

export {
  removeAllEventListeners,
  eventListenersMap
} from './event.js';

export {
  isFunction,
  isSignalLike,
  isGlintComponent,
  exportNameToTagName,
  generateUuid,
  safeParse,
  debounce
} from './utils.js';
