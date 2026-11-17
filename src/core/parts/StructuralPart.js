import { Binding } from './Binding.js';
import { readValue, untracked } from '../signals/index.js';
import { callView } from '../../patterns/template.js';
import { ListPart } from './ListPart.js';
export class StructuralPart extends Binding {
  constructor(scope, start, end, kind, NodePart) {
    super(scope);
    this.kind = kind;
    this.NodePart = NodePart;
    this.start = start;
    this.end = end;
    this.branch = Symbol('initial');
    if (kind === 'each') this.list = new ListPart(scope.child('each'), start, end, NodePart);
  }
  apply(spec) {
    if (this.kind === 'each') {
      const items = readValue(spec.items);
      // Track only list/key dependencies, not dependencies read by row construction.
      this.list.sync(items, spec);
      return;
    }
    const key = this.kind === 'when' ? Boolean(readValue(spec.condition)) : readValue(spec.value);
    const view = this.kind === 'when' ? (key ? spec.yes : spec.no)
      : Object.hasOwn(spec.cases, key) ? spec.cases[key] : spec.cases._ ?? spec.cases.default;
    if (Object.is(key, this.branch) && view === this.view) return;
    this.branch = key;
    this.view = view;
    this.content?.dispose();
    this.content = new this.NodePart(this.scope.child('branch'), this.start, this.end);
    this.content.wire(untracked(() => callView(view, key)));
  }
  dispose() {
    this.list?.dispose();
    this.content?.dispose();
    super.dispose();
  }
}
