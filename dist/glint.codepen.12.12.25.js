
    // ============================================================
    //  Glint – CodePen Dev Bundle
    //  https://github.com/toddpress/glint
    // ============================================================

const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
const isNumber = (val) => typeof val === 'number';
const isBoolean = (val) => typeof val === 'boolean';

const isPrimitive = (v) =>
  v == null || isString(v) || isNumber(v) || isBoolean(v);

const safeParse = (v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};

const isSignal$1 = (s) => s?.__isSignal === true;
const isComputed = (s) => s?.__isComputed === true;
const isTemplate = (t) => t?.__template === true;

// ============================================================
// Glint Internal Utilities (NOT exported to app authors)
// ============================================================

// ------------------------------------------------------------
// Higher-order DOM walker
// ------------------------------------------------------------
const walk = (whatToShow) => (root) => {
  const walker = document.createTreeWalker(root, whatToShow);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};

// Specialized walkers
const walkTextNodes = walk(NodeFilter.SHOW_TEXT);
const walkElementNodes = walk(NodeFilter.SHOW_ELEMENT);

// ------------------------------------------------------------
// Attribute mapper
// ------------------------------------------------------------
const mapAttrs = (el) =>
  [...el.attributes].map((a) => ({
    name: a.name,
    value: a.value,
  }));

// ------------------------------------------------------------
// Marker extractor for __glint_<index>__
// ------------------------------------------------------------
const extractMarkers = (str, pattern) => {
  const matches = [];
  pattern.lastIndex = 0;

  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = pattern.exec(str)) !== null) {
    matches.push({
      full: m[0],
      index: Number(m[1]),
      start: m.index,
    });
  }

  return matches;
};

