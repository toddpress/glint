import { createEffectScope } from '../../signals';

export class Part {
  #disposed = false;

  constructor(parentScope = null) {
    this.scope = parentScope ? parentScope.fork() : createEffectScope();
    this.ownedParts = new Set();
  }

  addOwnedPart(part) {
    this.ownedParts.add(part);
    return part;
  }

  removeOwnedPart(part) {
    this.ownedParts.delete(part);
  }

  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;

    this.ownedParts.forEach(part => part.dispose());
    this.ownedParts.clear();

    this.scope.dispose();
  }
}
