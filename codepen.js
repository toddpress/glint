// ============================================================
//  Glint MVP – CodePen v0.0.4
// ============================================================


import {
  signal as _preactSignal,
  computed as _preactComputed,
  effect as _preactEffect,
  batch as _preactBatch
} from "https://esm.sh/@preact/signals-core@1.12.1";

class State {
  constructor(initial) {
    this._s = _preactSignal(initial);
  }

  get() {
    return this._s.value;
  }

  set(value) {
    this._s.value = value;
    return value;
  }

  get value() {
    return this._s.value;
  }

  set value(v) {
    this._s.value = v;
  }

  subscribe(listener) {
    return _preactEffect(() => listener(this._s.value));
  }
}

class Computed {
  constructor(fn) {
    this._s = _preactComputed(fn);
  }

  get() {
    return this._s.value;
  }

  get value() {
    return this._s.value;
  }

  set(_) {
    throw new Error('Cannot directly set a Computed signal.');
  }
}

const subtle = {
  get(target) {
    if (target instanceof State || target instanceof Computed) {
      return target._s.peek();
    }
    throw new TypeError('Signal.subtle.get: unsupported target');
  },
  set(target, value) {
    if (target instanceof State) {
      target.set(value);
      return value;
    }
    throw new TypeError('Signal.subtle.set: not writable');
  },
};

const Signal = {
  State,
  Computed,
  effect: _preactEffect,
  batch: _preactBatch,
  subtle,
};

// ------------------------------------------------------------
// 2. Core signal wrapper & helpers
// ------------------------------------------------------------
function wrap(base, { customSetter = null } = {}) {
  const isComputedBase = base instanceof Signal.Computed;

  function accessor(next) {
    if (arguments.length === 0) return base.get();

    if (isComputedBase) {
      throw new Error('Cannot set a computed signal');
    }

    if (customSetter) {
      return customSetter(next);
    }

    return base.set(next);
  }

  accessor.get = () => base.get();
  accessor.peek = () => Signal.subtle.get(base);
  accessor.subscribe = (fn) => base.subscribe(fn);

  if (!isComputedBase) {
    accessor.set = (v) =>
      customSetter ? customSetter(v) : base.set(v);
  }

  accessor.__tc39 = base;
  accessor.__isSignal = true;
  accessor.__isComputed = isComputedBase;
  accessor.__isState = !isComputedBase;

  return accessor;
}

const isSignal = (s) => s?.__isSignal === true;
const isComputed = (s) => s?.__isComputed === true;

const isPrimitive = (v) =>
  v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

const isTemplate = (t) => t?.__template === true;
const isFragment = (f) => f?.__fragment === true;

// Auto-unwrap signals/computed anywhere we deliberately read a value
function unwrapOne(v) {
  if (isSignal(v) || isComputed(v)) return v();
  return v;
}

