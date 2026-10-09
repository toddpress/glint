# Glint ⚡

Glint is a small, signal-powered library for native Web Components. It uses real HTML templates and fine-grained bindings, with Preact Signals as its only runtime dependency.

## Development

Use Node 20 or newer and Python 3 for the static example server.

```sh
npm ci
npm test
npm run check
npm run build
npm run build:codepen
npm start
```

The example is at `/examples/basic/index.html` on the static server. Its import map loads the installed Preact dependency locally. `npm run test:browser` exercises the example and library in an installed Chromium browser; set `CHROMIUM_PATH` if it is not `/usr/bin/chromium`. The test uses Playwright Core and does not download a browser. `npm run check` checks JavaScript syntax; there is no configured lint tool or type checker.

`dist/glint.js` is a self-contained ESM bundle. `dist/glint.codepen.js` also assigns the API to `window.Glint` for demonstrations. Normal library imports do not create globals. Package imports resolve to native ESM source; `@toddpress/glint/signals` and `@toddpress/glint/diagnostics` provide focused entry points. Node can import signals without a DOM, but rendering requires a browser document.

## Components and reactivity

```js
import { define, html } from '@toddpress/glint';

define('my-counter', ctx => {
  const count = ctx.state.signal(0);
  const doubled = ctx.state.computed(() => count() * 2);
  ctx.connected(() => console.log('connected'));
  ctx.disconnected(() => console.log('disconnected'));
  return html`
    <button @click=${() => count(count() + 1)}>
      ${count} (double: ${doubled})
    </button>
  `;
});
```

Signals are callable getters/setters. `signal`, `computed`, `effect`, `batch`, `peek`, `isSignal`, and `isComputed` are also available at the package root. Computeds are lazy and read-only; writing throws. Effects run immediately, return a callable disposer with `.dispose()`, and run returned cleanup before a rerun and at disposal. `batch` coalesces writes. `peek(signal)` reads without subscribing.

`createStateContainer()` owns computed values, effects, and registered cleanup:

```js
const state = createStateContainer();
const count = state.signal(0);
state.effect(() => {
  console.log(count());
  return () => console.log('cleanup');
});
state.own(() => releaseExternalResource());
state.dispose();
```

The former callable shape API is retained: `state({ count: 0, doubled: s => s.count() * 2 })`. State disposal is idempotent. Effects registered after disposal do not execute; cleanup registered late executes immediately. Disposed computeds retain their last evaluated value (or `undefined` if never evaluated), without evaluating new work during cleanup. Signals themselves remain ordinary writable values.

A signal read such as `${count()}` is a static snapshot. Use `${count}`, `${() => count() * 2}`, or a computed for reactive output. `configure({ diagnostics: true })` enables construction-read and template warnings; `peek` marks intentional snapshots. `getConfig()` returns a copy. Diagnostics are off by default.

## Template bindings

`html`, `svg`, and `mathml` return `TemplateResult` objects. SVG and MathML tags preserve their namespaces when nested in HTML. Templates with the same literal strings and kind update bindings in place.

```js
const input = ctx.ref();
html`
  <input ${input} .value=${text} ?disabled=${busy}
    @input=${event => text(event.target.value)}>
  <span title="Value: ${text}">${text}</span>
`;
```

- `${value}` accepts primitives, signals, getter functions, templates, DOM nodes, arrays, iterables, and structural helpers. `null`, `undefined`, and `false` produce no visible text. Plain objects are omitted with an optional diagnostic.
- `name=${value}` binds an attribute. Null/false remove it; true sets an empty attribute. Quoted interpolation such as `class="row ${status}"` is supported.
- `?name=${value}` binds a boolean attribute.
- `.name=${value}` binds a property, preserving camelCase. The existing `:name` syntax is also supported.
- `@event=${handler}` binds a listener without invoking it during rendering. The existing `onclick` style is supported. Handlers can be functions, listener objects, or signals containing either.
- `${ref()}` inside an opening element assigns `.current`; removal/disposal clears it. `ctx.ref()` is an alias.
- Root `key=${identity}` attributes in array child templates identify rows and are not rendered as attributes.

