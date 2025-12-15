let _currentComponentStack = [];

export const getCurrentComponent = () => _currentComponentStack.at(-1);
export const pushCurrentComponent = (comp) => _currentComponentStack.push(comp);
export const popCurrentComponent = () => _currentComponentStack.pop();

export function onMount(cb) {
  const comp = getCurrentComponent();
  if (comp) comp.hooks.onMount.push(cb);
}

export function onDestroy(cb) {
  const comp = getCurrentComponent();
  if (comp) comp.hooks.onDestroy.push(cb);
}