function safeParse(str) {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// ------------------------------------------------------------
// 3. Templating engine (html, templates, Parts)
// ------------------------------------------------------------

// html`...`
function html(strings, ...exprs) {
  const values = exprs.map((expr) => () => expr);
  return { __template: true, strings, values };
}

// Template compilation cache
const templateCache = new WeakMap();

/**
 * We use a single marker format for expressions:
 *   __glint_<index>__
 *
 * During instantiation:
 *   - Text markers are split into text + comment anchors (NodePart).
 *   - Attribute markers are parsed into AttrPart or InterpolatedAttrPart.
 */
function compileTemplate(strings, valueCount) {
  let htmlString = '';

  for (let i = 0; i < strings.length; i++) {
    htmlString += strings[i];
    if (i < valueCount) {
      htmlString += `__glint_${i}__`;
    }
  }

  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString;

  return { fragment: tpl.content };
}

function getCompiled(strings, valueCount) {
  let compiled = templateCache.get(strings);
  if (!compiled) {
    compiled = compileTemplate(strings, valueCount);
    templateCache.set(strings, compiled);
  }
  return compiled;
}

// ---------------------
// Parts
// ---------------------

class NodePart {
  constructor(marker, ctxEffect) {
    this.marker = marker;
    this.ctxEffect = ctxEffect;
    this.nodes = [];
  }

  update(getter) {
    this.nodes.forEach((n) => n.remove());
    this.nodes = [];

    let value = getter();
    value = unwrapOne(value);

    if (
      typeof value === 'function' &&
      !isSignal(value) &&
      !isComputed(value)
    ) {
      value = value();
    }

    const parent = this.marker.parentNode;
    if (!parent) return;

    const appendNode = (node) => {
      parent.insertBefore(node, this.marker);
      this.nodes.push(node);
    };

    const handleValue = (val) => {
      val = unwrapOne(val);

      if (
        typeof val === 'function' &&
        !isSignal(val) &&
        !isComputed(val)
      ) {
        val = val();
      }

      if (val == null || val === false) return;

      if (isTemplate(val)) {
        const frag = renderTemplate(val, this.ctxEffect);
        Array.from(frag.childNodes).forEach((child) => appendNode(child));
        return;
      }

      if (isFragment(val)) {
        val.children.forEach(handleValue);
        return;
      }

      if (Array.isArray(val)) {
        val.forEach(handleValue);
        return;
      }

      if (isPrimitive(val)) {
        appendNode(document.createTextNode(String(val)));
        return;
      }

      appendNode(document.createTextNode(String(val)));
    };

    handleValue(value);
  }

  bind(getter) {
    this.ctxEffect(() => {
      this.update(getter);
    });
  }
}

class AttrPart {
  constructor(el, attrName, ctxEffect) {
    this.el = el;
    this.attrName = attrName;
    this.ctxEffect = ctxEffect;
  }

  bind(getter) {
    const el = this.el;
    const attrName = this.attrName;

    this.ctxEffect(() => {
      let val = getter();
      val = unwrapOne(val);

      // Boolean attr semantics: present if truthy, removed if falsy/null
      if (val == null || val === false) {
        el.removeAttribute(attrName);
      } else if (val === true) {
        el.setAttribute(attrName, '');
      } else {
        el.setAttribute(attrName, String(val));
      }
    });
  }
}

class PropPart {
  constructor(el, propName, ctxEffect) {
    this.el = el;
    this.propName = propName;
    this.ctxEffect = ctxEffect;
  }

  bind(getter) {
    const el = this.el;
    const propName = this.propName;

    this.ctxEffect(() => {
      let val = getter();
      val = unwrapOne(val);
      el[propName] = val;
    });
  }
}

class EventPart {
  constructor(el, eventName, ctxEffect) {
    this.el = el;
    this.eventName = eventName;
    this.ctxEffect = ctxEffect;
    this.current = null;
  }

  bind(getter) {
    const el = this.el;
    const eventName = this.eventName;

    this.ctxEffect(() => {
      const v = getter();
      const fn = unwrapOne(v);

      if (this.current) {
        el.removeEventListener(eventName, this.current);
        this.current = null;
      }

      if (typeof fn === 'function') {
        this.current = fn;
        el.addEventListener(eventName, this.current);
      }
    });
  }
}

// NEW: InterpolatedAttrPart – partial dynamic attributes
class InterpolatedAttrPart {
  constructor(el, attrName, segments, ctxEffect) {
    this.el = el;
    this.attrName = attrName;
    this.segments = segments; // [string | getter, ...]
    this.ctxEffect = ctxEffect;
  }

  bind() {
    const el = this.el;
    const name = this.attrName;
    const segments = this.segments;

    this.ctxEffect(() => {
      let result = '';
      // TODO -- Shouldn't this check be the other way around? Check if signal else if string, concat?
      for (const seg of segments) {
        if (typeof seg === 'string') {
          result += seg;
        } else {
          let v = seg();
          v = unwrapOne(v);
          if (v == null || v === false) v = '';
          result += String(v);
        }
      }

      el.setAttribute(name, result);
    });
  }
}

// ---------------------
// renderTemplate
// ---------------------
function renderTemplate(tpl, ctxEffect) {
  if (!isTemplate(tpl)) {
    throw new Error('renderTemplate expected a template.');
  }

  const { strings, values } = tpl;
  const compiled = getCompiled(strings, values.length);
  const fragment = compiled.fragment.cloneNode(true);

  const markerPattern = /__glint_(\d+)__/g;

  // 1) Text markers → split into text + comment anchors
  const textNodes = [];
  const textWalker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_TEXT
  );
  while (textWalker.nextNode()) {
    textNodes.push(textWalker.currentNode);
  }

  const pendingNodeParts = [];

  textNodes.forEach((textNode) => {
    const value = textNode.nodeValue;
    if (!value || value.indexOf('__glint_') === -1) return;

    const parent = textNode.parentNode;
    if (!parent) return;

    const newNodes = [];
    let lastIndex = 0;
    markerPattern.lastIndex = 0;
    let match;

    while ((match = markerPattern.exec(value)) !== null) {
      const full = match[0];
      const index = Number(match[1]);

      const pre = value.slice(lastIndex, match.index);
      if (pre) {
        newNodes.push(document.createTextNode(pre));
      }

      const comment = document.createComment(`gl:${index}`);
      newNodes.push(comment);

      const getter = values[index];
      pendingNodeParts.push({ marker: comment, getter });

      lastIndex = match.index + full.length;
    }

    const tail = value.slice(lastIndex);
    if (tail) {
      newNodes.push(document.createTextNode(tail));
    }

    for (const n of newNodes) {
      parent.insertBefore(n, textNode);
    }
    parent.removeChild(textNode);
  });

  // Bind NodeParts after comment markers exist in the DOM
  pendingNodeParts.forEach(({ marker, getter }) => {
    const part = new NodePart(marker, ctxEffect);
    part.bind(getter);
  });

  // 2) Attr / Prop / Event / InterpolatedAttr parts
  const elWalker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT
  );

  while (elWalker.nextNode()) {
    const el = elWalker.currentNode;

    for (const attr of [...el.attributes]) {
      const rawName = attr.name;
      const rawValue = attr.value;

      if (!rawValue || rawValue.indexOf('__glint_') === -1) continue;

      // Collect all markers in this attribute
      const matches = [];
      markerPattern.lastIndex = 0;
      let m;
      while ((m = markerPattern.exec(rawValue)) !== null) {
        matches.push({
          full: m[0],
          index: Number(m[1]),
          start: m.index,
        });
      }
      if (!matches.length) continue;

      // --- Prop / Event special handling ---
      if (rawName.startsWith(':')) {
        // property binding: :value=${signal}
        const first = matches[0];
        const getter = values[first.index];
        const propName = rawName.slice(1);
        el.removeAttribute(rawName);
        const part = new PropPart(el, propName, ctxEffect);
        part.bind(getter);
        continue;
      }

      if (rawName.startsWith('on')) {
        // event binding: onclick=${fn}
        const first = matches[0];
        const getter = values[first.index];
        const eventName = rawName.slice(2);
        el.removeAttribute(rawName);
        const part = new EventPart(el, eventName, ctxEffect);
        part.bind(getter);
        continue;
      }

      // --- Normal attribute: support full & partial interpolation ---
      el.removeAttribute(rawName);

      // Build segments: static strings + getters
      const segments = [];
      let lastIndex = 0;
      for (const { full, index, start } of matches) {
        const staticText = rawValue.slice(lastIndex, start);
        if (staticText) segments.push(staticText);
        const getter = values[index];
        segments.push(getter);
        lastIndex = start + full.length;
      }
      const tail = rawValue.slice(lastIndex);
      if (tail) segments.push(tail);

      // Pure dynamic attr (boolean semantics etc.)
      if (segments.length === 1 && typeof segments[0] !== 'string') {
        const getter = segments[0];
        const part = new AttrPart(el, rawName, ctxEffect);
        part.bind(getter);
      } else {
        // Mixed static + dynamic → InterpolatedAttrPart
        const part = new InterpolatedAttrPart(el, rawName, segments, ctxEffect);
        part.bind();
      }
    }
  }

  return fragment;
}

