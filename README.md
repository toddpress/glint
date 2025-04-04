# Glint ✨ [WIP]

## 🔥 The no-bullshit, bullshit web component framework 🔥

🚀 Glint is a fast, build-less native web component-based UI framework that makes reactive web development simple and fun again — All without the virtual DOM, complex hooks, or build tools.

  - ✅ No Babel, No JSX, No Webpack
  - ✅ Native Web Components & Scoped Styles
  - ✅ Fine-Grained Reactivity Without Re-Renders
  - ✅ Auto-Batching, No useEffect Hell
  - ✅ Built-in State Management, No Context API Needed
  - ✅ Lazy Loading Components On-Demand
  - ✅ Auto-Naming Components from Export Names
  - ✅ Separate Load and Register Functions

> 💡 Think React, but simpler, faster, and without the bloat.

## ⚠️ Disclaimer
**👉 Use something like `lit-element` or `React`/`Preact` if you require production-grade component abstractions.** Glint is conceptually awesome, but it's not yet ready for prime time -- just remember to check back soon! And please contribute 🙏

> Glint is still very much a **work in progress**: Features, APIs, and documentation may be assumed **incomplete and are subject to change**. While we’re actively developing and iterating, please **expect breaking changes** or inconsistencies between the code and the docs.
> In essence... Proceed with caution if you need production stability!

