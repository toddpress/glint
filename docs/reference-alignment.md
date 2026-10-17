# Alignment with the supplied CodePen reference

The directly pasted source for `toddpress/ZYLXjog` is the behavioral reference. The single-file architecture and custom reactive scheduler were not copied into the library.

## Gap analysis and implementation

| Area | Previous repository | Result |
| --- | --- | --- |
| Reactivity | Preact-backed callable state; computed identity bug; no owned effects | Keep Preact; public signals/effects/batching/peek; correct computed identity; scoped state cleanup |
| Template values | HTML-only; clear/rebuild on updates; missing `Signal` import | HTML/SVG/MathML tags; compatible instances update slots; range-owned disposal |
| Bindings | Attributes, interpolation, `:prop`, `onclick` | Retain aliases; add `.prop`, `?boolean`, `@event`, refs; clean listeners and refs |
| Arrays/lists | Keyed entries recreated contents | Shared reconciliation retains ranges and row instances; reactive item/index; removal cleanup |
| Structural helpers | Getter expansion and limited fallbacks | Stable branches; explicit ownership; updated helper specs; array/iterable branch output |
| Components | Construction-time props; effects retained cleanup until disconnect | Reactive props; object definitions; explicit shadow/light modes; move-safe disconnect; fresh runtime on reconnect |
| Models | Owned cleanup TODO; shared instances never released | State passed to factories; owned compatibility; explicit shared disposal |
| Packaging/examples | Extensionless directory imports; missing component index; no test script | Native ESM; local import map; working example; library/global builds; test and check scripts |
| Diagnostics | Development-only logging | Opt-in config plus construction-read diagnostics; retained internal diagnostic messages |

## Module boundaries

- `core/signals/signal-adapter.js` isolates Preact. `signals.js` supplies callable accessors and state ownership.
- `core/scope.js` owns resources, detaches disposed children, and completes cleanup even when a disposer throws.
- `core/tags.js` holds template metadata; `template-analysis.js` parses/caches by literal identity, namespace, and document.
- `template-instance.js` wires/upgrades bindings. A node-part factory avoids a renderer/binding import cycle.
- `parts` separates value/event/ref bindings, node mode switching, list reconciliation, and structural branches.
- `component-props.js`, `component.js`, and `patterns/model.js` keep props, element runtime, and model conventions separate.
- The normal entry point has no global registration. `codepen.js` is the explicit global demonstration entry point.

## Compatibility decisions and reference defects avoided

- Keep Preact as the only runtime dependency. Its lazy computeds and established scheduler replace the demo's eager computeds and recursive flush loop.
- Preserve throwing on computed writes, instead of the reference's warning-and-ignore behavior.
- Preserve callable state shapes, existing public exports, attribute interpolation, event/property aliases, and light DOM by default, with explicit `define.shadow` opt-in.
- `each` callbacks now receive item/index signals to support the reference's persistent row semantics. `each.value` provides the old raw-value callback behavior. The bundled task-board example uses that compatibility path.
- Keep `model.owned`, pass state to new-style factories, and add shared-resource release. Old factories that create private state must expose/register their own cleanup.
- Template analysis scans accumulated markup, retains original property spelling, and handles quoted/multiple attribute expressions. It does not use the demo's last-chunk-only heuristics.
- Replaced structural specs rebind dependencies. Each views can change without leaving old closures attached. Undefined initial match keys still render fallback content.
- Keys are not coerced to strings. Duplicate keys throw before reconciliation rather than corrupting ownership after a warning. Unkeyed arrays use positional symbols that cannot collide with explicit keys.
- List moves are linear range moves. New-key membership is a Set rather than repeated array searches.
- Removed scopes detach from parents. Event listeners and refs are released on branch replacement, row removal, and mount disposal.
- Component removal is deferred one microtask to distinguish real removals from native disconnect/connect callbacks during synchronous range moves. This is an intentional difference from the reference's synchronous disposal.
- `ctx.props` also retains dashed-name aliases and JSON parsing. Snapshot destructuring remains static.
- Definition errors propagate instead of being misreported as duplicate registration. Cleanup still runs when definition/mount startup fails.

## Verification and limits

The Node regression suite exercises reactive dependency changes, effect cleanup, batching, readonly/disposed computed values, state disposal, scope error handling, bindings and aliases, template reuse, namespaces, refs, keyed row identity/replacement/indexes, duplicate keys, structural source replacement, branch cleanup, component props/moves/reconnection/events, models, and diagnostics.

The optional Chromium test exercises the actual static example (counter, task creation, completion and filters), form-associated ElementInternals with changing props, keyed custom-element moves and disposal, namespaces, and both generated bundles without page errors. All 28 regression tests passed on Node 20 and Node 24; the browser smoke test passed on Chromium 151. Both Rollup builds completed without warnings. Syntax checks, dry-run package contents, and native ESM root/subpath imports also passed.

Known limits:

- Chromium is the real-browser target verified here; Firefox, Safari, hydration, and SSR are unverified. Signals can be imported in Node without a DOM.
- Form association is retained and checked with FormData. Native validation UI and every platform form lifecycle callback are not covered.
- Dynamic tag/attribute names, spreads, expressions in inert `<template>` contents, and reactive markup inside comments are unsupported. Event/property/boolean bindings require one expression.
- Template identity is literal identity plus namespace. A changed literal shape replaces content; identical shapes retain it.
- Explicit standalone mount ownership requires `dispose`/`unmount`; arbitrary DOM removal does not automatically dispose an external mount.
- `createSignalAdapter` is a validated compatibility facade, not a mechanism to swap the library's active reactive engine. `tc39Signals` does not claim conformance to the evolving TC39 proposal.
- Legacy internal signal extensions are not exported through the public package and are outside this reference's supported capability set.
- Construction diagnostics report directly observed signal reads during setup. Reads hidden behind `peek`, tracked effects, or already-cached computed evaluation cannot provide complete dependency analysis.
- No lint rules or type checker are configured; `npm run check` is syntax validation. Test dependencies are development-only.

No remote actions, package publication, or pushes are part of this change.