// ------------------------------------------------------------
// 4. Component system (BaseComponent, define, registry, render)
// ------------------------------------------------------------

function createStateAPI() {
  function signalFn(v) {
    return wrap(new Signal.State(v));
  }

  function debouncedSignalFn(
      initialValue,
      delay = 300,
      options = { leading: false, trailing: true }
    ) {
      const base = new Signal.State(initialValue);
      const debouncedSetter = debounce(
        (v) => base.set(v),
        delay,
        options
      );

      return wrap(base, { customSetter: debouncedSetter });
    }

  function computedFn(fn) {
    return wrap(new Signal.Computed(fn));
  }

  function defineShape(def) {
    const api = {};
    const temp = {};

    for (const [key, val] of Object.entries(def)) {
      if (typeof val === 'function') {
        temp[key] = null;
      } else {
        const sig = signalFn(val);
        api[key] = sig;
        temp[key] = sig;
      }
    }

    for (const [key, val] of Object.entries(def)) {
      if (typeof val === 'function') {
        const comp = computedFn(() => val(temp));
        api[key] = comp;
        temp[key] = comp;
      }
    }

    return api;
  }

  function state(def) {
    return defineShape(def);
  }

  state.signal = signalFn;
  state.computed = computedFn;
  state.debounced = debouncedSignalFn;

  return state;
}

class BaseComponent extends HTMLElement {
  static renderer = null;
  static options = { useShadow: true };

