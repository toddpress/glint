# Glint ✨

## 🔥 The no-bullshit, bullshit web component framework 🔥

🚀 Glint is a fast, build-less native web component-based UI framework that makes reactive web development simple and fun again — All without the virtual DOM, complex hooks, or build tools.

-   ✅ No Babel, No JSX, No Webpack
-   ✅ Native Web Components & Scoped Styles by Default
-   ✅ Fine-Grained Reactivity Without Re-Renders
-   ✅ Auto-Batching, No useEffect Hell
-   ✅ Built-in State Management, No Context API Needed

> 💡 Think React, but simpler, faster, and without the bloat.

## Motivation

**We need a low-barrier, low-bullshit way of creating and consuming _real_ web components**. The DX for native web components kinda sucks... That's why I started work on this.

And please -- steal this idea and make something better... Or contribute.

## ⚠️ Disclaimer

> Glint is still very much a **work in progress**: Features, APIs, and documentation may be assumed **incomplete and are subject to change**.

👉 **Use something like `lit-element` or `React`/`Preact` if you require production-grade component abstractions.**

While we’re actively developing and iterating, please **expect breaking changes** or inconsistencies between the code and the docs.

In essence... Proceed with <b>EXTREME</b> caution if you need production stability! Glint is conceptually awesome (if I say so myself), but it's not yet ready for prime time -- just remember to check back soon! And please contribute 🙏

## 🚀 Quick Start

