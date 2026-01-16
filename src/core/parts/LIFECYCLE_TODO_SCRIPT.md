# ✅ Glint Part Lifecycle Migration Checklist

> **Rule:** Do not move to the next section until *all* TODOs in the current section are resolved.

---

## PHASE 1 — Lock the Part lifecycle (FOUNDATION)

### 1. `Part` base class

**File(s):**
- `src/core/part.js` (or equivalent)

```ts
// TODO(PART-CTOR): Ensure Part constructor only declares ownership & bookkeeping
//   - initialize this.scope
//   - initialize this.ownedParts = []
//   - initialize this.mounted = false
//   - register with owner via owner.addOwnedPart(this) if owner exists
//   - DO NOT mount scope
//   - DO NOT run effects
//   - DO NOT touch DOM
//   - DO NOT read signals

// TODO(PART-MOUNT): Implement mount() lifecycle method
//   - guard against double-mount
//   - set this.mounted = true
//   - mount this.scope
//   - mount all ownedParts AFTER mounting self

// TODO(PART-DISPOSE): Implement dispose() lifecycle method
//   - guard against double-dispose
//   - dispose all ownedParts BEFORE disposing self.scope
//   - clear ownedParts array
//   - dispose this.scope
//   - ensure idempotence

// TODO(PART-INVARIANT): Verify no other lifecycle-like methods exist on Part
```

**Done when**
> Reading `Part` top-to-bottom clearly shows:
> *construction declares → mount activates → dispose destroys*

---

## PHASE 2 — Rename + semantic alignment (NO BEHAVIOR CHANGE)

### 2. Ownership naming audit

```ts
// TODO(NAMING): Rename lifecycle ownership identifiers
//   children        -> ownedParts
//   addChild        -> addOwnedPart
//   createChild     -> createOwnedPart
//   effectScope     -> scope

// TODO(NAMING): Ensure no method or property implies DOM hierarchy
// TODO(NAMING): Ensure ownership verbs always imply lifecycle responsibility
```

**Done when**
> Grepping `children` only finds actual DOM usage, never Parts.

---

### 3. Scope semantics audit

```ts
// TODO(SCOPE): Ensure all effects are declared via this.scope.effect(...)
// TODO(SCOPE): Ensure effects are inert until scope.mount()
// TODO(SCOPE): Ensure all effect cleanup happens via scope.dispose()
// TODO(SCOPE): Remove any eager autorun / effect execution
```

**Done when**
> Exactly one line of code activates effects: `this.scope.mount()`.

---

## PHASE 3 — Template instantiation boundary (STRUCTURE vs LIFECYCLE)

### 4. Template instantiation function (formerly `renderTemplate`)

**File(s):**
- `src/core/template.js` (or equivalent)

```ts
// TODO(TEMPLATE-INSTANTIATE): Rename old renderTemplate semantics if still present
// TODO(TEMPLATE-INSTANTIATE): Ensure instantiation does the following ONLY:
//   - clone static DOM fragment
//   - create RootPart
//   - create Parts from PartSpec
//   - establish ownership relationships
// TODO(TEMPLATE-INSTANTIATE): Ensure instantiation DOES NOT:
//   - call mount()
//   - trigger effects
//   - perform reactive updates
// TODO(TEMPLATE-INSTANTIATE): Return an UNMOUNTED instance
```

**Done when**
> Instantiation builds something complete but inert.

---

### 5. `RootPart`

```ts
// TODO(ROOTPART): Ensure RootPart extends Part
// TODO(ROOTPART): Ensure RootPart owns the top-level scope
// TODO(ROOTPART): Remove any lifecycle overrides unless used for dev guards
// TODO(ROOTPART): Ensure RootPart acts only as lifecycle anchor
```

**Done when**
> RootPart adds no behavior — only structure.

---

## PHASE 4 — Mount call sites (EXPLICIT ACTIVATION)

### 6. Locate and isolate all `mount()` calls

```ts
// TODO(MOUNT-SITES): Search for mount() usage
// TODO(MOUNT-SITES): Ensure exactly ONE mount() call per instance
// TODO(MOUNT-SITES): Ensure mount() is called from ONLY:
//   - render(...)
//   - custom element connectedCallback
//   - explicit user API
// TODO(MOUNT-SITES): Remove any constructor/helper that calls mount()
```

**Done when**
> You can point to one line and say:
> *“This is where Glint comes alive.”*

---

## PHASE 5 — Concrete Part audits (MECHANICAL)

### 7. `NodePart`

```ts
// TODO(NODEPART): Ensure constructor only declares effects (no DOM writes)
// TODO(NODEPART): Ensure update() mutates DOM ONLY within its range
// TODO(NODEPART): Ensure dispose() clears range and calls super.dispose()
// TODO(NODEPART): Ensure NodePart cannot leak DOM or effects
```

**Done when**
> Misusing NodePart cannot cause global side effects.

---

### 8. `EachPart` (after lifecycle is locked)

```ts
// TODO(EACHPART): Ensure EachPart owns child Parts exclusively
// TODO(EACHPART): Ensure children are created via createOwnedPart()
// TODO(EACHPART): Ensure removed children are disposed explicitly
// TODO(EACHPART): Ensure DOM removal NEVER implies disposal
// TODO(EACHPART): Ensure no Parts are created during DOM walking
```

**Done when**
> Remaining list bugs are logic bugs, not lifecycle bugs.

---

### 9. `when` / `match`

```ts
// TODO(WHEN): Implement when as 0-or-1 owned Part
// TODO(MATCH): Implement match as exactly-1-of-N owned Parts
// TODO(CONTROL): Ensure no special lifecycle rules exist
// TODO(CONTROL): Reuse standard ownership + disposal logic
```

**Done when**
> These helpers feel boring and obvious.

---

## PHASE 6 — Deletions (VERY IMPORTANT)

### 10. Remove invalid pathways

```ts
// TODO(DELETE): Remove Parts created during DOM walking
// TODO(DELETE): Remove render-time effect mounting
// TODO(DELETE): Remove DOM replacement implying disposal
// TODO(DELETE): Fully remove old renderTemplate semantics
```

**Done when**
> Half-rendering becomes structurally impossible.

---

## PHASE 7 — Dev-mode guards (OPTIONAL BUT JUICY)

```ts
// TODO(DEV-GUARD): Warn on double mount()
// TODO(DEV-GUARD): Warn on dispose() before mount()
// TODO(DEV-GUARD): Warn on update() before mount()
// TODO(DEV-GUARD): Keep warnings colocated with lifecycle code
```

**Done when**
> Correct usage is silent; misuse is loud.

---

## 🔒 Final invariant (paste at top of `Part`)

```ts
/**
 * Glint Part Lifecycle Invariants:
 *
 * - Construction declares ownership only
 * - mount() is the only activation point
 * - dispose() is the only teardown path
 * - Parents outlive children
 * - DOM mutation never implies lifecycle
 */
```