  props = {};
  hooks = { onMount: [], onDestroy: [] };
  effectsCleanupFns = [];

  #root;
  #renderScheduled = false;

  constructor() {
    super();

    const { useShadow } = this.constructor.options;
    this.#root = useShadow ? this.attachShadow({ mode: 'open' }) : this;

    this.props = this._collectProps();
    this.state = createStateAPI();

    this.ctx = {
      el: this,
      root: this.#root,
      props: this.props,
      state: this.state,
      effect: (fn) => {
        const stop = Signal.effect(() => {
          const cleanup = fn();
          if (typeof cleanup === 'function') {
            this.effectsCleanupFns.push(cleanup);
          }
        });
        this.effectsCleanupFns.push(stop);
      },
      emit: this.emit.bind(this),
      onMount: (fn) => this.hooks.onMount.push(fn),
      onDestroy: (fn) => this.hooks.onDestroy.push(fn),
    };
  }

  connectedCallback() {
    this._render();
    queueMicrotask(() => {
      this.hooks.onMount.forEach((fn) => fn());
    });
  }

  disconnectedCallback() {
    this.hooks.onDestroy.forEach((fn) => fn());
    this.effectsCleanupFns.forEach((fn) => fn?.());
    this.effectsCleanupFns = [];
  }

  emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _collectProps() {
    const out = {};
    for (const attr of this.attributes) {
      out[attr.name] = safeParse(attr.value);
    }
    return out;
  }

