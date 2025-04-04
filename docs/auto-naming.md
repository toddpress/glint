# Auto-Naming Components in Glint

Glint now supports auto-naming components, allowing you to derive component tag names automatically from function names or file names. This reduces redundancy and makes your code more maintainable.

## Basic Usage

### Auto-Naming Regular Components

Instead of explicitly specifying a tag name, you can let Glint derive it from the function name:

```js
import { component, html } from 'glint';

// Function name 'Button' will be converted to 'gl-button'
function Button({ label }) {
  return html`<button>${label}</button>`;
}

// Register with auto-naming
component(Button);
```

### Auto-Naming Lazy-Loaded Components

For lazy-loaded components, the tag name can be derived from the file name:

```js
import { lazyComponent } from 'glint';

// File name 'UserProfile.js' will be converted to 'user-profile'
lazyComponent('./components/UserProfile.js');
```

## Naming Convention

The auto-naming follows these rules:

- **Single-word components** get a "gl-" prefix (e.g., "Button" → "gl-button")
- **Multi-word components** are converted to kebab-case (e.g., "UserProfile" → "user-profile")

This ensures all component names follow the custom element naming requirements (must contain a hyphen).

## Using with Default Exports

The `component()` function now returns the renderer function, making it perfect for default exports:

```js
// Button.js
import { component, html } from 'glint';

function Button({ label }) {
  return html`<button>${label}</button>`;
}

// Register and export in one line
export default component(Button);
```

## Traditional Usage Still Supported

You can still use the traditional approach with explicit tag names if you prefer:

```js
// Traditional approach
component('custom-button', ({ label }) => {
  return html`<button>${label}</button>`;
});

// Traditional lazy loading
lazyComponent('custom-profile', './components/Profile.js');
```

## Benefits

- **Less Redundancy**: No need to repeat the component name in both the function name and tag name
- **Consistency**: Enforces a consistent naming convention across your application
- **Readability**: Component tag names directly reflect their function or file names
- **Maintainability**: Renaming a component function or file automatically updates its tag name

## Example

See the complete example in the `examples/auto-naming` directory.
