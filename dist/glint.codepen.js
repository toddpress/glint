// Glint — https://github.com/toddpress/glint
class TemplateResult {
  constructor(kind, strings, values) {
    this.kind = kind;
    this.strings = strings;
    this.values = values;
    this.__template = true;
  }
}
const isTemplateResult = value => value instanceof TemplateResult;
const tag = kind => (strings, ...values) => new TemplateResult(kind, strings, values);
const html = tag('html');
const svg = tag('svg');
const mathml = tag('mathml');

var i=Symbol.for("preact-signals");function t(){if(!(s>1)){var i,t=false;while(void 0!==h){var r=h;h=void 0;f++;while(void 0!==r){var o=r.o;r.o=void 0;r.f&=-3;if(!(8&r.f)&&c(r))try{r.c();}catch(r){if(!t){i=r;t=true;}}r=o;}}f=0;s--;if(t)throw i}else s--;}function r(i){if(s>0)return i();s++;try{return i()}finally{t();}}var o=void 0;function n(i){var t=o;o=void 0;try{return i()}finally{o=t;}}var h=void 0,s=0,f=0,v=0;function e(i){if(void 0!==o){var t=i.n;if(void 0===t||t.t!==o){t={i:0,S:i,p:o.s,n:void 0,t:o,e:void 0,x:void 0,r:t};if(void 0!==o.s)o.s.n=t;o.s=t;i.n=t;if(32&o.f)i.S(t);return t}else if(-1===t.i){t.i=0;if(void 0!==t.n){t.n.p=t.p;if(void 0!==t.p)t.p.n=t.n;t.p=o.s;t.n=void 0;o.s.n=t;o.s=t;}return t}}}function u(i,t){this.v=i;this.i=0;this.n=void 0;this.t=void 0;this.W=null==t?void 0:t.watched;this.Z=null==t?void 0:t.unwatched;this.name=null==t?void 0:t.name;}u.prototype.brand=i;u.prototype.h=function(){return  true};u.prototype.S=function(i){var t=this,r=this.t;if(r!==i&&void 0===i.e){i.x=r;this.t=i;if(void 0!==r)r.e=i;else n(function(){var i;null==(i=t.W)||i.call(t);});}};u.prototype.U=function(i){var t=this;if(void 0!==this.t){var r=i.e,o=i.x;if(void 0!==r){r.x=o;i.e=void 0;}if(void 0!==o){o.e=r;i.x=void 0;}if(i===this.t){this.t=o;if(void 0===o)n(function(){var i;null==(i=t.Z)||i.call(t);});}}};u.prototype.subscribe=function(i){var t=this;return E(function(){var r=t.value,n=o;o=void 0;try{i(r);}finally{o=n;}},{name:"sub"})};u.prototype.valueOf=function(){return this.value};u.prototype.toString=function(){return this.value+""};u.prototype.toJSON=function(){return this.value};u.prototype.peek=function(){var i=o;o=void 0;try{return this.value}finally{o=i;}};Object.defineProperty(u.prototype,"value",{get:function(){var i=e(this);if(void 0!==i)i.i=this.i;return this.v},set:function(i){if(i!==this.v){if(f>100)throw new Error("Cycle detected");this.v=i;this.i++;v++;s++;try{for(var r=this.t;void 0!==r;r=r.x)r.t.N();}finally{t();}}}});function d(i,t){return new u(i,t)}function c(i){for(var t=i.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return  true;return  false}function a(i){for(var t=i.s;void 0!==t;t=t.n){var r=t.S.n;if(void 0!==r)t.r=r;t.S.n=t;t.i=-1;if(void 0===t.n){i.s=t;break}}}function l(i){var t=i.s,r=void 0;while(void 0!==t){var o=t.p;if(-1===t.i){t.S.U(t);if(void 0!==o)o.n=t.n;if(void 0!==t.n)t.n.p=o;}else r=t;t.S.n=t.r;if(void 0!==t.r)t.r=void 0;t=o;}i.s=r;}function y(i,t){u.call(this,void 0);this.x=i;this.s=void 0;this.g=v-1;this.f=4;this.W=null==t?void 0:t.watched;this.Z=null==t?void 0:t.unwatched;this.name=null==t?void 0:t.name;}y.prototype=new u;y.prototype.h=function(){this.f&=-3;if(1&this.f)return  false;if(32==(36&this.f))return  true;this.f&=-5;if(this.g===v)return  true;this.g=v;this.f|=1;if(this.i>0&&!c(this)){this.f&=-2;return  true}var i=o;try{a(this);o=this;var t=this.x();if(16&this.f||this.v!==t||0===this.i){this.v=t;this.f&=-17;this.i++;}}catch(i){this.v=i;this.f|=16;this.i++;}o=i;l(this);this.f&=-2;return  true};y.prototype.S=function(i){if(void 0===this.t){this.f|=36;for(var t=this.s;void 0!==t;t=t.n)t.S.S(t);}u.prototype.S.call(this,i);};y.prototype.U=function(i){if(void 0!==this.t){u.prototype.U.call(this,i);if(void 0===this.t){this.f&=-33;for(var t=this.s;void 0!==t;t=t.n)t.S.U(t);}}};y.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;void 0!==i;i=i.x)i.t.N();}};Object.defineProperty(y.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var i=e(this);this.h();if(void 0!==i)i.i=this.i;if(16&this.f)throw this.v;return this.v}});function w(i,t){return new y(i,t)}function _(i){var r=i.u;i.u=void 0;if("function"==typeof r){s++;var n=o;o=void 0;try{r();}catch(t){i.f&=-2;i.f|=8;b(i);throw t}finally{o=n;t();}}}function b(i){for(var t=i.s;void 0!==t;t=t.n)t.S.U(t);i.x=void 0;i.s=void 0;_(i);}function g(i){if(o!==this)throw new Error("Out-of-order effect");l(this);o=i;this.f&=-2;if(8&this.f)b(this);t();}function p(i,t){this.x=i;this.u=void 0;this.s=void 0;this.o=void 0;this.f=32;this.name=null==t?void 0:t.name;}p.prototype.c=function(){var i=this.S();try{if(8&this.f)return;if(void 0===this.x)return;var t=this.x();if("function"==typeof t)this.u=t;}finally{i();}};p.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1;this.f&=-9;_(this);a(this);s++;var i=o;o=this;return g.bind(this,i)};p.prototype.N=function(){if(!(2&this.f)){this.f|=2;this.o=h;h=this;}};p.prototype.d=function(){this.f|=8;if(!(1&this.f))b(this);};p.prototype.dispose=function(){this.d();};function E(i,t){var r=new p(i,t);try{r.c();}catch(i){r.d();throw i}var o=r.d.bind(r);o[Symbol.dispose]=o;return o}