  _render() {
    if (this.#renderScheduled) return;
    this.#renderScheduled = true;

    queueMicrotask(() => {
      this.#renderScheduled = false;

      const renderer = this.constructor.renderer;
      if (!renderer) return;

      const tpl = renderer(this.ctx);

      this.#root.innerHTML = '';
      const dom = renderTemplate(
        tpl,
        (fn) => this.ctx.effect(fn)
      );
      this.#root.appendChild(dom);
    });
  }
}

// registry + define + render
const componentRegistry = new Map();

function define(name, renderer, options = {}) {
  const mergedOptions = { ...BaseComponent.options, ...options };
  componentRegistry.set(name, { renderer, options: mergedOptions });
  return { name, renderer, options: mergedOptions };
}

function registerComponent(name, renderer, options) {
  if (customElements.get(name)) return;

  customElements.define(
    name,
    class extends BaseComponent {
      static renderer = renderer;
      static options = options;
    }
  );
}

function registerAllComponents() {
  componentRegistry.forEach(({ renderer, options }, name) => {
    if (!customElements.get(name)) {
      registerComponent(name, renderer, options);
    }
  });
}

function render(AppComponent, { autoRegister = true, rootNode = document.body } = {}) {
  if (autoRegister) registerAllComponents();

  const tpl = AppComponent();

  rootNode.innerHTML = '';
  const dom = renderTemplate(
    tpl,
    (fn) => Signal.effect(fn) // top-level effects
  );
  rootNode.appendChild(dom);
}

// ------------------------------------------------------------
// 5. Helpers (each, when, match)
// ------------------------------------------------------------

function each(source, renderFn) {
  return () => {
    const list =
      isSignal(source) || isComputed(source)
        ? source()
        : source;

    return list.map(renderFn);
  };
}

function when(cond, renderFn) {
  return () => {
    const value =
      isSignal(cond) || isComputed(cond)
        ? cond()
        : cond;

    return value ? renderFn() : [];
  };
}

function match(valueSource, cases) {
  return () => {
    const v =
      isSignal(valueSource) || isComputed(valueSource)
        ? valueSource()
        : valueSource;

    if (v in cases) return cases[v]();
    if ('default' in cases) return cases.default();
    return [];
  };
}

// ------------------------------------------------------------
// 6. Demo components
// ------------------------------------------------------------

// tsp-counter
define('tsp-counter', (ctx) => {
  const state = ctx.state;
  const start = Number(ctx.props.start ?? 0);
  const count = state.signal(start);
  const doubled = state.computed(() => count() * 2);

  function inc() {
    count(count() + 1);
  }

  function dec() {
    count(count() - 1);
  }

  return html`
    <div style="display:inline-flex;gap:.5rem;align-items:center;">
      <button onclick=${dec}>-</button>
      <span>Count: ${count} (x2 = ${doubled})</span>
      <button onclick=${inc}>+</button>
    </div>
  `;
});

// tsp-task-board
define('tsp-task-board', (ctx) => {
  const { props, state, emit, onMount, onDestroy, effect } = ctx;

  const { nameFilter } = state({
    nameFilter: '',
  });

  const tasks = state.signal(props.initialTasks ?? []);
  const filter = state.signal('all'); // 'all' | 'active' | 'completed'
  const newText = state.signal('');
  const nextId = state.signal(1);

  const filtered = state.computed(() => {
    const f = filter();
    const nf = nameFilter().toLowerCase();
    return tasks().filter((t) => {
      const matchesFilter =
        f === 'all'
          ? true
          : f === 'active'
          ? !t.completed
          : t.completed;

      const matchesName =
        nf === '' || t.text.toLowerCase().includes(nf);

      return matchesFilter && matchesName;
    });
  });

  const taskCount = state.computed(() => tasks().length);

  function addTask() {
    const text = newText().trim();
    if (!text) return;

    const id = nextId();
    tasks([...tasks(), { id, text, completed: false }]);
    nextId(id + 1);
    newText('');

    emit('added', { id, text });
  }

  function toggleTask(id) {
    tasks(
      tasks().map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  function removeTask(id) {
    tasks(tasks().filter((t) => t.id !== id));
  }

  onMount(() => {
    console.log('[TaskBoard] mounted');
  });

  onDestroy(() => {
    console.log('[TaskBoard] destroyed');
  });

  effect(() => {
    console.log('Filter changed:', filter());
  });

  effect(() => {
    console.log('Tasks updated:', tasks().length);
  });
  // TODO - for getters in templates, should we support both the unwrapped signals AND the accessor func signal syntaxes: `${filter}` AND `${filter}`
  return html`
    <div class="taskboard" style="font-family: system-ui; padding: 0.5rem;">

      <header class="header" style="margin-bottom: 1rem;">
        <h2>${props.title ?? 'Tasks'}</h2>

        <div class="filters" style="display:flex; gap:0.5rem; margin:0.5rem 0;">
          ${['all', 'active', 'completed'].map((f) => html`
            <button
              onclick=${() => filter(f)}
              style="
                padding: 0.25rem 0.5rem;
                background: ${filter() === f ?  '#333' : '#eee'};
                color: ${filter() === f ? 'white' : 'black'};
                border: none;
                border-radius: 3px;
              "
            >
              ${f}
            </button>
          `)}
        </div>

        <input
          :value=${nameFilter}
          oninput=${(e) => nameFilter(e.target.value)}
          placeholder="Filter by name..."
          style="padding:0.25rem 0.5rem; width: 100%;"
        />
      </header>

      <section class="new-task" style="margin-bottom:1rem;">
        <input
          :value=${newText}
          oninput=${(e) => newText(e.target.value)}
          placeholder="New task..."
          style="padding:0.25rem 0.5rem;"
        />
        <button onclick=${addTask} style="margin-left:0.5rem;">Add</button>
      </section>

      <ul class="tasks" style="list-style:none; padding:0; margin:0;">
        ${each(
          filtered,
          (task) => html`
            <li class="task" style="display:flex; align-items:center; margin-bottom:0.5rem;">
              <label style="flex:1; display:flex; align-items:center; gap:0.5rem;">
                <input
                  type="checkbox"
                  :checked=${task.completed}
                  onchange=${() => toggleTask(task.id)}
                />
                <span style="text-decoration:${task.completed ? 'line-through' : 'none'};">
                  ${task.text}
                </span>
              </label>

              ${when(!task.completed, () => html`
                <button
                  onclick=${() => removeTask(task.id)}
                  style="
                    background:#c00;
                    color:white;
                    border:none;
                    padding:0.25rem 0.5rem;
                    border-radius:3px;
                  "
                >
                  ✕
                </button>
              `)}
            </li>
          `
        )}
      </ul>

      ${match(taskCount, {
        0: () => html`<p class="empty">No tasks yet.</p>`,
        default: () =>
          html`<p class="count">${taskCount} total tasks</p>`,
      })}

    </div>
  `;
});

// App + bootstrap
const App = () => html`
  <section>
    <h3 class="text-lg">Glint MVP v1.4.0</h3>
    <p>Signals, templating, component system, and TaskBoard demo.</p>
  </section>
  <hr />
  <section>
    <h3 class="text-lg py-2">Counter</h3>
    <tsp-counter start="5"></tsp-counter>
  </section>
  <section>
    <h3 class="text-lg py-2">Task Board</h3>
    <tsp-task-board title="Todd Tasks"></tsp-task-board>
  </section>
`;

document.addEventListener('DOMContentLoaded', () => {
  const rootNode = document.querySelector('#glint-app');
  render(App, { autoRegister: true, rootNode });
});
