export class Part {
  #disposed = false;
  #children = new Set();

  addChild(part) {
    this.#children.add(part);
    return part;
  }

  removeChild(part) {
    this.#children.delete(part);
  }

  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;

    this.#children.forEach((child) => child.dispose());
    this.#children.clear();
  }
}
