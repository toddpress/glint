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

## Models (Optional)

Sometimes state and behavior belong to a *concept*, not a component.

Forms.
Workflows.
Async coordination.
Shared application state.

For those cases, Glint provides **models**.

A model is a small unit of **stateful behavior** that:
- owns its own state container
- exposes actions and derived values
- knows nothing about the DOM or components

Models are optional — Glint works perfectly without them.

---

### Defining a model

```js
import { model, createStateContainer } from 'glintjs';

const formModel = model(() => {
  const state = createStateContainer();

  const value = state.signal('');
  const valid = state.computed(() => value().length > 0);

  function reset() {
    value('');
  }

  return { value, valid, reset };
});
```

This defines *what the model is*, not how long it lives.

---

### Owned models (component lifetime)

If a model instance should live and die with a component, mark it as **owned**.

```js
const formModel = model.owned(() => {
  const state = createStateContainer();

  const value = state.signal('');
  const valid = state.computed(() => value().length > 0);

  return { value, valid };
});
```

Use it inside a component:

```js
define('my-form', (ctx) => {
  const form = formModel(ctx);

  ctx.view(() => html`
    <input
      value=${form.value()}
      oninput=${e => form.value(e.target.value)}
    />
  `);
});
```

Ownership is explicit at the callsite — no hidden scoping or magic.

---

### Shared models

If a model should be shared, opt in explicitly:

```js
const sessionModel = model.shared('session', () => {
  const state = createStateContainer();
  const user = state.signal(null);
  return { user };
});

const session = sessionModel();
```

---

> Models are not hooks, not components, and not required.
> They’re just **named, intentional state boundaries** when you need them.

---

## Rendering

Glint does not have a “root component” or a render loop.

It does not run your application.
It does not re-invoke render functions.
It does not own your lifecycle.

**`render` places DOM into the world — once — and steps aside.**

---

### `render(target, template)`

```js
import { render, html } from 'glintjs';

render('#app', html`
  <h1>Hello</h1>
  <my-counter></my-counter>
`);
```

- `target` is a DOM node or selector
- `template` is a Glint template

That’s it.

After this call:
- the DOM exists
- Custom Elements instantiate naturally
- signals wire themselves to the nodes that depend on them
- updates happen locally and automatically

There is no global render cycle.

---

### Why `render` does not accept a function

Earlier versions allowed this pattern:

```js
render('#app', () => html`
  <h1>Hello</h1>
  <my-counter></my-counter>
`);
```

This has been deprecated.

Passing a function implies:
- a render phase
- a re-invocable root
- framework ownership of application flow

Glint does not work that way.

There is no top-level re-render.
There is no special “root” execution context.
There is no framework-managed lifecycle.

Accepting a function would suggest behavior that does not exist.

---

### The mental model

Think of `render` as **placement**, not execution.

You are saying:

> “Put this DOM here.”

Not:

> “Run my app.”

Once placed:
- the browser manages element lifecycles
- signals manage change
- identity lives where it belongs: in the DOM

Glint stays out of the way.

---

### Rendering is optional

You don’t need `render` at all if you don’t want it.

Because Glint is built on native Web Components, you can also:

- author components
- import them
- use them directly in HTML

`render` exists purely as a convenience — not as a governing abstraction.

---

### Summary

- `render` runs once
- it places a template into a container
- it does not imply re-rendering
- it does not define application structure
- it does not own lifecycle or flow

Glint enables applications without prescribing them.

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

You can use it — or just read it... Or don't! 😉

---

## What Glint Is *Not*

Glint is not:
- a React alternative (in the best of ways)
- a virtual DOM framework
- a compiler
- an application governor; it's a UI substrate.
- an attempt to “win” the ecosystem

It’s a **reference implementation of a way of thinking about UI** — usable as a runtime, valuable as a lens.

---

## Status

⚠️ Experimental.

Glint is stable enough to explore and reason with, but not yet recommended for production use yet:
- Breaking API changes _could_ happen as glint is an evolving experiment
- continuation of first point: README docs may be out of sync with some branches' APIs


The smallness is intentional.

---

## License

MIT
<small>Do whatever you want. Just don’t pretend it’s something it isn’t.
</small>