const config = { diagnostics: false };
function configure(next = {}) {
  if ('diagnostics' in next) config.diagnostics = Boolean(next.diagnostics);
}
const getConfig = () => ({ ...config });
function warn(message, detail) {
  if (config.diagnostics) console.warn(`[glint] ${message}`, ...(detail === undefined ? [] : [detail]));
}
const frames = [];
let trackingDepth = 0;
function tracked(fn) {
  trackingDepth++;
  try { return fn(); } finally { trackingDepth--; }
}
function beginConstructionDiagnostics(label = 'component') {
  const frame = { label, reads: new Set() };
  frames.push(frame);
  return frame;
}
function endConstructionDiagnostics(frame) {
  if (frames.at(-1) !== frame) throw new Error('Glint construction diagnostics stack mismatch.');
  frames.pop();
  if (frame.reads.size) warn('signal read during component construction will not update reactively; use a function, computed, or peek(...)', { label: frame.label, count: frame.reads.size });
}
function recordConstructionRead(value) {
  if (!trackingDepth) frames.at(-1)?.reads.add(value);
}

// This is the only runtime module that depends on Preact Signals.
class State {
  constructor(initial) { this._s = d(initial); }
  get value() { return this.get(); }
  set value(next) { this.set(next); }
  get() { return this._s.value; }
  set(next) {
    if (!Object.is(this._s.peek(), next)) {
      // Preact uses ===; make -0/0 observable while retaining Object.is semantics.
      if (next === 0 && this._s.peek() === 0) r(() => { this._s.value = undefined; this._s.value = next; });
      else this._s.value = next;
    }
    return next;
  }
  subscribe(listener) { return effect(() => listener(this.get())); }
}
class Computed extends State {
  constructor(fn) { super(undefined); this._s = w(() => tracked(fn)); }
  set() { throw new Error('Cannot set a computed signal'); }
}
function effect(fn, owner) {
  let stop;
  let disposed = false;
  let release = () => {};
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    release();
    stop?.();
  };
  dispose.dispose = dispose;
  Object.defineProperty(dispose, 'disposed', { get: () => disposed });
  if (owner?.disposed) { disposed = true; return dispose; }
  stop = E(() => tracked(fn));
  release = owner?.own(dispose) ?? release;
  return dispose;
}

/** Ownership for effects, listeners, refs, and nested views. */
class Scope {
  constructor(label = 'scope', parent = null) {
    this.label = label;
    this.parent = parent;
    this.children = new Set();
    this.disposers = new Set();
    this.disposed = false;
    parent?.children.add(this);
  }
  own(disposer) {
    if (typeof disposer !== 'function') throw new TypeError('own expects a disposer function');
    if (this.disposed) { disposer(); return () => {}; }
    this.disposers.add(disposer);
    return () => this.disposers.delete(disposer);
  }
  child(label) {
    const child = new Scope(label, this);
    if (this.disposed) child.dispose();
    return child;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.parent?.children.delete(this);
    const errors = [];
    for (const resource of [...this.children].reverse()) {
      try { resource.dispose(); } catch (error) { errors.push(error); }
    }
    for (const dispose of [...this.disposers].reverse()) {
      try { dispose(); } catch (error) { errors.push(error); }
    }
    this.children.clear();
    this.disposers.clear();
    if (errors.length) throw new AggregateError(errors, `Cleanup failed in ${this.label}`);
  }
}

const isSignal = value => typeof value === 'function' && value.__isSignal === true;
const isComputed = value => isSignal(value) && value.__isComputed === true;
function wrap(base, { customSetter = null } = {}) {
  const readonly = base instanceof Computed;
  function accessor(next) {
    if (!arguments.length) { recordConstructionRead(accessor); return base.get(); }
    if (readonly) throw new Error('Cannot set a computed signal');
    return customSetter ? customSetter(next) : base.set(next);
  }
  accessor.get = () => accessor();
  accessor.peek = () => base._s.peek();
  accessor.subscribe = listener => effect(() => listener(accessor()));
  if (!readonly) accessor.set = next => accessor(next);
  accessor.__tc39 = base;
  accessor.__isSignal = true;
  accessor.__isComputed = readonly;
  accessor.__isState = !readonly;
  return accessor;
}
const signal = initial => wrap(new State(initial));
function computed(fn) {
  let last;
  const base = new Computed(() => last = fn());
  const value = wrap(base);
  let disposed = false;
  value.dispose = () => {
    if (disposed) return;
    disposed = true;
    base._s = new State(last)._s;
  };
  return value;
}
const peek = value => isSignal(value) ? value.peek() : value;
const readValue = value => typeof value === 'function' ? value() : value;
function createSignalAdapter(adapter) {
  for (const name of ['signal', 'computed', 'effect', 'batch', 'peek', 'isSignal', 'isComputed']) {
    if (typeof adapter?.[name] !== 'function') throw new TypeError(`Signal adapter requires ${name}`);
  }
  return adapter;
}
// Compatibility name from the demo: backed by Preact, not a TC39 polyfill.
const tc39Signals = createSignalAdapter({ signal, computed, effect, batch: r, peek, isSignal, isComputed });
function createStateContainer() {
  const scope = new Scope('state');
  function state(definition) {
    const shape = {};
    for (const [name, value] of Object.entries(definition)) {
      shape[name] = typeof value === 'function' ? state.computed(() => value(shape)) : state.signal(value);
    }
    return shape;
  }
  state.signal = signal;
  state.computed = fn => {
    const value = computed(fn);
    scope.own(value.dispose);
    return value;
  };
  state.effect = fn => effect(fn, scope);
  state.own = disposer => scope.own(disposer);
  state.dispose = () => scope.dispose();
  Object.defineProperty(state, 'disposed', { get: () => scope.disposed });
  return state;
}

