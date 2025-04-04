# Glint Separate Load and Register Example

This example demonstrates how to use the separate loading and registration functions in Glint for more control over the component lifecycle.

## How It Works

### 1. Register Components for Lazy Loading

```js
import { lazyComponent } from '../../src/index.js';

// Register components for lazy loading
lazyComponent('./components/ManualCounter.js');
lazyComponent('./components/ManualGreeting.js');
```

### 2. Load Components Without Registering

```js
import { loadComponent } from '../../src/index.js';

// Load the component but don't register it yet
loadComponent('manual-counter')
  .then(() => {
    console.log('Component loaded successfully');
    // Enable the register button
    registerButton.disabled = false;
  });
```

### 3. Register Components When Ready

```js
import { registerLoadedComponent } from '../../src/index.js';

// Register the component when the user clicks a button
registerButton.addEventListener('click', () => {
  const registered = registerLoadedComponent('manual-counter');
  
  if (registered) {
    // Create and add the component
    const counter = document.createElement('manual-counter');
    counter.setAttribute('start', '10');
    container.appendChild(counter);
  }
});
```

### 4. Automatic Loading and Registration

For comparison, the example also shows how components can be loaded and registered automatically when added to the DOM:

```js
// These components will be loaded and registered automatically
const counter = document.createElement('manual-counter');
counter.setAttribute('start', '50');
container.appendChild(counter);
```

## Benefits

- **More Control**: Separate loading and registration for more control over the component lifecycle
- **Better UX**: Load components in advance but only register them when needed
- **Optimized Performance**: Preload components during idle time for instant registration later
- **Flexible Implementation**: Choose between manual control or automatic loading/registration

## Implementation Details

The example demonstrates three approaches:

1. **Manual Loading and Registration**: Load and register components explicitly with separate function calls
2. **Automatic Loading and Registration**: Add components to the DOM and let them load and register automatically
3. **Combined Approach**: Use `importAndRegisterComponent()` to do both steps in one call

This flexibility allows developers to choose the approach that best fits their application's needs.