## 🚀 Quick Start
Glint runs directly in the browser—no setup required. [Check it out on codepen](https://codepen.io/toddpress/pen/wBvYgyJ)!

### 1️⃣ Install (Coming soon!)

For now, you can clone the repo and use the `src/index.js` file in your project.

```html
<script type="module" src="path/to/src/index.js"></script>
```

<!--

#### Via `npm`:
```sh
npm install glint-js
```
#### or just use CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```
-->

### 2️⃣ Define a custom component

```js
import { component, signal, html } from "glint-js";

component("counter-button", ({ start = 0 }) => {
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

### 4️⃣ Bootstrap your Glint✨ App entrypoint

```js
// top-level app component
const App = () => html`
  <main>
    <counter-button start="5" />
  </main>
`;
  // bootstrapping in entry point
  render(App, {
    autoRegister: true,
    rootNode: document.querySelector('#glint-app')
  })
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
  - ✅ Lazy Loading → Load components on-demand for better performance.
  - ✅ Auto-Naming → Derive tag names from export names.
  - ✅ Separate Load/Register → More control over component lifecycle.

## 🔍 React vs. Glint

| Feature | React | Glint |
|----------------|------------------|------------|
| **Build Tools** | Required (Babel, Webpack) | 🚀 **None** (Runs in browser) |
| **Reactivity**  | Hooks (`useState`, `useEffect`) | 🚀 **Signals & Computed State** |
| **Event Handling** | Synthetic Events | 🚀 **Native DOM Events** (`@click=${fn}`) |
| **Context API**    | Required for state sharing | 🚀 **Global `store()`** (No Prop Drilling) |
| **Performance**    | VDOM Reconciliation | 🚀 **Direct DOM Updates** |
| **Code Splitting** | Dynamic imports, React.lazy | 🚀 **Lazy Component Loading** |
| **Component Names** | Explicit declaration | 🚀 **Auto-derived from exports** |

<!--
| **Scoped Styles**  | CSS-in-JS, Emotion | 🚀 **Built-in Shadow DOM** |
-->
## 📖 Features

### 🛠️ Simple, Reactive Components
Define components using signals—no hooks needed.

```js
component("my-counter", () => {
  const count = signal(0);
  return html`
    <button @click=${() => count(count() + 1)}>
      Count: ${count}
    </button>
  `;
});
```
<!--
### 🔗 Real Scoped Styles (No CSS-in-JS)

```js
component("styled-box", () => html`
  <style>
    div { background: purple; padding: 1em; color: white; }
  </style>
  <div>Styled Box</div>
`);
```
-->

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

### 🚀 Lazy Loading Components

```js
// Register components for lazy loading
import { lazyComponent } from "glint-js";

lazyComponent("my-counter", "./components/Counter.js");

// Enable lazy loading in the render function
render(App, {
  lazyLoad: true,
  rootNode: document.getElementById("app")
});
```

Components are loaded on-demand when they're first used in the DOM.

### 🎁 Auto-Naming Components

```js
import { component } from "glint-js";

// Function name 'Button' will be converted to 'gl-button'
function Button({ label }) {
  return html`<button>${label}</button>`;
}

// Register with auto-naming
component(Button);

// For lazy loading, derive name from file path
lazyComponent("./components/UserProfile.js"); // -> user-profile
```

No need to manually specify tag names - they're derived from export names.

### 🔑 Separate Load and Register

```js
import { loadComponent, registerLoadedComponent } from "glint-js";

// Load the component but don't register it yet
loadComponent("my-counter").then(() => {
  console.log("Component loaded successfully");
});

// Later, when needed
registerLoadedComponent("my-counter");

// Create and use the component
const counter = document.createElement("my-counter");
document.body.appendChild(counter);
```

More control over the component lifecycle with separate loading and registration.

### 🌍 Global State Without Context API (Coming soon!)
<!--
```js
const theme = store("dark");
theme.value = "light";  // Updates all subscribers
``` -->

### 🚀 Event Delegation, No Re-Renders

```js
<button @click=${handleClick}>Click Me</button>
```

Uses native event listeners, unlike React’s synthetic event system.

## 🎬 Live Demo
  <p><b><a href="https://codepen.io/toddpress/pen/NPWyKRB?editors=1010">DEMO</a></b> on Codepen</p>

  > 💡 Glint was developed entirely on Codepen... Thank you Chris Coyer (:

  🚀 Check out the interactive playground:
  - 👉 Glint Sandbox (Coming soon!)

## 🛠️ API Reference

### `component(name, rendererFn)` or `component(rendererFn)`
Registers a Web Component.

```js
// With explicit name
component("hello-world", () => html`<h1>Hello, World!</h1>`);

// With auto-naming (derives 'gl-button' from function name)
function Button({ label }) {
  return html`<button>${label}</button>`;
}
component(Button);
```

### `lazyComponent(name, path)` or `lazyComponent(path)`
Registers a component for lazy loading.

```js
// With explicit name
lazyComponent("my-counter", "./components/Counter.js");

// With auto-naming (derives 'user-profile' from file name)
lazyComponent("./components/UserProfile.js");
```

### `loadComponent(name)`
Loads a component module without registering it.

```js
// Load the component but don't register it yet
loadComponent("my-counter").then(() => {
  console.log("Component loaded successfully");
});
```

### `registerLoadedComponent(name)`
Registers a component that has been loaded.

```js
// Register the component when needed
const registered = registerLoadedComponent("my-counter");
```

### `signal(initialValue)`
Creates reactive state.

```js
const count = signal(0);
count.value++;
```

### `computed(fn)`
Creates a derived state.

```js
const double = computed(() => count.value * 2);
```

### `html` Tagged Template
Tagged template for templating.

```js
return html`<button>${count}</button>`;
```

<!-- #### `store(initialValue)`
Global state management.

```js
const user = store({ name: "Alice" });
``` -->

## 💻 Installation & Usage

### 0️⃣ Clone the repo
```sh
  git clone https://github.com/toddpress/glint.git
```

 #### 1️⃣ Using CDN (Coming soon!)
<!--
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/glint-js"></script>
```
-->
#### 2️⃣ Install with NPM (Coming soon!)
<!--
```sh
npm install glint-js
```
```js
import { component, signal, html } from "glint-js";
``` -->

## 🤝 Contributing

🚀 Want to help shape Glint? Open an issue or submit a PR!
  - 👉 GitHub Issues (Coming soon!)

## 📜 License
MIT License – Use it freely!

## 🎯 TL;DR
  - 🚀 No JSX, No build step, Just Web Components.
  - ⚡ No VDOM, only updates what changes.
  - 🎨 Scoped styles for free: No CSS-in-JS, no extra tooling.
  - 🔗 Works anywhere: Use inside React, Vue, Svelte, or vanilla JS.
  - 📦 Lazy loading: Load components on-demand for better performance.
  - 🎁 Auto-naming: Derive tag names from export names.
  - 🔑 Separate load/register: More control over component lifecycle.

<br />
<br />
<br />

### ✨ Glint – The lightweight UI framework we've been waiting for (that we're waiting for 😉) ✨