class Binding {
  constructor(scope) { this.scope = scope; this.source = signal(undefined); }
  wire(value) {
    this.source(value);
    effect(() => this.apply(this.source()), this.scope);
  }
  updateSource(value) { this.source(value); }
  dispose() { this.scope.dispose(); }
}
class ValueBinding extends Binding {
  constructor(scope, element, name) { super(scope); this.element = element; this.name = name; }
  apply(source) { this.set(readValue(source)); }
}

// ------------------------------------------------------------
// Markers - create,  extract, and pattern for `__glint_<index>__`
// ------------------------------------------------------------

const markerPattern = /__glint_(\d+)__/g;

const createMarker = (index) => `__glint_${index}__`;

const extractMarkers = (str) =>
  Array.from(str.matchAll(markerPattern), (match) => ({
    full: match.at(0),
    index: Number(match.at(1)),
    start: match.index,
  }));

const caches = new WeakMap();
/** Cache by document, template literal identity, and namespace. */
function analyzeTemplate(result, doc = document) {
  let cache = caches.get(doc);
  if (!cache) caches.set(doc, cache = new WeakMap());
  let kinds = cache.get(result.strings);
  if (!kinds) cache.set(result.strings, kinds = new Map());
  if (kinds.has(result.kind)) return kinds.get(result.kind);
  let markup = '';
  const names = new Map();
  for (let index = 0; index < result.values.length; index++) {
    markup += result.strings[index];
    const context = openingContext(markup);
    if (context.inTag) {
      const assignment = context.text.match(/([^\s<>="']+)\s*=\s*(?:["'][^"']*)?$/);
      if (assignment) {
        names.set(index, assignment[1]);
        markup += createMarker(index);
      } else {
        if (!/\s$/.test(markup) || context.quote) throw new Error('Dynamic tag names and attribute names are unsupported');
        markup += ` glint-ref-${index}="" `;
      }
    } else markup += createMarker(index);
  }
  markup += result.strings.at(-1);
  const template = doc.createElement('template');
  const wrapper = result.kind === 'svg' ? 'svg' : result.kind === 'mathml' ? 'math' : null;
  template.innerHTML = wrapper ? `<${wrapper}>${markup}</${wrapper}>` : markup;
  const plan = { template, wrapper, names };
  kinds.set(result.kind, plan);
  return plan;
}
// Scan accumulated markup rather than just the most recent literal chunk.
function openingContext(markup) {
  let inTag = false;
  let quote = null;
  let start = 0;
  let comment = false;
  for (let i = 0; i < markup.length; i++) {
    const char = markup[i];
    if (comment) { if (markup.slice(i, i + 3) === '-->') { comment = false; i += 2; } continue; }
    if (!inTag && markup.slice(i, i + 4) === '<!--') { comment = true; i += 3; continue; }
    if (quote) { if (char === quote) quote = null; continue; }
    if (inTag && (char === '"' || char === "'")) quote = char;
    else if (char === '<') { inTag = true; start = i; }
    else if (char === '>') inTag = false;
  }
  return { inTag, quote, text: markup.slice(start) };
}
function extractKey(result) {
  const plan = analyzeTemplate(result);
  const root = plan.wrapper ? plan.template.content.firstElementChild?.firstElementChild : plan.template.content.firstElementChild;
  const raw = root?.getAttribute('key');
  if (raw == null) return undefined;
  const markers = extractMarkers(raw);
  return markers.length === 1 && markers[0].full === raw ? result.values[markers[0].index] : raw;
}

class AttrPart extends ValueBinding {
  set(value) {
    if (value == null || value === false) this.element.removeAttribute(this.name);
    else this.element.setAttribute(this.name, value === true ? '' : String(value));
  }
}
class BooleanAttrPart extends ValueBinding {
  set(value) { this.element.toggleAttribute(this.name, Boolean(value)); }
}

class PropPart extends ValueBinding {
  set(value) { this.element[this.name] = value; }
}

class EventPart extends Binding {
  constructor(scope, element, name) {
    super(scope);
    this.element = element;
    this.name = name;
    this.current = null;
    scope.own(() => this.remove());
  }
  remove() {
    if (this.current) this.element.removeEventListener(this.name, this.current);
    this.current = null;
  }
  apply(source) {
    const handler = isSignal(source) ? source() : source;
    this.remove();
    if (typeof handler === 'function' || typeof handler?.handleEvent === 'function') {
      this.current = handler;
      this.element.addEventListener(this.name, handler);
    }
  }
}

class InterpolatedAttrPart extends Binding {
  constructor(scope, element, name, segments) {
    super(scope);
    this.element = element;
    this.name = name;
    this.segments = segments;
  }
  apply(values) {
    const result = this.segments.map(segment => {
      if (typeof segment === 'string') return segment;
      const value = readValue(values[segment.index]);
      return value == null || value === false ? '' : String(value);
    }).join('');
    this.element.setAttribute(this.name, result);
  }
}

