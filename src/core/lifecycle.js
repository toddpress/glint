// === lifecycle.js ===

let componentStack = [];

export const getCurrentComponent = () => componentStack.at(-1);

export const pushCurrentComponent = (comp) => {
  componentStack.push(comp);
};

export const popCurrentComponent = () => {
  componentStack.pop();
};

/**
 * Adds a callback to run when the component is mounted (connected).
 */
export const onMount = (cb) => {
  const comp = getCurrentComponent();
  comp?.hooks.onMount.push(cb);
};

/**
 * Adds a callback to run when the component is destroyed (disconnected).
 */
export const onDestroy = (cb) => {
  const comp = getCurrentComponent();
  comp?.hooks.onDestroy.push(cb);
};