Glint runs directly in the browser—no setup required. [Check it out on codepen](https://codepen.io/toddpress/pen/ogNVvoL?editors=0010)!

### 1️⃣ [WIP] NPM Install

For now, you can clone the repo and use the `src/index.js` file in your project.

```html
<script type="module" src="path/to/src/index.js"></script>
```

#### [WIP] Via `npm`:

```sh
npm install glint-js
```

#### [WIP] or just use CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```

### 2️⃣ Define a custom component

```js
import { component, signal, html } from 'glint-js';

component('counter-button', ({ start = 0 }) => {
    const count = signal(Number(start));

    return html`
        <button @click=${() => count(count() + 1)}>
            Clicked ${count} times
        </button>
    `;
});
```

### 3️⃣ Use it in other components

```html
<counter-button start="5"></counter-button>
```

### 4️⃣ Bootstrap your app, add entrypoint

```js
// top-level app component
const _App_ = () => html`
    <main>
        <counter-button start="5" />
    </main>
`;

// bootstrap app in entry point
render(_App_, {
    rootNode: document.querySelector('#glint-app'),
});
```

Boom! 💥 Your component just works—no build step, no config, no bullshit.

## 🎯 Why Glint?

🔥 Glint aims for a DX similar to React without the headache.

-   ✅ No VDOM Overhead → Faster, direct DOM updates.
-   ✅ Zero Build Step → Works without Babel/Webpack/Vite.
-   ✅ Signals & Computed State → No useEffect boilerplate.
-   ✅ Scoped Styles for Free → Just like native components. There's even an escape hatch.
-   ✅ Event Binding Like HTML → Just use @click=${fn}.
-   ✅ Native Web Standards → No lock-in, just HTML, JS, and CSS.

## 🔍 React vs. Glint

| Feature            | React                           | Glint                                      |
| ------------------ | ------------------------------- | ------------------------------------------ |
| **Build Tools**    | Required (Babel, Webpack)       | 🚀 **None** (Runs in browser)              |
| **Reactivity**     | Hooks (`useState`, `useEffect`) | 🚀 **Signals & Computed State**            |
| **Event Handling** | Synthetic Events                | 🚀 **Native DOM Events** (`@click=${fn}`)  |
| **Context API**    | Required for state sharing      | 🚀 **Global `store()`** (No Prop Drilling) |
| **Performance**    | VDOM Reconciliation             | 🚀 **Direct DOM Updates**                  |

<!--
| **Scoped Styles**  | CSS-in-JS, Emotion | 🚀 **Built-in Shadow DOM** |
-->

## 📖 Features

### 🛠️ Simple, Reactive Components

Define components using signals—no hooks needed.

```js
component('my-counter', () => {
    const count = signal(0);
    return html`
        <button @click=${() => count(count() + 1)}>Count: ${count}</button>
    `;
});
```

### 🔗 Real Scoped Styles

```js
component('styled-box', () => {
    css`
        div {
            background: purple;
            padding: 1em;
            color: white;
        }
    `;
    return html`<div>Styled Box</div>`;
});
```

<!--
NEWER SYNTAX:
```js
component("styled-box", () => html`
  <style>
    div { background: purple; padding: 1em; color: white; }
  </style>
  <div>Styled Box</div>
`);
```
-->

<!--
Glint ships with an escape hatch to web components' scoped-by-default styles:

```js
component("styled-box-w-esc-hatch", () => html`
  <style global>
    div { background: purple; padding: 1em; color: white; }
  </style>
  <div>Styled Box</div>
`);
```
-->

### ⚡ Computed State (No useMemo)

```js
const doubleCount = computed(() => count() * 2);
```

### 🎭 Slots & Composition

```js
component(
    'custom-card',
    () => html`
        <style>
            .card {
                border: 1px solid #ccc;
                padding: 1em;
            }
        </style>
        <div class="card">
            <slot name="header"></slot>
            <slot></slot>
        </div>
    `,
);
```

```html
<custom-card>
    <h3 slot="header">Title</h3>
    <p>Content here</p>
</custom-card>
```

### 🌍 [WIP] Global State Without Context API

```js
const theme = store('dark');
theme('light'); // Updates all subscribers
```

### 🚀 Event Delegation, No Re-Renders

```js
<button @click=${handleClick}>Click Me</button>
```

Uses native event listeners, unlike React’s synthetic event system.

## 🎬 Live Demo

  <p><b><a href="https://codepen.io/toddpress/pen/ogNVvoL?editors=0010">DEMO</a></b> on Codepen</p>

> 💡 Fun fact: Glint was developed entirely on Codepen... Thanks, Chris Coyer! (:

🚀 Check out the interactive playground:

-   👉 Glint Sandbox (Coming soon!)

## 🛠️ API Reference

### `component(name, rendererFn)`

Registers a Web Component.

```js
component('hello-world', () => html`<h1>Hello, World!</h1>`);
```

#### `signal(initialValue)`

Creates reactive state.

```js
const count = signal(0);
count(count() + 1);

console.log(count());
//> 1
```

#### `computed(fn)`

Creates a derived state variable.

```js
const double = computed(() => count() * 2);
```

#### `html` Tagged Template

Tagged template for templating.

```js
return html`<button>${count}</button>`;
```

#### [WIP] `store(initialValue)`

Global state management.

```js
// NOTE: UNIMPLEMENTED
const user = store({ name: 'Alice' });
```

## 💻 Installation & Usage

### 0️⃣ Clone the repo

```sh
  git clone https://github.com/toddpress/glint.git
```

#### 1️⃣ [WIP] Using CDN

```html
<!-- NOTE: UNIMPLEMENTED -->
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```

#### 2️⃣ [WIP] Install with NPM

```sh
# NOTE: UNIMPLEMENTED!
npm install glint-js
```

Then, in your components:

```js
// NOTE: UNIMPLEMENTED
import { component, signal, html } from 'glint-js';
```

## 🤝 Contributing

🚀 Want to help shape Glint? Open an issue or submit a PR!

-   👉 GitHub Issues (Coming soon!)

## 📜 License

MIT License – Use it freely!

## 🎯 TL;DR

-   🚀 No JSX, No build step, Just Web Components.
-   ⚡ No VDOM, only updates what changes.
-   🎨 Scoped styles for free, no extra tooling.
-   🔗 Works anywhere: Use inside React, Vue, Svelte, or vanilla JS.

<br />
<br />
<br />

### ✨ Glint – The lightweight UI framework we've been waiting for... that we're waiting for 😉