class RefPart extends Binding {
  constructor(scope, element) {
    super(scope);
    this.element = element;
    this.current = null;
    scope.own(() => this.clear());
  }
  clear() {
    if (this.current?.current === this.element) this.current.current = null;
    this.current = null;
  }
  apply(ref) {
    this.clear();
    if (ref?.__glintRef) { ref.current = this.element; this.current = ref; }
    else throw new TypeError('Element expressions require a ref created by ref()');
  }
}
const ref = () => ({ __glintRef: true, current: null });

function instantiateTemplate(result, scope, doc, createNodePart) {
  if (!isTemplateResult(result)) throw new TypeError('Expected a Glint template result');
  if (scope.disposed) throw new Error('Cannot mount into a disposed scope');
  const plan = analyzeTemplate(result, doc);
  const fragment = doc.importNode(plan.template.content, true);
  const slots = [];
  const walker = doc.createTreeWalker(fragment, 1 | 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  try {
    for (const node of nodes) {
      if (node.nodeType === 3) {
        const markers = extractMarkers(node.data);
        if (!markers.length) continue;
        let offset = 0;
        for (const marker of markers) {
          node.before(doc.createTextNode(node.data.slice(offset, marker.start)));
          const start = doc.createComment('gl:start');
          const end = doc.createComment('gl:end');
          node.before(start, end);
          const binding = createNodePart(scope.child('expression'), start, end);
          binding.wire(result.values[marker.index]);
          slots.push({ binding, index: marker.index });
          offset = marker.start + marker.full.length;
        }
        node.before(doc.createTextNode(node.data.slice(offset)));
        node.remove();
      } else {
        for (const attr of [...node.attributes]) {
          if (attr.name.startsWith('glint-ref-')) {
            const index = Number(attr.name.slice(10));
            node.removeAttribute(attr.name);
            const binding = new RefPart(scope.child('ref'), node);
            binding.wire(result.values[index]);
            slots.push({ binding, index });
            continue;
          }
          const markers = extractMarkers(attr.value);
          if (!markers.length) continue;
          node.removeAttribute(attr.name);
          const name = plan.names.get(markers[0].index) ?? attr.name;
          if (name === 'key') continue;
          const single = markers.length === 1 && markers[0].full === attr.value;
          let binding;
          if (name.startsWith('@') || name.startsWith('on')) binding = new EventPart(scope.child('event'), node, name.startsWith('@') ? name.slice(1) : name.slice(2));
          else if (name.startsWith('.') || name.startsWith(':')) binding = new PropPart(scope.child('property'), node, name.slice(1));
          else if (name.startsWith('?')) binding = new BooleanAttrPart(scope.child('boolean'), node, name.slice(1));
          else if (single) binding = new AttrPart(scope.child('attribute'), node, name);
          else {
            const segments = [];
            let offset = 0;
            for (const marker of markers) {
              segments.push(attr.value.slice(offset, marker.start), { index: marker.index });
              offset = marker.start + marker.full.length;
            }
            segments.push(attr.value.slice(offset));
            binding = new InterpolatedAttrPart(scope.child('interpolated attribute'), node, name, segments);
            binding.wire(result.values);
            slots.push({ binding, all: true });
            continue;
          }
          if (!single) throw new Error(`Binding ${name} requires one expression`);
          binding.wire(result.values[markers[0].index]);
          slots.push({ binding, index: markers[0].index });
        }
      }
    }
  } catch (error) { scope.dispose(); throw error; }
  let out = fragment;
  if (plan.wrapper) {
    out = doc.createDocumentFragment();
    const wrapper = fragment.firstElementChild;
    while (wrapper.firstChild) out.append(wrapper.firstChild);
  }
  return {
    fragment: out,
    update(next) {
      if (!isTemplateResult(next) || next.kind !== result.kind || next.strings !== result.strings) return false;
      result = next;
      r(() => { for (const slot of slots) slot.binding.updateSource(slot.all ? result.values : result.values[slot.index]); });
      return true;
    },
    dispose: () => scope.dispose(),
  };
}

const STRUCTURAL = Symbol('glint.structural');
const isStructural = value => Boolean(value?.[STRUCTURAL]);
function each(items, keyOrView, maybeView) {
  const keyed = typeof maybeView === 'function';
  return { [STRUCTURAL]: true, kind: 'each', items, key: keyed ? keyOrView : null, view: keyed ? maybeView : keyOrView };
}
// Explicit compatibility path for the repository's former raw-item callbacks.
each.value = (items, keyOrView, maybeView) => ({ ...each(items, keyOrView, maybeView), rawItems: true });
const when = (condition, yes, no = null) => ({ [STRUCTURAL]: true, kind: 'when', condition, yes, no });
const match = (value, cases) => ({ [STRUCTURAL]: true, kind: 'match', value, cases });
const callView = (view, ...args) => typeof view === 'function' ? view(...args) : view;

function clearBetween(start, end) {
  let node = start.nextSibling;
  while (node && node !== end) { const next = node.nextSibling; node.remove(); node = next; }
}
function moveRange(start, end, before) {
  if (end.nextSibling === before) return;
  const parent = before.parentNode;
  let node = start;
  const stop = end.nextSibling;
  while (node && node !== stop) {
    const next = node.nextSibling;
    parent.insertBefore(node, before);
    node = next;
  }
}

const isIterable = value => value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function' && !isTemplateResult(value);
function flatten(value) {
  return isIterable(value) ? Array.from(value).flatMap(flatten) : [value];
}
/** Both array expressions and each() use the same range reconciliation. */
class ListPart {
  constructor(scope, start, end, NodePart) {
    this.scope = scope;
    this.start = start;
    this.end = end;
    this.NodePart = NodePart;
    this.records = new Map();
    this.positions = [];
  }
  sync(value, spec = null) {
    const list = spec ? Array.from(value ?? []) : flatten(value).filter(item => item != null && item !== false);
    const keys = list.map((item, index) => {
      if (spec?.key) return spec.key(item, index);
      if (spec) {
        if (item != null && (typeof item === 'object' || typeof item === 'function')) {
          warn('object items in each(...) require a key function; using positional ownership');
          return index;
        }
        return item;
      }
      if (isTemplateResult(item)) {
        const key = readValue(extractKey(item));
        if (key !== undefined) return key;
        warn('array child template has no key; using positional ownership');
      }
      // Symbols prevent explicit keys from colliding with positional indexes.
      return this.positions[index] ??= Symbol(index);
    });
    const nextKeys = new Set(keys);
    if (nextKeys.size !== keys.length) throw new Error('Duplicate key in list expression');
    r(() => {
      let before = this.end;
      for (let index = list.length - 1; index >= 0; index--) {
        const item = list[index];
        const key = keys[index];
        let record = this.records.get(key);
        if (!record) {
          const scope = this.scope.child('list item');
          const start = this.end.ownerDocument.createComment('gl:key:start');
          const end = this.end.ownerDocument.createComment('gl:key:end');
          this.end.parentNode.insertBefore(start, this.end);
          this.end.parentNode.insertBefore(end, this.end);
          const part = new this.NodePart(scope, start, end);
          record = { key, scope, start, end, part, item: signal(item), index: signal(index) };
          this.records.set(key, record);
          if (spec && !spec.rawItems) {
            record.view = spec.view;
            // Run row construction once; reactive item/index accessors survive updates.
            part.wire(n(() => callView(spec.view, record.item, record.index)));
          }
        }
        record.item(item);
        record.index(index);
        if (!spec) record.part.updateSource(item);
        else if (spec.rawItems) record.part.updateSource(n(() => callView(spec.view, item, index)));
        else if (record.view !== spec.view) {
          record.view = spec.view;
          record.part.updateSource(n(() => callView(spec.view, record.item, record.index)));
        }
        if (!record.part.started) record.part.wire(!spec ? item : callView(spec.view, item, index));
        moveRange(record.start, record.end, before);
        before = record.start;
      }
      for (const [key, record] of this.records) {
        if (!nextKeys.has(key)) { this.remove(record); this.records.delete(key); }
      }
    });
  }
  remove(record) {
    record.scope.dispose();
    clearBetween(record.start, record.end);
    record.start.remove();
    record.end.remove();
  }
  dispose() {
    for (const record of this.records.values()) this.remove(record);
    this.records.clear();
    this.scope.dispose();
  }
}

class StructuralPart extends Binding {
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
    this.content.wire(n(() => callView(view, key)));
  }
  dispose() {
    this.list?.dispose();
    this.content?.dispose();
    super.dispose();
  }
}