var i=Symbol.for("preact-signals");function t(){if(!(s>1)){var i,t=false;while(void 0!==h){var r=h;h=void 0;f++;while(void 0!==r){var o=r.o;r.o=void 0;r.f&=-3;if(!(8&r.f)&&c(r))try{r.c();}catch(r){if(!t){i=r;t=true;}}r=o;}}f=0;s--;if(t)throw i}else s--;}function r(i){if(s>0)return i();s++;try{return i()}finally{t();}}var o=void 0;function n(i){var t=o;o=void 0;try{return i()}finally{o=t;}}var h=void 0,s=0,f=0,v=0;function e(i){if(void 0!==o){var t=i.n;if(void 0===t||t.t!==o){t={i:0,S:i,p:o.s,n:void 0,t:o,e:void 0,x:void 0,r:t};if(void 0!==o.s)o.s.n=t;o.s=t;i.n=t;if(32&o.f)i.S(t);return t}else if(-1===t.i){t.i=0;if(void 0!==t.n){t.n.p=t.p;if(void 0!==t.p)t.p.n=t.n;t.p=o.s;t.n=void 0;o.s.n=t;o.s=t;}return t}}}function u(i,t){this.v=i;this.i=0;this.n=void 0;this.t=void 0;this.W=null==t?void 0:t.watched;this.Z=null==t?void 0:t.unwatched;this.name=null==t?void 0:t.name;}u.prototype.brand=i;u.prototype.h=function(){return  true};u.prototype.S=function(i){var t=this,r=this.t;if(r!==i&&void 0===i.e){i.x=r;this.t=i;if(void 0!==r)r.e=i;else n(function(){var i;null==(i=t.W)||i.call(t);});}};u.prototype.U=function(i){var t=this;if(void 0!==this.t){var r=i.e,o=i.x;if(void 0!==r){r.x=o;i.e=void 0;}if(void 0!==o){o.e=r;i.x=void 0;}if(i===this.t){this.t=o;if(void 0===o)n(function(){var i;null==(i=t.Z)||i.call(t);});}}};u.prototype.subscribe=function(i){var t=this;return E(function(){var r=t.value,n=o;o=void 0;try{i(r);}finally{o=n;}},{name:"sub"})};u.prototype.valueOf=function(){return this.value};u.prototype.toString=function(){return this.value+""};u.prototype.toJSON=function(){return this.value};u.prototype.peek=function(){var i=o;o=void 0;try{return this.value}finally{o=i;}};Object.defineProperty(u.prototype,"value",{get:function(){var i=e(this);if(void 0!==i)i.i=this.i;return this.v},set:function(i){if(i!==this.v){if(f>100)throw new Error("Cycle detected");this.v=i;this.i++;v++;s++;try{for(var r=this.t;void 0!==r;r=r.x)r.t.N();}finally{t();}}}});function d(i,t){return new u(i,t)}function c(i){for(var t=i.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return  true;return  false}function a(i){for(var t=i.s;void 0!==t;t=t.n){var r=t.S.n;if(void 0!==r)t.r=r;t.S.n=t;t.i=-1;if(void 0===t.n){i.s=t;break}}}function l(i){var t=i.s,r=void 0;while(void 0!==t){var o=t.p;if(-1===t.i){t.S.U(t);if(void 0!==o)o.n=t.n;if(void 0!==t.n)t.n.p=o;}else r=t;t.S.n=t.r;if(void 0!==t.r)t.r=void 0;t=o;}i.s=r;}function y(i,t){u.call(this,void 0);this.x=i;this.s=void 0;this.g=v-1;this.f=4;this.W=null==t?void 0:t.watched;this.Z=null==t?void 0:t.unwatched;this.name=null==t?void 0:t.name;}y.prototype=new u;y.prototype.h=function(){this.f&=-3;if(1&this.f)return  false;if(32==(36&this.f))return  true;this.f&=-5;if(this.g===v)return  true;this.g=v;this.f|=1;if(this.i>0&&!c(this)){this.f&=-2;return  true}var i=o;try{a(this);o=this;var t=this.x();if(16&this.f||this.v!==t||0===this.i){this.v=t;this.f&=-17;this.i++;}}catch(i){this.v=i;this.f|=16;this.i++;}o=i;l(this);this.f&=-2;return  true};y.prototype.S=function(i){if(void 0===this.t){this.f|=36;for(var t=this.s;void 0!==t;t=t.n)t.S.S(t);}u.prototype.S.call(this,i);};y.prototype.U=function(i){if(void 0!==this.t){u.prototype.U.call(this,i);if(void 0===this.t){this.f&=-33;for(var t=this.s;void 0!==t;t=t.n)t.S.U(t);}}};y.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;void 0!==i;i=i.x)i.t.N();}};Object.defineProperty(y.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var i=e(this);this.h();if(void 0!==i)i.i=this.i;if(16&this.f)throw this.v;return this.v}});function w(i,t){return new y(i,t)}function _(i){var r=i.u;i.u=void 0;if("function"==typeof r){s++;var n=o;o=void 0;try{r();}catch(t){i.f&=-2;i.f|=8;b(i);throw t}finally{o=n;t();}}}function b(i){for(var t=i.s;void 0!==t;t=t.n)t.S.U(t);i.x=void 0;i.s=void 0;_(i);}function g(i){if(o!==this)throw new Error("Out-of-order effect");l(this);o=i;this.f&=-2;if(8&this.f)b(this);t();}function p(i,t){this.x=i;this.u=void 0;this.s=void 0;this.o=void 0;this.f=32;this.name=null==t?void 0:t.name;}p.prototype.c=function(){var i=this.S();try{if(8&this.f)return;if(void 0===this.x)return;var t=this.x();if("function"==typeof t)this.u=t;}finally{i();}};p.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1;this.f&=-9;_(this);a(this);s++;var i=o;o=this;return g.bind(this,i)};p.prototype.N=function(){if(!(2&this.f)){this.f|=2;this.o=h;h=this;}};p.prototype.d=function(){this.f|=8;if(!(1&this.f))b(this);};p.prototype.dispose=function(){this.d();};function E(i,t){var r=new p(i,t);try{r.c();}catch(i){r.d();throw i}var o=r.d.bind(r);o[Symbol.dispose]=o;return o}

// ============================================================
// Glint Signal Core — the ONLY file touching Preact Signals.
// ============================================================
// This isolates the external dependency and allows us to later
// swap in TC39 Signals, Solid Signals, or a homegrown variant
// without modifying the rest of Glint’s architecture.

// ------------------------------------------------------------
// State — thin wrapper around Preact's basic signal()
// ------------------------------------------------------------

class State {
  constructor(initial) {
    this._s = d(initial);
  }

  // alias for ergonomic access
  get value() { return this._s.value; }
  set value(v) { this._s.value = v; }

  get() {
    return this._s.value;
  }

  set(v) {
    this._s.value = v;
    return v;
  }

  subscribe(listener) {
    return E(() => listener(this._s.value));
  }
}

// ------------------------------------------------------------
// Computed — thin wrapper around Preact's computed()
// ------------------------------------------------------------
class Computed {
  constructor(fn) {
    this._s = w(fn);
  }