Dynamic tag names, dynamic attribute names, spread bindings, and interpolation inside inert `<template>` contents are unsupported. Event, property, and boolean bindings require a single expression. Treat template literal markup as trusted application code; interpolated text is inserted as text, not HTML.

## Lists and branches

```js
html`<ul>${each(tasks, task => task.id, (task, index) => html`
  <li>${index}: ${() => task().title}</li>
`)}</ul>`;
```

`each` passes **item and index signals** to the view. A row is constructed once per key, and those signals update when its item or position changes. This keeps input state and child component identity through reordering and immutable item replacement. Use explicit keys for objects; unique primitives can be implicit keys. Duplicate keys throw before mutating the list. Keys retain their original identity (`1` and `'1'` are distinct). `each.value(...)` retains the repository's previous raw-item/raw-index callback form, with in-place template updates when possible.

Array expressions flatten nested arrays/iterables. A child template's root `key` provides identity; missing keys use positional ownership. Changing template literal shape replaces that row's content. Removing rows disposes their bindings.

`when(condition, yes, no)` retains its branch while the truth value is unchanged. `match(value, cases)` selects own case entries; `_` is the reference fallback and `default` remains supported. Branches accept templates, primitives, arrays, and other mountable values. Branch changes dispose old resources. Wrap reads inside branch views in functions or computed signals when they must remain reactive.

## Component lifecycle and props

`define` uses light DOM by default. Shadow DOM is an explicit opt-in through `define.shadow(...)`. `define.light(...)` is a light DOM alias. Definitions may be functions returning a view, or `{ setup(ctx), view(ctx, local) }` objects.

`ctx.props` reads current attributes reactively when accessed inside effects or binding getters. Dashed and camelCase names are both available. Empty attributes become true; boolean, numeric, and JSON values are parsed. Destructuring `const { props } = ctx` captures a snapshot; use `() => ctx.props.title` for changes. Attribute updates propagate through MutationObserver, asynchronously.

`ctx.effect`, `ctx.state`, and `ctx.own` attach resources to the component. `connected`/`disconnected` hooks retain `onMount`/`onDestroy` aliases. `element`/`el`, `root`, and `internals()` are available. `{ formAssociated: true }` retains native form association. `ctx.emit(name, detail, options)` returns a CustomEvent and defaults to bubbling and composed behavior.

A real disconnect disposes resources in a microtask. This preserves runtime state during synchronous DOM moves, including keyed reordering. Reconnection after disposal creates a fresh state/setup/view. Disconnect and reconnect in the same turn preserve the existing runtime. Errors from invalid custom-element registration propagate; repeated valid definitions return the existing class with an optional warning.

## Mounting and models

`mount(target, value)` returns `{ update(value), dispose(), disposed }`; `unmount(target)` disposes its view. Updating a compatible template preserves DOM. Replacing a mount disposes its previous bindings. Call `dispose` or `unmount` when removing an externally mounted view; arbitrary DOM removal cannot infer ownership of standalone mounts.

`model(factory)` calls `factory(state)`. Use `model(factory)(ctx.state)` to attach model effects to component lifetime. Existing zero-argument factories still work, but any state they create themselves must be explicitly disposed. `model.owned(factory)(ctx)` remains available and registers an instance's `dispose` method when provided. `model.shared(key, factory)()` shares a state-owned instance; `model.disposeShared(key)` explicitly releases it.

`createSignalAdapter` validates an adapter shape. `tc39Signals` is a compatibility facade over Preact, **not a TC39 polyfill or a runtime adapter-selection mechanism**.

See [reference alignment notes](docs/reference-alignment.md) for architecture, compatibility decisions, and validation limits.

## Status and license

Experimental; MIT. This repository has regression tests and a browser smoke test, but does not promise cross-browser or server-rendering support.