class NodePart extends Binding {
  constructor(scope, start, end) {
    super(scope);
    this.start = start;
    this.end = end;
    this.mode = null;
    scope.own(() => this.reset());
  }
  wire(value) { this.started = true; super.wire(value); }
  apply(source) {
    const value = readValue(source);
    // Parent expressions should not subscribe to reads while wiring child effects.
    n(() => this.set(value));
  }
  reset() {
    this.child?.dispose();
    this.child = null;
    this.innerScope?.dispose();
    this.innerScope = null;
    this.instance = null;
    this.text = null;
    this.node = null;
    clearBetween(this.start, this.end);
  }
  switchMode(mode) {
    if (mode === this.mode) return;
    this.reset();
    this.mode = mode;
  }
  set(value) {
    if (isStructural(value)) {
      this.switchMode(`structural:${value.kind}`);
      if (!this.child) this.child = new StructuralPart(this.scope.child(value.kind), this.start, this.end, value.kind, NodePart);
      if (!this.child.started) { this.child.started = true; this.child.wire(value); }
      else this.child.updateSource(value);
    } else if (isIterable(value)) {
      this.switchMode('array');
      if (!this.child) this.child = new ListPart(this.scope.child('array'), this.start, this.end, NodePart);
      this.child.sync(value);
    } else if (isTemplateResult(value)) {
      this.switchMode('template');
      if (this.instance?.update(value)) return;
      this.reset();
      this.innerScope = this.scope.child('template');
      this.instance = instantiateTemplate(value, this.innerScope, this.end.ownerDocument, (scope, start, end) => new NodePart(scope, start, end));
      this.end.parentNode.insertBefore(this.instance.fragment, this.end);
    } else if (value?.nodeType) {
      this.switchMode('node');
      if (this.node !== value) { clearBetween(this.start, this.end); this.end.parentNode.insertBefore(value, this.end); this.node = value; }
    } else {
      this.switchMode('primitive');
      if (value && typeof value === 'object') { warn('plain objects are not mountable; map them to templates or primitives', value); value = null; }
      const text = value == null || value === false ? '' : String(value);
      if (!this.text) { this.text = this.end.ownerDocument.createTextNode(text); this.end.parentNode.insertBefore(this.text, this.end); }
      else if (this.text.data !== text) this.text.data = text;
    }
  }
}

