# Separate Load and Register in Glint

Glint now supports separate loading and registration functions for components, giving you more control over the component lifecycle.

## Basic Usage

### 1. Register Components for Lazy Loading

First, register your components for lazy loading:

```js
import { lazyComponent } from 'glint';

// Register components for lazy loading
lazyComponent('my-counter', './components/Counter.js');
lazyComponent('my-card', './components/Card.js');
```

### 2. Load Components Without Registering

Use the `loadComponent` function to load a component module without registering it:

```js
import { loadComponent } from 'glint';

// Load the component but don't register it yet
loadComponent('my-counter')
  .then(() => {
    console.log('Component loaded successfully');
    // Component is loaded but not registered yet
  });
```

### 3. Register Components When Ready

Use the `registerLoadedComponent` function to register a loaded component:

```js
import { registerLoadedComponent } from 'glint';

// Register the component when needed
const registered = registerLoadedComponent('my-counter');

if (registered) {
  // Create and add the component
  const counter = document.createElement('my-counter');
  counter.setAttribute('start', '10');
  container.appendChild(counter);
}
```

### 4. Combined Approach

If you don't need separate control, you can still use the combined function:

```js
import { importAndRegisterComponent } from 'glint';

// Load and register in one step
importAndRegisterComponent('my-counter')
  .then(() => {
    // Component is loaded and registered
    const counter = document.createElement('my-counter');
    container.appendChild(counter);
  });
```

## Automatic Loading and Registration

Components can also be loaded and registered automatically when added to the DOM:

```js
// This will trigger automatic loading and registration
const counter = document.createElement('my-counter');
document.body.appendChild(counter);
```

## Use Cases

### Preloading Components

Load components during idle time but only register them when needed:

```js
// During app initialization or idle time
Promise.all([
  loadComponent('my-counter'),
  loadComponent('my-card'),
  loadComponent('my-profile')
]).then(() => {
  console.log('All components preloaded');
});

// Later, when needed
registerLoadedComponent('my-counter');
```

### Conditional Registration

Load components but only register them if certain conditions are met:

```js
loadComponent('heavy-component')
  .then(() => {
    if (userHasPermission) {
      registerLoadedComponent('heavy-component');
    }
  });
```

### Progressive Enhancement

Start with a basic UI and progressively enhance it as components load:

```js
// Show a basic UI immediately
showBasicUI();

// Load advanced components in the background
loadComponent('advanced-chart')
  .then(() => {
    // Check if we should upgrade the UI
    if (shouldEnhanceUI()) {
      registerLoadedComponent('advanced-chart');
      upgradeUIWithChart();
    }
  });
```

## Benefits

- **More Control**: Separate loading and registration for more control over the component lifecycle
- **Better UX**: Load components in advance but only register them when needed
- **Optimized Performance**: Preload components during idle time for instant registration later
- **Flexible Implementation**: Choose between manual control or automatic loading/registration

## Example

See the complete example in the `examples/load-register` directory.
