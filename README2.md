## ⚡️ Glint: A Tiny Reactive Framework That Plays Nice With the Web

Glint is a lightweight, signal-powered framework for building Web Components with **zero build tools, real HTML templates, and reactivity that feels effortless**.

No JSX.<br>
No virtual DOM.<br>
No compiler.<br>
No bullshit.<br>

Just components that look like this:

```js
define('my-counter', (ctx) => {
  const { state } = ctx;

  const count = state.signal(0);
  return html`
    <button onclick=${() => count(count() - 1)}>-</button>
    <span>${count}</span>
    <button onclick=${() => count(count() + 1)}>+</button>
  `;
});
```

And update instantly, automatically, and predictably.

Glint gives you:

- **Signals that behave like values**
- **Templates that behave like HTML**
- **Components that behave like functions**
- **A mental model that behaves like common sense**

All while staying absurdly small and aligned with native browser APIs.

If you’ve ever wished Web Components felt more like React —
or wished React felt more like the web —
Glint is the missing layer you were imagining.

---

## 🚀 Features
### Tiny, Reactive, Build-Free

- Runs directly in the browser — no tooling or compilation required
- Uses signals for fine-grained reactivity with zero VDOM overhead
- Inspired by ideas from React, Solid, Lit, and native Web Components — minus the bloat
- Updates only what changes, automatically

### HTML-First Templating

- Real HTML via tagged templates
- Partial attribute interpolation:
```html
style="opacity:${opacity / 100}; text-decoration:${done ? 'line-through' : 'none'}"
```
- Mix static + dynamic HTML naturally
- Template helpers: `each()`, `when()`, `match()`

### Platform-Aligned Component Model
- Web Components as the foundation
- Shadow DOM for scoped styles
- Props via plain attributes
- Emits real DOM events (`emit('event', data)`)
- No custom DSLs or synthetic event layers

### Minimal API Surface

- `define()` for components

- `html`` for templates

- `signal`, `computed`, `effect` for reactivity

- Optional: simple `state({ ... })` shape builder

---

## 🧪 Quickstart
1. Clone this repo and drop src/index.js into your project directly.
<!--
1. Add Glint via CDN
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>


Or clone this repo and drop src/index.js into your project directly.
-->

2. Define a Component

```js
define('task-item', (ctx) => {
  const done = ctx.state.signal(false);

  return html`
    <label>
      <input
        type="checkbox"
        :checked=${done}
        onchange=${() => done(!done())}
      />
      <span style="${done ? 'text-decoration: line-through' : 'text-decoration: none'};">
        ${ctx.props.text}
      </span>
    </label>
  `;
});
```
3. Use It Anywhere
```html
<task-item text="Buy milk"></task-item>
```

4. Top-Level App (Optional)

```js
const App = () => html`
  <main>
    <task-item text="Learn Glint"></task-item>
  </main>
`;

render(App, { rootNode: document.querySelector('#app') });
```
---

## 🧱 API Overview
### `define(name, renderer, options?)`
Registers a Web Component.

```js
define('hello-world', () => html`<h1>Hello!</h1>`);
```

### `signal(initial)`
Creates reactive state.

```js
const count = signal(0);
count(count() + 1);
```
### `computed(fn)`

Derived reactive values.

```js
const double = computed(() => count() * 2);
```
### `effect(fn)`

Runs whenever its dependencies change.

```js
effect(() => {
  console.log("Count changed:", count());
});
```

### `html` Tagged Template

Your templating engine.

```js
return html`<button>${count}</button>`;
```

### `render(App, options?)`

Bootstraps a root-level component.

```js
render(App, { rootNode: document.body });
```

## 🧩 Template Helpers

### `each(source, renderFn)`
Loop over lists reactively.

```js
${each(items, (item) => html`<li>${item}</li>`)}
```

### `when(condition, renderFn)`
Conditional blocks.

```js
${when(ready, () => html`<p>Loaded!</p>`)}
```

### `match(value, cases)`
Switch-style templating.

```js
${match(status, {
  loading: () => html`Loading...`,
  error:   () => html`Error!`,
  default: () => html`Done!`,
})}
```

---

## ⚠️ Status & Expectations

Glint is **early**, evolving, and delightfully experimental.

You *should* expect:

- changing APIs
- rough edges
- missing documentation
- unoptimized internals
- occasional existential dread (mostly ours)

If you need:
- a battle-tested ecosystem
- SSR
- hydration
- TypeScript power features
- sophisticated devtools

…please reach for React, Vue, Solid, Svelte, or Lit.

Glint isn’t here to replace them.
It exists for developers who want something:

- smaller
- simpler
- more direct
- more platform-aligned
- and a little more joyful

to build with.

---

## 🤝 Contributing

Ideas, feedback, and PRs are welcome.
Please open an issue, send a PR, or yell kindly into the void.

---

## 📄 License

MIT — go build cool things.

---

<br><br>
<p align="center"><i>The no-bullshit, bullshit web component framework.</i></p>
