# ✅ Glint Part Lifecycle Migration Checklist (Authoritative)

SEE [ChatGPT THREAD](https://chatgpt.com/g/g-p-68256a387df08191a878c0ec678d2154-glint/c/6969a405-52c8-832e-84c5-8974746b9a0c) FOR FULL CONTEXT

## Questions
- [What instantiates the RootPart? How many are there?](https://chatgpt.com/g/g-p-68256a387df08191a878c0ec678d2154-glint/c/6969a405-52c8-832e-84c5-8974746b9a0c#:~:text=holds%20onto%20the%20RootPart)
  - one globally or one per BaseComponent instance?
- [What's the difference between a `Part` and a `scope`?](https://chatgpt.com/g/g-p-68256a387df08191a878c0ec678d2154-glint/c/6969a405-52c8-832e-84c5-8974746b9a0c#:~:text=children%20are%20owned%20Parts%2C%20not%20DOM%20guesses)
  - is a `scope` just the effect container for a `Part`?
  - Is a `Part` just a lifecycle owner for a `scope` with behaviors and related properties (e.g. start, end)?
- [Which is it, a `DOMRangePartDescriptor` or `RangeSpec`?](https://chatgpt.com/g/g-p-68256a387df08191a878c0ec678d2154-glint/c/6969a405-52c8-832e-84c5-8974746b9a0c#:~:text=range%3A%20RangeSpec%20(critical))
  - Are they the same thing?
  - If not, which is the most correct to use?
- [Prompt: `Create a dictionary of terms to be used in glint's Part. Include defs, examples, and synonyms where applicable.`](https://chatgpt.com/)
-

- How to handle custom elements that may be connected/disconnected multiple times?

> **Rule:** Do not move to the next section until *all* boxes in the current section are satisfied.

---

## PHASE 1 — Lock the Part lifecycle (FOUNDATION)

- [START HERE BY BRANCHING THE THREAD AND ASKING TO START PHASE 1 CONCRETELY](https://chatgpt.com/g/g-p-68256a387df08191a878c0ec678d2154-glint/c/6969a405-52c8-832e-84c5-8974746b9a0c#:~:text=If%20you%20want%2C%20next%20message%20we%20should%20start%20Phase%201%20concretely%3A)
  - exact Part.mount() contract
  - whether Parts default to mounted or inert
  - how mount cascades without double-activation
      - idempotency
      - same guard for dispose

### 1. `Part` base class

**File(s):**
- `src/core/parts/base/Part.js`

#### Checklist
- [ ] `Part` constructor:
  - [ ] creates `this.scope`
  - [ ] initializes `this.ownedParts = []`
  - [ ] initializes `this.mounted = false`
  - [ ] registers with owner via `owner.addOwnedPart(this)` if owner exists
- [ ] Constructor does **NOT**:
  - [ ] mount scope
  - [ ] run effects
  - [ ] touch DOM
  - [ ] read signals
- [ ] `mount()`:
  - [ ] idempotent (guard against double mount)
  - [ ] mounts `this.scope`
  - [ ] mounts all `ownedParts` **after** mounting self
- [ ] `dispose()`:
  - [ ] idempotent
  - [ ] disposes all `ownedParts` **before** disposing `this.scope`
  - [ ] clears `ownedParts`
- [ ] No other lifecycle methods exist

#### Done when
> You can read `Part` top-to-bottom and say:
> “Construction declares, mount activates, dispose destroys — nothing else.”

---

## PHASE 2 — Rename + semantic alignment (NO BEHAVIOR CHANGE)

### 2. Ownership naming audit

**Search & replace targets:**
- `children` → `ownedParts`
- `addChild` → `addOwnedPart`
- `createChild` → `createOwnedPart`
- `effectScope` → `scope`

#### Checklist
- [ ] No identifier named `children` remains in Part logic
- [ ] No method name implies DOM hierarchy
- [ ] All ownership verbs imply lifecycle responsibility

#### Done when
> You can grep `children` and it only appears in *actual DOM code*, not Parts.

---

### 3. Scope semantics audit

**Files:**
- Any Part subclass
- Any effect helper

#### Checklist
- [ ] All effects are declared via `this.scope.effect(...)`
- [ ] No effect runs before `mount()`
- [ ] No effect cleanup lives outside `dispose()`

#### Done when
> There is **exactly one place** effects become live: `scope.mount()`.

---

## PHASE 3 — Template instantiation boundary (STRUCTURE vs LIFECYCLE)

### 4. Template instantiation function (formerly `renderTemplate`)

**File(s):**
- `src/core/template.js` or equivalent

#### Checklist
- [ ] Function:
  - [ ] clones static DOM
  - [ ] creates `RootPart`
  - [ ] creates Parts from specs
  - [ ] establishes ownership
- [ ] Function does **NOT**:
  - [ ] call `mount()`
  - [ ] trigger effects
  - [ ] perform reactive updates
- [ ] Returns an **unmounted instance**

#### Done when
> The returned instance is “fully built but dead”.

---

### 5. `RootPart`

**File(s):**
- `src/core/parts/base/RootPart.js`

#### Checklist
- [ ] `RootPart` extends `Part`
- [ ] Owns the top-level scope
  - [ ] What's the top level scope -- the component instance scope?
- [ ] Acts only as lifecycle anchor
- [ ] Does **not** override lifecycle unless for dev guards

#### Done when
> Deleting `RootPart` would break nothing except lifecycle anchoring.

---

## PHASE 4 — Mount call sites (EXPLICIT ACTIVATION)

### 6. Find and isolate all `mount()` calls

**Search for:**
- `mount(`
- effect activation
- implicit first-run logic

#### Checklist
- [ ] There is **exactly one** `mount()` call per instance
- [ ] That call is:
  - [ ] public `mount(...)` API, or
  - [ ] custom element `connectedCallback`, or
  - [ ] an explicit user API (e.g. `mount(...)`, as above)
- [ ] No constructor, helper, or Part calls `mount()`

#### Done when
> You can point to the line of code and say
> “This is where Glint comes alive.”

---

## PHASE 5 — Concrete Part audits (MECHANICAL)

### 7. `NodePart`

#### Checklist
- [ ] Constructor:
  - [ ] declares effects only
- [ ] `update()`:
  - [ ] mutates DOM **only within its range**
- [ ] `dispose()`:
  - [ ] clears its range
  - [ ] calls `super.dispose()`

#### Done when
> NodePart cannot leak DOM or effects even if misused.

---

### 8. `EachPart`

#### Checklist
- [ ] Owns child Parts exclusively
- [ ] Creates children via `createOwnedPart`
- [ ] Disposes removed children explicitly
- [ ] Never infers lifecycle from DOM removal
- [ ] Never creates Parts during DOM walking

#### Done when
> List bugs can only be logic bugs — not lifecycle bugs.

---

### 9. `when` / `match`

#### Checklist
- [ ] Implemented as 0–1 or 1–N owned Parts
- [ ] No special lifecycle rules
- [ ] Reuse the same ownership + disposal logic

#### Done when
> These helpers feel boring.

---

## PHASE 6 — Deletions (VERY IMPORTANT)

### 10. Delete invalid pathways

#### Checklist
- [ ] No Parts created during DOM walking
- [ ] No render-time effect mounting
- [ ] No DOM replacement implying disposal
- [ ] `analyzeTemplate` & `instantiateTemplate` implemented
  - `analyzeTemplate` returns only a spec
  - `instantiateTemplate` creates Parts and establishes ownership but does not mount them
- [ ] `renderTemplate` (old semantics) fully removed

#### Done when
> You cannot accidentally “half render” anything.

---

## PHASE 7 — Dev-mode guards (OPTIONAL BUT JUICY)

### 11. Lifecycle misuse warnings

#### Checklist
- [ ] Warn on:
  - [ ] double mount
  - [ ] dispose before mount
  - [ ] update before mount
- [ ] Warnings live close to lifecycle code

#### Done when
> Misuse is loud, correct use is silent.

---

## 🔒 Final invariant (paste this at the top of `Part`)

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
