let _currentComponentStack = [];

export function getCurrentComponent() {
  return _currentComponentStack[_currentComponentStack.length - 1];
}

export function pushCurrentComponent(comp) {
  _currentComponentStack.push(comp);
}

export function popCurrentComponent() {
  _currentComponentStack.pop();
}

export function onMount(cb) {
  const comp = getCurrentComponent();
  if (comp) comp.hooks.onMount.push(cb);
}

export function onDestroy(cb) {
  const comp = getCurrentComponent();
  if (comp) comp.hooks.onDestroy.push(cb);
}