const mounted = new WeakMap();
/** Mount once, then update in place. The returned handle owns the entire view. */
function mount(target, value) {
  target = typeof target === 'string' ? document.querySelector(target) : target ?? document.body;
  if (!target) throw new Error('Glint mount target not found');
  mounted.get(target)?.dispose();
  const scope = new Scope('mount');
  const start = target.ownerDocument.createComment('gl:mount:start');
  const end = target.ownerDocument.createComment('gl:mount:end');
  target.replaceChildren(start, end);
  const part = new NodePart(scope, start, end);
  const handle = {
    update(next) { if (scope.disposed) throw new Error('Cannot update a disposed mount'); part.updateSource(next); },
    dispose() {
      if (scope.disposed) return;
      try { scope.dispose(); } finally {
        start.remove(); end.remove();
        if (mounted.get(target) === handle) mounted.delete(target);
      }
    },
    get disposed() { return scope.disposed; },
  };
  mounted.set(target, handle);
  try { part.wire(value); } catch (error) { handle.dispose(); throw error; }
  return handle;
}
function unmount(target) {
  target = typeof target === 'string' ? document.querySelector(target) : target;
  mounted.get(target)?.dispose();
}

const safeParse = (v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};

const iif = (condition, consequent, alternative) =>
  condition ? consequent : alternative;

function propsFor(element) {
  const props = Object.create(null);
  for (const name of element.getAttributeNames()) {
    const raw = element.getAttribute(name);
    let value = raw === '' ? true : safeParse(raw);
    if (value === raw && raw.trim() !== '' && !Number.isNaN(Number(raw))) value = Number(raw);
    props[name] = value;
    props[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return props;
}

const __DEV__ =
  typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true;

/**
 * Internal logging helper functions
 */

// Filter out null/undefined lines for the purposes of logging messages
const lines = (...xs) => xs.filter(x => x != null);

/**
 * Warnings emitted during development to help guide correct usage.
 */


const MESSAGES = Object.freeze({
  SIGNAL_OUTSIDE_CONTAINER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Signal created without a state container owner',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This signal was created outside of a component or model.',
        'It will not be automatically cleaned up and may outlive its intended scope.'
      )
    }
  },

  COMPONENT_ALREADY_DEFINED: {
    kind: 'warn',
    category: 'component',
    summary: 'Component already defined',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `The component "${name}" has already been defined in the custom elements registry.`,
        'Subsequent definitions are ignored.'
      )
    }
  },

  COMPUTED_OUTSIDE_CONTAINER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Computed created without a state container owner',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This computed value was created outside of a component or model.',
        'If it depends on signals, its lifetime may be unclear.'
      )
    }
  },

  MODEL_EFFECT_WITHOUT_OWNER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Effect created without an owning container',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This effect has no owning state container.',
        'It may continue running after the model is no longer in use.'
      )
    }
  },

  MODEL_FACTORY_HAS_PARAMS: {
    kind: 'warn',
    category: 'model',
    summary: 'Model factory expects arguments',

    validate({ arity }) {
      if (typeof arity !== 'number') {
        return 'Expected numeric "arity"'
      }
    },

    format({ name = null, arity }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'Model factories must be pure functions with zero arity.',
        `This factory${iif(name, ` (${name})`, '')} declares ${arity} parameter(s).`,
        'If you need component ownership, use model.owned(() => { ... })',
        'and pass ctx at instantiation time.'
      )
    }
  },

  SHARED_MODEL_KEY_COLLISION: {
    kind: 'warn',
    category: 'model',
    summary: 'Shared model key reused for a different model',

    validate({ key }) {
      if (key == null) {
        return 'Expected "key"'
      }
    },

    format({ key }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `A shared model already exists for key "${key}".`,
        'Reusing keys across different models can cause unexpected state sharing.'
      )
    }
  },

  SHARED_MODEL_DYNAMIC_KEY: {
    kind: 'warn',
    category: 'state',
    summary: 'model.shared() called with unstable key',

    validate({ key }) {
      if (key == null) {
        return 'Expected "key"'
      }
    },

    format({ key }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.shared() requires a stable, deterministic key.',
        `The provided key ${String(key)} may change between calls.`
      )
    }
  },

  MODEL_CREATES_CONTAINER_IMPLICITLY: {
    kind: 'warn',
    category: 'state',
    summary: 'Model created its own state container',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This model created a state container implicitly.',
        'If ownership matters, consider creating the container explicitly instead.'
      )
    }
  },

  MULTIPLE_CONTAINERS_IN_MODEL: {
    kind: 'warn',
    category: 'state',
    summary: 'Multiple state containers created in a single model',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This model created more than one state container.',
        'This can make ownership and cleanup harder to reason about.'
      )
    }
  },

  MODEL_OWNED_WITHOUT_CONTEXT: {
    kind: 'warn',
    category: 'model',
    summary: 'model.owned() called without a context',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.owned() was called without a context.',
        'This may cause ownership and cleanup to function incorrectly.'
      )
    }
  },

  MODEL_SHARED_WITHOUT_KEY: {
    kind: 'warn',
    category: 'model',
    summary: 'model.shared() called without a key',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.shared() requires an explicit key to define its sharing boundary.',
        'Without one, the model cannot be safely reused.'
      )
    }
  },

  STATE_CONTAINER_UNUSED: {
    kind: 'warn',
    category: 'state',
    summary: 'State container created but never used',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'A state container was created but no state or computed values were added.',
        'This may be leftover scaffolding.'
      )
    }
  },

  VALIDITY_WITHOUT_FORM_VALUE: {
    kind: 'warn',
    category: 'element-internals',
    summary: 'setValidity called before setFormValue',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `In the form-associated custom element "${name}", setValidity was called before setFormValue.`,
        'This may lead to unexpected behavior in some browsers.'
      )
    }
  },

  INTERNALS_WITHOUT_FORM_ASSOCIATION: {
    kind: 'warn',
    category: 'element-internals',
    summary: 'attachInternals called on non-form-associated custom element',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `The custom element "${name}" is not form-associated, but attachInternals was called.`,
        'Element internals are only supported on form-associated custom elements.'
      )
    }
  },

  INTERNALS_UNUSED: {
    kind: 'warn',
    category: 'element-internals',
    summary: 'ElementInternals created but never used',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `The ElementInternals for the custom element "${name}" were created but never used.`,
        'If internals are not needed, consider omitting attachInternals calls.'
      )
    }
  },

  INTERNALS_UNSUPPORTED: {
    kind: 'warn',
    category: 'element-internals',
    summary: 'attachInternals called in unsupported environment',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `The custom element "${name}" called attachInternals, but the environment does not support it.`,
        'Element internals may not be available in all browsers.'
      )
    }
  },
});