  get value() { return this._s.value; }
  get() { return this._s.value; }

  set(_) {
    throw new Error('Cannot directly set a Computed signal.');
  }
}

// ------------------------------------------------------------
// Subtle — low-level non-reactive access (like Solid.peek)
// ------------------------------------------------------------
const subtle = {
  get(target) {
    if (target instanceof State || isComputed(target)) {
      return target._s.peek();
    }
    throw new TypeError('subtle.get: unsupported target');
  },
  set(target, value) {
    if (target instanceof State) return target.set(value);
    throw new TypeError('subtle.set: not writable');
  },
};

// ------------------------------------------------------------
// Unified Signal API — exported as a single namespace
// ------------------------------------------------------------
const Signal$1 = {
  State,
  Computed,
  subtle,
  effect: E,
  batch: r,
};

// ============================================================
// Glint Signals Layer
// ------------------------------------------------------------
// Built on top of signal-core.js, but does NOT import Preact
// directly. This module defines the ergonomic signal API used
// by components, the template engine, and helpers.
// ============================================================


// ------------------------------------------------------------
// Accessor wrapper — Glint-style signals
// ------------------------------------------------------------

function wrap(base, { customSetter = null } = {}) {
  const isComputedBase = isComputed(base);

  function accessor(next) {
    // getter
    if (arguments.length === 0) return base.get();

    // computed cannot be set
    if (isComputedBase) {
      throw new Error('Cannot set a computed signal');
    }

    // custom setter (e.g., structured updates)
    if (customSetter) {
      return customSetter(next);
    }

    // default setter
    return base.set(next);
  }

  accessor.get = () => base.get();
  accessor.peek = () => subtle.get(base);
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

// unwrapOne — one layer of reactive unwrapping
function unwrapOne(v) {
  if (isSignal(v) || isComputed(v)) return v();
  return v;
}

// ------------------------------------------------------------
// createStateContainer — ctx.state() factory
// ------------------------------------------------------------

const createStateContainer = () => {
  const signalFn = (v) => wrap(new State(v));
  const computedFn = (fn) => wrap(new Computed(fn));

  const defineShape = (def) => {
    const entries = Object.entries(def);

    // Phase 1 — signals + placeholders
    const { api, temp } = entries.reduce(
      (acc, [key, val]) => {
        if (isFunction(val)) {
          acc.temp[key] = null;
        } else {
          const sig = signalFn(val);
          acc.temp[key] = sig;
          acc.api[key] = sig;
        }
        return acc;
      },
      { api: {}, temp: {} }
    );

    // Phase 2 — computed values
    entries
      .filter(([, val]) => isFunction(val))
      .forEach(([key, val]) => {
        const comp = computedFn(() => val(temp));
        temp[key] = comp;
        api[key] = comp;
      });

    return api;
  };

  const state = (def) => defineShape(def);

  state.signal = signalFn;
  state.computed = computedFn;

  return state;
};

class NodePart {
  constructor(marker, ctxEffect) {
    this.marker = marker;
    this.ctxEffect = ctxEffect;
    this.nodes = [];
  }

  update(getter) {
    // Remove previous nodes
    this.nodes.forEach((n) => n.remove());
    this.nodes = [];

    let value = getter();
    value = unwrapOne(value);

    // Support fn -> value pattern
    if (isFunction(value) && !isSignal$1(value) && !isComputed(value)) {
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

      if (isFunction(val) && !isSignal$1(val) && !isComputed(val)) {
        val = val();
      }

      if (val == null || val === false) return;

      // Template / fragment / arrays are handled by renderTemplate
      // and helpers in the template layer; here we treat non-primitive
      // values as stringified fallback.
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
    const { el, attrName, ctxEffect } = this;

    ctxEffect(() => {
      let val = getter();
      val = unwrapOne(val);

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
    const { el, propName, ctxEffect } = this;

    ctxEffect(() => {
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
    const { el, eventName, ctxEffect } = this;

    ctxEffect(() => {
      const v = getter();
      let fn = unwrapOne(v);

      if (this.current) {
        el.removeEventListener(eventName, this.current);
        this.current = null;
      }

      if (isSignal$1(fn)) fn = fn();

      if (isFunction(fn)) {
        this.current = fn;
        el.addEventListener(eventName, this.current);
      }
    });
  }
}

class InterpolatedAttrPart {
  constructor(el, attrName, segments, ctxEffect) {
    this.el = el;
    this.attrName = attrName;
    this.segments = segments; // [string | getter, ...]
    this.ctxEffect = ctxEffect;
  }

  bind() {
    const { el, attrName: name, segments, ctxEffect } = this;

    ctxEffect(() => {
      const result = segments
        .map((seg) => {
          if (isString(seg)) return seg;
          let v = seg();
          v = unwrapOne(v);
          if (v == null || v === false) return '';
          return String(v);
        })
        .join('');

      el.setAttribute(name, result);
    });
  }
}

// ============================================================
// Glint Template Engine
// ============================================================


// ------------------------------------------------------------
// Template tag
// ------------------------------------------------------------

const html = (strings, ...exprs) => {
  // Store expressions as getters so they can be re-evaluated in effects
  const values = exprs.map((expr) => () => expr);
  return { __template: true, strings, values };
};

// ------------------------------------------------------------
// Template compilation + cache
// ------------------------------------------------------------

const templateCache = new WeakMap();

const compileTemplate = (strings, valueCount) => {
  const htmlString = strings
    .map((chunk, i) => chunk + (i < valueCount ? `__glint_${i}__` : ''))
    .join('');

  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString;
  return { fragment: tpl.content };
};

const getCompiled = (strings, valueCount) => {
  const cached = templateCache.get(strings);
  if (cached) return cached;

  const compiled = compileTemplate(strings, valueCount);
  templateCache.set(strings, compiled);
  return compiled;
};

// ------------------------------------------------------------
// renderTemplate
// ------------------------------------------------------------

const renderTemplate$1 = (tpl, ctxEffect) => {
  if (!isTemplate(tpl)) {
    throw new Error('renderTemplate expected a template.');
  }

  const { strings, values } = tpl;
  const compiled = getCompiled(strings, values.length);
  const fragment = compiled.fragment.cloneNode(true);

  const markerPattern = /__glint_(\d+)__/g;
  const pendingNodeParts = [];

  // ----------------------------------------------------------
  // TEXT PARTS
  // ----------------------------------------------------------
  walkTextNodes(fragment).forEach((textNode) => {
    const raw = textNode.nodeValue;
    if (!raw || !raw.includes('__glint_')) return;

    const parent = textNode.parentNode;
    if (!parent) return;

    const markers = extractMarkers(raw, markerPattern);
    if (!markers.length) return;

    const newNodes = [];
    let lastIndex = 0;

    markers.forEach(({ full, index, start }) => {
      const pre = raw.slice(lastIndex, start);
      if (pre) newNodes.push(document.createTextNode(pre));

      const comment = document.createComment(`gl:${index}`);
      newNodes.push(comment);

      pendingNodeParts.push({
        marker: comment,
        getter: values[index],
      });

      lastIndex = start + full.length;
    });

    const tail = raw.slice(lastIndex);
    if (tail) newNodes.push(document.createTextNode(tail));

    newNodes.forEach((n) => parent.insertBefore(n, textNode));
    textNode.remove();
  });

  // Bind NodeParts after anchors exist
  pendingNodeParts.forEach(({ marker, getter }) => {
    const part = new NodePart(marker, ctxEffect);
    part.bind(getter);
  });

  // ----------------------------------------------------------
  // ATTRIBUTE / PROP / EVENT PARTS
  // ----------------------------------------------------------
  walkElementNodes(fragment).forEach((el) => {
    mapAttrs(el).forEach(({ name: rawName, value: rawValue }) => {
      if (!rawValue || !rawValue.includes('__glint_')) return;

      const markers = extractMarkers(rawValue, markerPattern);
      if (!markers.length) return;

      // ----------------------------
      // Property binding: :value
      // ----------------------------
      if (rawName.startsWith(':')) {
        const getter = values[markers[0].index];
        const propName = rawName.slice(1);
        el.removeAttribute(rawName);

        const part = new PropPart(el, propName, ctxEffect);
        part.bind(getter);
        return;
      }

      // ----------------------------
      // Event binding: onclick
      // ----------------------------
      if (rawName.startsWith('on')) {
        const getter = values[markers[0].index];
        const eventName = rawName.slice(2);
        el.removeAttribute(rawName);

        const part = new EventPart(el, eventName, ctxEffect);
        part.bind(getter);
        return;
      }

      // ----------------------------
      // Attribute interpolation
      // ----------------------------
      el.removeAttribute(rawName);

      const segments = markers.reduce((acc, m, idx) => {
        const prevEnd =
          idx === 0
            ? 0
            : markers[idx - 1].start +
              markers[idx - 1].full.length;

        const pre = rawValue.slice(prevEnd, m.start);
        if (pre) acc.push(pre);

        acc.push(values[m.index]);
        return acc;
      }, []);

      const last = markers[markers.length - 1];
      const tail = rawValue.slice(last.start + last.full.length);
      if (tail) segments.push(tail);

      // Full dynamic attribute
      if (segments.length === 1 && !isString(segments[0])) {
        const part = new AttrPart(el, rawName, ctxEffect);
        part.bind(segments[0]);
      } else {
        const part = new InterpolatedAttrPart(
          el,
          rawName,
          segments,
          ctxEffect
        );
        part.bind();
      }
    });
  });

  return fragment;
};

// ------------------------------------------------------------
// BaseComponent
// ------------------------------------------------------------

class BaseComponent extends HTMLElement {
  static renderer = null;
  static options = { useShadow: true };

  props = {};
  hooks = { onMount: [], onDestroy: [] };
  effectsCleanupFns = [];

  #root;

  constructor() {
    super();

    const { useShadow } = this.constructor.options;
    this.#root = useShadow
      ? this.attachShadow({ mode: 'open' })
      : this;

    this.props = this._collectProps();
    this.state = createStateContainer();

    this.ctx = {
      el: this,
      root: this.#root,
      props: this.props,
      state: this.state,
      effect: (fn) => {
        const stop = Signal$1.effect(() => {
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
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  _collectProps() {
    return Array.from(this.attributes).reduce((acc, attr) => {
      acc[attr.name] = safeParse(attr.value);
      return acc;
    }, {});
  }

  _render() {
    const renderer = this.constructor.renderer;
    if (!renderer) return;

    const tpl = renderer(this.ctx);
    const dom = renderTemplate$1(tpl, (fn) => this.ctx.effect(fn));

    this.#root.innerHTML = '';
    this.#root.appendChild(dom);
  }
}

const componentRegistry = new Map();

const define = (name, renderer, options = {}) => {
  const mergedOptions = {
    ...BaseComponent.options,
    ...options,
  };

  componentRegistry.set(name, {
    renderer,
    options: mergedOptions,
  });

  return { name, renderer, options: mergedOptions };
};

const registerAllComponents = () => {
  componentRegistry.forEach(({ renderer, options }, name) => {
    if (customElements.get(name)) return;

    customElements.define(
      name,
      class extends BaseComponent {
        static renderer = renderer;
        static options = options;
      }
    );
  });
};

// ------------------------------------------------------------
// Top-level render (non-component root)
// ------------------------------------------------------------

const render = (
  AppComponent,
  { autoRegister = true, rootNode = document.body } = {}
) => {
  if (autoRegister) registerAllComponents();

  const tpl = AppComponent();
  const dom = renderTemplate(tpl, (fn) => Signal.effect(fn));

  rootNode.innerHTML = '';
  rootNode.appendChild(dom);
};

// ------------------------------------------------------------
// `createRoot` function -- like React but lighter
// ------------------------------------------------------------

function createRoot(target, options = {}) {
  const rootNode =
    typeof target === 'string'
      ? document.querySelector(target)
      : target;

  if (!rootNode) {
    throw new Error('Glint: root node is required');
  }

  return {
    render(App) {
      return render(App, {
        ...options,
        rootNode,
      });
    },

    unmount() {
      rootNode.replaceChildren();
    },
  };
}

// ============================================================
// Glint Template Helpers (HOF-based)
// ------------------------------------------------------------
// This file bundles:
// - resolveVal() : normalize signals/computed vs raw values
// - makeTemplateHelper() : build a getter fn for templates
// - each / when / match : canonical control-flow helpers
// ============================================================


// ------------------------------------------------------------
// Helper core utilities
// ------------------------------------------------------------

const resolveVal = (val) =>
  isSignal$1(val) || isComputed(val) ? val() : val;

const makeTemplateHelper = (source, fn) =>
  () => fn(resolveVal(source));

// ------------------------------------------------------------
// Public helpers
// ------------------------------------------------------------

const each = (source, renderFn) =>
  makeTemplateHelper(source, (list) => list.map(renderFn));

const when = (cond, renderFn) =>
  makeTemplateHelper(cond, (val) => (val ? renderFn() : []));

const match = (source, cases) =>
  makeTemplateHelper(source, (val) =>
    val in cases ? cases[val]() : cases.default?.() ?? []
  );

export { createRoot, define, each, html, match, render, when };
