# Glint Auto-Naming Components Example

This example demonstrates how to use the auto-naming feature in Glint to automatically derive component tag names from function names or file names.

## How It Works

### 1. Auto-Naming Regular Components

Instead of explicitly specifying a tag name, you can let Glint derive it from the function name:

```js
import { component, html } from '../../src/index.js';

// Function name 'Button' will be converted to 'gl-button'
export function Button({ label }) {
  return html`<button>${label}</button>`;
}

// Register with auto-naming
component(Button);
```

### 2. Auto-Naming Lazy-Loaded Components

For lazy-loaded components, the tag name can be derived from the file name:

```js
import { lazyComponent } from '../../src/index.js';

// File name 'UserProfile.js' will be converted to 'user-profile'
lazyComponent('./components/UserProfile.js');
```

### 3. Naming Convention

The auto-naming follows these rules:

- **Single-word components** get a "gl-" prefix (e.g., "Button" → "gl-button")
- **Multi-word components** are converted to kebab-case (e.g., "UserProfile" → "user-profile")

This ensures all component names follow the custom element naming requirements (must contain a hyphen).

## Benefits

- **Less Redundancy**: No need to repeat the component name in both the function name and tag name
- **Consistency**: Enforces a consistent naming convention across your application
- **Readability**: Component tag names directly reflect their function or file names
- **Maintainability**: Renaming a component function or file automatically updates its tag name

## Implementation Details

The auto-naming system consists of:

1. **toTagName Utility**: Converts PascalCase names to kebab-case tag names
2. **Enhanced component() Function**: Accepts either a tag name or a function
3. **Enhanced lazyComponent() Function**: Accepts either a tag name or a file path
4. **Naming Convention**: Follows web component naming requirements

This approach makes component registration more intuitive and reduces boilerplate code.