const STYLE_MAP = Object.freeze({
  // modifiers
  bold: 'font-weight:700;',
  italic: 'font-style:italic;',
  underline: 'text-decoration:underline;',
  dim: 'opacity:.65;',
  code: 'font-family:monospace;',

  // colors
  black: 'color:#000;',
  red: 'color:#f00;',
  green: 'color:#0a0;',
  yellow: 'color:#aa0;',
  blue: 'color:#00f;',
  magenta: 'color:#f0f;',
  cyan: 'color:#0ff;',
  white: 'color:#fff;',
  gray: 'color:#808080;',
  grey: 'color:#808080;',

  // backgrounds
  bgBlack: 'background:#000;',
  bgRed: 'background:#f00;',
  bgGreen: 'background:#0a0;',
  bgYellow: 'background:#aa0;',
  bgBlue: 'background:#00f;',
  bgMagenta: 'background:#f0f;',
  bgCyan: 'background:#0ff;',
  bgWhite: 'background:#fff;',
  bgGray: 'background:#808080;',
  bgGrey: 'background:#808080;'
});

// Chalky returns *style intents*, not strings.
// Each invocation produces a plain object describing intent.
function createChalky(activeStyles = []) {
  return new Proxy(
    // Invocation: chalky.bold('text')
    function chalk(text) {
      return {
        __styleIntent: true,
        styleHints: activeStyles,
        text,
      }
    },
    {
      // Property access: chalky.bold.dim.italic
      get(_, prop) {
        if (!(prop in STYLE_MAP)) return undefined
        return createChalky([...activeStyles, STYLE_MAP[prop]])
      }
    }
  )
}

// Public chalky instance
const chalky = createChalky();

// ---------------------------------------------------------------------------
// Companion helpers expected by the architecture
// ---------------------------------------------------------------------------

function mergeFragments(prefix, fragment) {
  return {
    text: prefix.text + fragment.text,
    styleHints: [
      ...(prefix.styleHints ?? []),
      ...(fragment.styleHints ?? [])
    ]
  }
}

// Frame fragments with a prefix, conditionally
function frameFragments(fragments, prefixFragment) {
  if (!fragments.length) return fragments

  const [first, ...rest] = fragments;

  return [
    mergeFragments(prefixFragment, first),
    ...rest
  ]
}

function normalizeStyleIntents(values) {
  return values.flatMap((value) => {
    if (typeof value === 'string') {
      return [{ text: value, styleHints: null }]
    }

    if (value && value.__styleIntent) {
      return [{ text: value.text, styleHints: value.styleHints }]
    }

    return []
  })
}

// Render %c-based console log arguments from framed fragments
function render(fragments) {
  const { text, styles } = fragments.reduce(
    (acc, frag) => {
      if (!frag.styleHints) {
        acc.text += frag.text;
        return acc
      }

      acc.text += `%c${frag.text}%c`;
      acc.styles.push(frag.styleHints.join(' '), '');
      return acc
    },
    { text: '', styles: [] }
  );

  return [text, ...styles]
}

function emit(code, payload) {
  if (!__DEV__ || !getConfig().diagnostics) return

  const msg = MESSAGES[code];

  if (!msg) {
    console.warn(`[glint] Unknown message code "${code}". This is likely a framework bug.`);
    return
  }

  if (msg.validate) {
    const error = msg.validate(payload);
    if (error) {
      console.warn(`[glint] Invalid payload for message "${code}": ${error}`);
      return
    }
  }

  const values = msg.format(payload, { chalky });
  const fragments = normalizeStyleIntents(values);
  const framed = frameFragments(fragments, chalky.dim('[glint] '));
  const args = render(framed);

  console[msg.kind](...args);
}

function createInternalsController(host, Component) {
  let internals = null;
  let requested = false;
  let didSetFormValue = false;
  let didSetValidity = false;

  const name = Component.is || Component.name;

  function attach() {
    internals = host.attachInternals();

    if (!__DEV__) return internals;

    const _setFormValue = internals.setFormValue?.bind(internals);
    const _setValidity = internals.setValidity?.bind(internals);

    internals.setFormValue = (...args) => {
      didSetFormValue = true;
      return _setFormValue?.(...args);
    };

    internals.setValidity = (...args) => {
      didSetValidity = true;

      if (!didSetFormValue) {
        emit('VALIDITY_WITHOUT_FORM_VALUE', { name });
      }

      return _setValidity?.(...args);
    };

    return internals;
  }

  function get() {
    requested = true;

    if (typeof host.attachInternals !== 'function') {
      emit('INTERNALS_UNSUPPORTED', { name });
      return null;
    }

    if (__DEV__) {
      if (!Component.formAssociated) {
        emit('INTERNALS_WITHOUT_FORM_ASSOCIATION', { name });
      }

      if (typeof host.attachInternals !== 'function') {
        emit('INTERNALS_UNSUPPORTED', { name });
        return null;
      }
    }

    if (!internals) attach();
    return internals;
  }

  function audit() {
    if (
      !requested ||
      !internals ||
      didSetFormValue ||
      didSetValidity
    ) return;

    emit('INTERNALS_UNUSED', { name });
  }

  return { get, audit };
}

