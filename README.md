# Glint ✨

## 🔥 The no-bullshit web component framework 🔥

🚀 Glint is a fast, build-less Web Component-based UI framework that makes reactive web development simple and fun — All without the VDOM, complex hooks, or build tools.

  - ✅ No Babel, No JSX, No Webpack
  - ✅ Native Web Components & Scoped Styles
  - ✅ Fine-Grained Reactivity Without Re-Renders
  - ✅ Auto-Batching, No useEffect Hell
  - ✅ Built-in State Management, No Context API Needed

> 💡 Think React, but simpler, faster, and without the bloat.

## 🚀 Quick Start
Glint runs directly in the browser—no setup required.

### 1️⃣ Install

#### Via npm/etc. (Coming soon!):
```sh
npm install glint-js
```
#### or just use CDN (Coming soon!):

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```

### 2️⃣ Define a Component

```js
import { component, signal, html } from "glint-js";

component("counter-button", ({ start = 0 }) => {
  const count = signal(Number(start));

  return html`
    <button @click=${() => count.value++}>
      Clicked ${count} times
    </button>
  `;
});
```

### 3️⃣ Use It Like HTML

```html
<counter-button start="5"></counter-button>
```
Boom! 💥 Your component just works—no build step, no config, no bullshit.

## 🎯 Why Glint?
🔥 Glint aims for a DX similar to React without the headache.
  - ✅ No VDOM Overhead → Faster, direct DOM updates.
  - ✅ Zero Build Step → Works without Babel/Webpack/Vite.
  - ✅ Signals & Computed State → No useEffect boilerplate.
  - ✅ Scoped Styles for Free → No CSS-in-JS needed.
  - ✅ Event Binding Like HTML → Just use @click=${fn}.
  - ✅ Native Web Standards → No lock-in, just HTML, JS, and CSS.

## 🔍 React vs. Glint

| Feature | React | Glint |
|----------------|------------------|------------|
| **Build Tools** | Required (Babel, Webpack) | 🚀 **None** (Runs in browser) |
| **Reactivity**  | Hooks (`useState`, `useEffect`) | 🚀 **Signals & Computed State** |
| **Event Handling** | Synthetic Events | 🚀 **Native DOM Events** (`@click=${fn}`) |
| **Scoped Styles**  | CSS-in-JS, Emotion | 🚀 **Built-in Shadow DOM** |
| **Context API**    | Required for state sharing | 🚀 **Global `store()`** (No Prop Drilling) |
| **Performance**    | VDOM Reconciliation | 🚀 **Direct DOM Updates** |

## 📖 Features

### 🛠️ Simple, Reactive Components
Define components using signals—no hooks needed.

```js
component("my-counter", () => {
  const count = signal(0);
  return html`
    <button @click=${() => count.value++}>
      Count: ${count}
    </button>
  `;
});
```

### 🔗 Real Scoped Styles (No CSS-in-JS)

```js
component("styled-box", () => html`
  <style>
    div { background: purple; padding: 1em; color: white; }
  </style>
  <div>Styled Box</div>
`);
```

### ⚡ Computed State (No useMemo)

```js
const doubleCount = computed(() => count.value * 2);
```

### 🎭 Slots & Composition

```js
component("custom-card", () => html`
  <style>
    .card { border: 1px solid #ccc; padding: 1em; }
  </style>
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
  </div>
`);
```

```html
<custom-card>
  <h3 slot="header">Title</h3>
  <p>Content here</p>
</custom-card>
```

### 🌍 Global State Without Context API

```js
const theme = store("dark");
theme.value = "light";  // Updates all subscribers
```

### 🚀 Event Delegation, No Re-Renders

```js
<button @click=${handleClick}>Click Me</button>
```

Uses native event listeners, unlike React’s synthetic event system.

## 🎬 Live Demo

  🚀 Check out the interactive playground:

  👉 Glint Sandbox (Coming soon!)

## 🛠️ API Reference

### 1️⃣ `component(name, rendererFn)`
Registers a Web Component.

```js
component("hello-world", () => html`<h1>Hello, World!</h1>`);
```

#### 2️⃣ `signal(initialValue)`
Creates reactive state.

```js
const count = signal(0);
count.value++;
```

#### 3️⃣ `computed(fn)`
Creates a derived state.

```js
const double = computed(() => count.value * 2);
```

#### 4️⃣ `store(initialValue)`
Global state management.

```js
const user = store({ name: "Alice" });
```

#### 5️⃣ `html` Tagged Template
Tagged template for templating.

```js
return html`<button>${count}</button>`;
```

## 💻 Installation & Usage

#### 1️⃣ Using CDN (Coming soon!)

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```

#### 2️⃣ Install with NPM
```sh
npm install glint-js
```
```js
import { component, signal, html } from "glint-framework";
```

## 🤝 Contributing

🚀 Want to help shape Glint? Open an issue or submit a PR!

👉 GitHub Issues (Coming soon!)

## 📜 License
MIT License – Use it freely!

## 🎯 TL;DR
  - 🚀 No JSX, No build step, Just Web Components.
  - ⚡ No VDOM, only updates what changes.
  - 🎨 Scoped styles for free: No CSS-in-JS, no extra tooling.
  - 🔗 Works anywhere: Use inside React, Vue, Svelte, or vanilla JS.


 <p>✨ Glint – The Lightweight UI Framework We've been waiting for ✨</p>
