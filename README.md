# ⚡ glintjs (Glint)

*A small system for thinking clearly about UI — and a runtime that stays out of the way.*

Glint is a tiny, signal-driven runtime for authoring **native Web Components** using real HTML templates and fine-grained reactivity — with **no build step**, **no virtual DOM**, and **no hidden machinery**.

No JSX.  
No compiler.  
No re-rendering theater.

Just components whose identity and behavior are explicit.

---

## Why Glint?

**Most UI complexity is accidental — and most bugs are identity bugs.**

Glint exists to explore a simpler question:

> *What does UI look like when identity is explicit and change is localized?*

Instead of abstracting the platform away, Glint stays close to it — making state, dependencies, and updates visible and easy to reason about.

Glint is both:
- a practical way to write Web Components, and
- a *thinking tool* for understanding UI systems.

---

## A Taste

```js
import { define, html } from 'glintjs';

define('my-counter', ({ state }) => {
  const count = state.signal(0);
  const doubled = state.computed(() => count() * 2);

  return html`
    <button onclick=${() => count(count() + 1)}>
      Count: ${count} (x2 = ${doubled})
    </button>
  `;
});
```

That’s the entire model.

When `count` changes, **only the DOM nodes that depend on it update**.

No hooks.  
No lifecycle choreography.  
No re-render cycles.

---

## Core Ideas (Briefly)

### Components are real

Each component maps directly to a native Custom Element.

No virtual tree.  
No reconciliation.  
No pretending to be the DOM.

---

### Templates are just HTML

Glint uses tagged template literals:

```js
html`
  <h2>${title}</h2>
  <p>${description}</p>
`
```

Expressions can be signals, functions, arrays, or nested templates.  
The runtime connects dependencies and steps aside.

---

### Signals are identity

```js
const count = ctx.state.signal(0);
```

Signals are stable, explicit references:
- call with no args → read
- call with a value → write

```js
count();    // read
count(10);  // write
```

No proxies.  
No implicit tracking rules.

If something matters over time, it has a signal.

---

### Control flow is just functions

```js
${each(items, item => html`<li>${item}</li>`)}
${when(loading, () => html`<p>Loading…</p>`)}
```

No syntax.  
No magic.  
Just composition.

---

## Rendering

Glint doesn’t prescribe application structure.

```js
import { render, html } from 'glintjs';

render('#app', () => html`
  <h1>Hello</h1>
  <my-counter></my-counter>
`);
```

---

## Philosophy

Glint is built around a few constraints:

- **Clarity over cleverness**
- **Explicit identity**
- **Localized change**
- **Minimal surface area**
- **The platform is the foundation**

Or more simply:

> *Glint prefers being understandable to being impressive.*

You can use it — or just read it.

---

## What Glint Is *Not*

Glint is not:
- a React alternative (in the best of ways)
- a virtual DOM framework
- a compiler
- a full application platform
- an attempt to “win” the ecosystem

It’s a **reference implementation of a way of thinking about UI** — usable as a runtime, valuable as a lens.

---

## Status

⚠️ Experimental.

Glint is stable enough to explore and reason with,  
but not yet recommended for production use.

The smallness is intentional.

---

## License

MIT  
<small>Do whatever you want. Just don’t pretend it’s something it isn’t.</small>