function componentClass(definition, options) {
  // Delaying access to HTMLElement lets reactivity be imported without a DOM.
  return class GlintElement extends HTMLElement {
    static formAssociated = Boolean(options.formAssociated);
    constructor() {
      super();
      this.__target = options.useShadow ? this.attachShadow({ mode: 'open' }) : this;
      this.__runtime = null;
    }
    connectedCallback() {
      if (this.__runtime && !this.__runtime.scope.disposed) return;
      const scope = new Scope('component');
      const state = createStateContainer();
      scope.own(() => state.dispose());
      const version = signal(0);
      const hooks = { connected: [], disconnected: [] };
      const internals = createInternalsController(this, this.constructor);
      const ctx = {
        el: this, element: this, root: this.__target, state,
        get props() { version(); return propsFor(ctx.element); },
        effect: fn => state.effect(fn),
        own: disposer => scope.own(disposer),
        connected: fn => hooks.connected.push(fn),
        disconnected: fn => hooks.disconnected.push(fn),
        onMount: fn => hooks.connected.push(fn),
        onDestroy: fn => hooks.disconnected.push(fn),
        ref, internals: internals.get,
        emit: (name, detail, eventOptions = {}) => {
          const Event = this.ownerDocument.defaultView.CustomEvent;
          const event = new Event(name, { detail, bubbles: true, composed: true, ...eventOptions });
          this.dispatchEvent(event);
          return event;
        },
      };
      this.__runtime = { scope, state, hooks, ctx };
      this.ctx = ctx;
      this.state = state;
      const Observer = this.ownerDocument.defaultView.MutationObserver;
      const observer = new Observer(() => version(version.peek() + 1));
      scope.own(() => observer.disconnect());
      const frame = beginConstructionDiagnostics(this.localName);
      let value;
      try {
        value = n(() => {
          if (typeof definition === 'function') return definition(ctx);
          const local = typeof definition.setup === 'function' ? definition.setup(ctx) : {};
          return definition.view(ctx, local);
        });
      } catch (error) {
        scope.dispose();
        throw error;
      } finally { endConstructionDiagnostics(frame); }
      try {
        const view = mount(this.__target, value);
        scope.own(() => view.dispose());
        observer.observe(this, { attributes: true });
        for (const hook of hooks.connected) hook();
      } catch (error) { scope.dispose(); throw error; }
    }
    disconnectedCallback() {
      const runtime = this.__runtime;
      // Native range moves invoke disconnect/connect. Preserve runtime identity
      // for moves within a document, but dispose real removals after this turn.
      queueMicrotask(() => {
        if (this.isConnected || runtime !== this.__runtime || runtime?.scope.disposed) return;
        try {
          for (const hook of runtime.hooks.disconnected) hook();
        } finally { runtime.scope.dispose(); }
      });
    }
    emit(name, detail, options) { return this.ctx.emit(name, detail, options); }
  };
}
function define(name, definition, options = {}) {
  if (typeof definition !== 'function' && typeof definition?.view !== 'function') throw new TypeError('define expects a function or { setup, view }');
  const existing = customElements.get(name);
  if (existing) { warn('component already defined', name); return existing; }
  const Component = componentClass(definition, { useShadow: false, ...options });
  // Invalid names and platform registration errors must remain actionable.
  customElements.define(name, Component);
  return Component;
}
define.shadow = (name, definition, options = {}) => define(name, definition, { ...options, useShadow: true });
define.light = (name, definition, options = {}) => define(name, definition, { ...options, useShadow: false });

const sharedModels = new Map();
function validate(factory) {
  if (typeof factory !== 'function') throw new TypeError('model(factory) expects a function');
  return factory;
}
function model(factory) {
  validate(factory);
  return function useModel(state) {
    if (!state) { warn('Pass ctx.state to model() to own its resources'); state = createStateContainer(); }
    return factory(state);
  };
}
model.owned = factory => {
  validate(factory);
  return ctx => {
    if (!ctx?.state) throw new TypeError('model.owned requires a component context');
    const instance = factory(ctx.state);
    if (typeof instance?.dispose === 'function') ctx.state.own(() => instance.dispose());
    return instance;
  };
};
model.shared = (key, factory) => {
  validate(factory);
  return () => {
    if (!sharedModels.has(key)) {
      const state = createStateContainer();
      try { sharedModels.set(key, { state, instance: factory(state) }); }
      catch (error) { state.dispose(); throw error; }
    }
    return sharedModels.get(key).instance;
  };
};
model.disposeShared = key => {
  const shared = sharedModels.get(key);
  if (!shared) return;
  sharedModels.delete(key);
  try { shared.instance?.dispose?.(); } finally { shared.state.dispose(); }
};

var Glint = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TemplateResult: TemplateResult,
  batch: r,
  beginConstructionDiagnostics: beginConstructionDiagnostics,
  computed: computed,
  configure: configure,
  createSignalAdapter: createSignalAdapter,
  createStateContainer: createStateContainer,
  define: define,
  each: each,
  effect: effect,
  endConstructionDiagnostics: endConstructionDiagnostics,
  getConfig: getConfig,
  html: html,
  isComputed: isComputed,
  isSignal: isSignal,
  isStructural: isStructural,
  isTemplateResult: isTemplateResult,
  match: match,
  mathml: mathml,
  model: model,
  mount: mount,
  peek: peek,
  ref: ref,
  signal: signal,
  svg: svg,
  tc39Signals: tc39Signals,
  unmount: unmount,
  warn: warn,
  when: when
});

// Global registration is confined to the explicitly requested demo build.
if (typeof window !== 'undefined') window.Glint = Glint;

export { TemplateResult, r as batch, beginConstructionDiagnostics, computed, configure, createSignalAdapter, createStateContainer, define, each, effect, endConstructionDiagnostics, getConfig, html, isComputed, isSignal, isStructural, isTemplateResult, match, mathml, model, mount, peek, ref, signal, svg, tc39Signals, unmount, warn, when };
