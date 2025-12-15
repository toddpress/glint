# ⚡ `glintjs` (Glint)

*A tiny, signal-powered framework for building Web Components that doesn’t hate you back.*

`glintjs` is a tiny, reactive framework for authoring **native Web Components** using real HTML templates and fine-grained reactivity — with **no build step**, **no virtual DOM**, and **no ceremony**.

No JSX. <br>
No virtual DOM. <br>
No compiler. <br>
No bullshit.

Just components that feel obvious to write and easy to reason about.

---

## Why Glint?

**Web Components are powerful — but the DX is, let's say... absolute dogshit.**

Glint exists to answer a simple question:

> *What if Web Components had React-level ergonomics without React-level complexity?*

### Glint is:
- ⚡ **Signal-driven** (fine-grained updates, no re-render storms)
- 🧠 **Declarative** (templates read like HTML, not DSL soup)
- 🪶 **Tiny** (one small runtime, no build tools required)
- 🧩 **Composable** (helpers, fragments, and components all compose naturally)
- 🌐 **Native** (real DOM, real Custom Elements, real HTML)

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

That’s it.

No hooks.
No lifecycle gymnastics.
No re-render loops.

When `count` changes, **only the text nodes that depend on it update**.

---

## Core Concepts

### Components

Component definitions are just function invocations with a name and a render function that returns a template:

```js
define('my-element', (ctx) => {
  return html`<p>Hello, world</p>`;
});
```

They’re backed by real Custom Elements, not abstractions pretending to be the DOM.

---

### Templates (`html`)

Glint uses **real tagged template literals**:

```js
html`
  <div class="card">
    <h2>${title}</h2>
    <p>${description}</p>
  </div>
`
```

Expressions can be:
- signals
- computed values
- functions
- arrays
- nested templates

Glint handles the rest.

---

### Signals & State

Inside components, you get a scoped state API:

```js
const count = ctx.state.signal(0);
const doubled = ctx.state.computed(() => count() * 2);
```

Signals are functions:
- call with no args → get
- call with a value → set

```js
count();      // get
count(10);    // set
```

No proxies or magic getters.

---

### Control Flow Helpers

Glint provides minimal, composable helpers for common template patterns.

#### `each()`

```js
${each(items, (item) => html`
  <li>${item}</li>
`)}
```

#### `when()`

```js
${when(isLoading, () => html`
  <p>Loading…</p>
`)}
```

#### `match()`

```js
${match(status, {
  success: () => html`<p>Success</p>`,
  error: () => html`<p>Error</p>`,
  default: () => html`<p>Idle</p>`
})}
```

They’re just functions that return fragments — nothing special, nothing hidden.

---

## Rendering an App

Here’s your entry point:

```js
import { createRoot, render, html } from 'glintjs';

const App = () => html`
  <h1>Hello from Glint</h1>
  <my-counter></my-counter>
`;

createRoot('#glint-app').render(App);
```

And in your HTML:

```html
<body>
  <div id="glint-app"></div>
</body>
```

---

## Philosophy

Glint is built on a few strong beliefs:

- **Clarity beats cleverness**
- **Signals should be explicit**
- **The Platform is not the enemy**
- **APIs should feel frictionless**
- **Abstractions must earn their keep**

Or, more succinctly, Glint is:

> *The no-bullshit, bullshit web component framework.*

<sub><em>(affectionate, not hostile)</em></sub>

---

## What Glint Is *Not*

Glint is NOT:
- a React clone
- a virtual DOM framework
- a Svelte wannabe
- a compiler
- a full application platform

Glint is a **toolkit for authoring components cleanly** — and then getting the hell out of the way.

---

## Status

⚠️ Glint is currently:
- 🧪 Actively developed
- ✅ Stable for experimentation
- ⚠️ Not stable for production deployment

That said — the core architecture is solid, minimal, and intentionally hard to over-engineer.

---

## MIT License
<small>Do whatever you want. Just don’t make it worse 😉</small>
