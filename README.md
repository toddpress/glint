# Glint ⚡

*`glintjs` is a small system for thinking clearly about UI — and an ergonomic way to author Web Components without fighting the platform.*

Glint is a small, signal-driven runtime for authoring **native Web Components** using real HTML templates and fine-grained reactivity — with no build step, no virtual DOM, and no interest in running your application for you.

It exists to make Web Components **sane to write** without abstracting them away.

It doesn’t try to be clever.<br>
It tries to be legible.<br>

---

## Why Glint?

**Most UI complexity is accidental — and most bugs are identity bugs.**

Glint exists to explore a simpler question:

> *What does UI look like when identity is explicit and change is localized?*

Web Components already give us strong primitives — Custom Elements, real DOM, real lifecycle — but the authoring experience is... hostile, if we're being honest. Glint stays close to the platform while smoothing over the sharp edges, so you can still tell what owns what.

It’s both:
- a practical way to write **ergonomic Web Components**, and
- a *thinking tool* for reasoning about UI systems.

---

## A taste

```js
import { define, html } from 'glintjs';

define('my-counter', (ctx) => {
  const { state } = ctx;
  const count = state.signal(0);
  const doubled = state.computed(() => count() * 2);

  const increment = () => count(count() + 1);

  ctx.view(() => html`
    <button onclick=${increment}>
      Count: ${count()} (x2 = ${doubled()})
    </button>
  `);
});
```

That’s the whole thing.

When `count` changes, **only the DOM nodes that depend on it update**.
Nothing else recomputes “just to be safe.”

There’s no render loop pacing the room.<br>
No lifecycle choreography to memorize.<br>
No framework hoping you don’t notice what it’s doing.<br>

**Or…**

If you hate cramming all stateful logic into the component definition like me, let it breathe a bit with a model:

```js
import { define, html, model, createStateContainer } from 'glintjs';

const counterModel = model.owned(() => {
  const state = createStateContainer();

  const count = state.signal(0);
  const doubled = state.computed(() => count() * 2);

  function increment() {
    count(count() + 1);
  }

  return { count, doubled, increment };
});

define('my-counter', (ctx) => {
  const { count, doubled, increment } = counterModel(ctx);

  ctx.view(() => html`
    <button onclick=${increment}>
      Count: ${count()} (x2 = ${doubled()})
    </button>
  `);
});
```

Same Web Components.
Less friction.

---

## How it works (briefly)

Glint components are real Custom Elements.

There’s no virtual tree keeping notes.<br>
No reconciliation step deciding what *should* exist.<br>
The browser already knows how to manage the DOM — that’s its job. Glint doesn’t argue with it.<br>

Templates are just HTML:

```js
html`
  <h2>${title}</h2>
  <p>${description}</p>
`
```

Expressions can be signals, functions, arrays, or nested templates.<br>
Dependencies are wired once. Then Glint steps aside.<br>

**Signals are identity**:

```js
const count = ctx.state.signal(0);

count();    // read
count(10);  // write
```

They’re stable references.<br>
They don’t move.<br>
They don’t pretend to be values.<br>

If something matters over time, it gets a signal.
If it doesn’t, it probably shouldn’t.

Control flow is just functions:

```js
${each(items, item => html`<li>${item}</li>`)}
${when(loading, () => html`<p>Loading…</p>`)}
```

No new syntax.<br>
No special rules.<br>
Just JavaScript, doing what it already does.

---

## Models (optional, but handy)

Sometimes state and behavior belong to a *concept*, not a component.

Forms.<br>
Workflows.<br>
Async coordination.<br>
Shared application state.<br>

For those cases, Glint provides **models** — a way to keep components readable when things stop being trivial.

A model is a small unit of **stateful behavior** that:
- owns a state container
- exposes actions and derived values
- has no idea what the DOM looks like

```js
import { model, createStateContainer } from 'glintjs';

const formModel = model.owned(() => {
  const state = createStateContainer();

  const value = state.signal('');
  const valid = state.computed(() => value().length > 0);

  function reset() {
    value('');
  }

  return { value, valid, reset };
});
```

```js
define('my-form', (ctx) => {
  const form = formModel(ctx);

  ctx.view(() => html`
    <input
      value=${form.value()}
      oninput=${e => form.value(e.target.value)}
    />
    ${when(form.valid, () => html`<p>Looks good.</p>`)}
  `);
});
```

This keeps components focused on **structure and wiring**,
and keeps stateful behavior somewhere it doesn't suffocate.

(There’s more to say about this, but the examples usually say enough.)

If a model should be shared, opt in explicitly:

```js
const sessionModel = model.shared('session', () => {
  const state = createStateContainer();
  const user = state.signal(null);
  return { user };
});

const session = sessionModel();
```

Models are not hooks.<br>
They are not components.<br>
They are not required.<br>

They’re just **named state boundaries** for when things start getting messy.

---

## Rendering

Glint does not “run” your application.

There’s no render loop.<br>
No re-invocation cycle.<br>
No framework-managed sense of “now we update.”<br>

The `render` convenience utility places DOM into the world — once — and steps aside.

```js
import { render, html } from 'glintjs';

render('#app', html`
  <h1>Hello</h1>
  <my-counter></my-counter>
`);
```

After this:
- the DOM exists
- Custom Elements instantiate naturally
- signals update only what depends on them

Think of `render` as **placement**, not execution.

You’re saying:

> “Put this DOM here.”

Not:

> “Please take over my application.”

Because Glint is built on native Web Components, `render` is completely optional...<br>
You can also import components and use them directly in HTML.

---

## What Glint is (and isn’t)

It’s an **ergonomic layer over native Web Components**, designed as a reference implementation of a clearer way to think about UI — useful even if you never adopt it wholesale.

Glint is built around a few key principles:

- clarity over cleverness
- explicit identity
- localized change
- minimal surface area
- the platform as foundation

Or more simply:

> *Glint prefers being understandable to being impressive.*

It is not:
- a virtual DOM framework
- a compiler
- an application governator
- or an attempt to “win” the ecosystem

More than anything, Glint is an experiment in **keeping UI simple enough to reason about** — without making things up.

---

## Status

⚠️ Experimental.

Stable enough to explore and reason with.<br>
Not yet something you should bet a business on.<br>

The smallness is intentional.

---

## License

MIT
<small>Do whatever you want. Just don’t pretend it’s something it isn’t.</small>
