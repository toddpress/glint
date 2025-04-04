# Glint Lazy Loading Components Example

This example demonstrates how to use the lazy loading feature in Glint to load components on-demand instead of registering all components upfront.

## How It Works

### 1. Register Components for Lazy Loading

Instead of importing all components directly, we register them for lazy loading using the `lazyComponent` function:

```js
import { lazyComponent } from '../../src/index.js';

// Register components for lazy loading
lazyComponent('lazy-counter', './components/LazyCounter.js');
lazyComponent('lazy-greeting', './components/LazyGreeting.js');
```

### 2. Enable Lazy Loading in the Render Function

When bootstrapping the application, set the `lazyLoad` option to `true`:

```js
render(App, {
  autoRegister: true,
  lazyLoad: true, // Enable lazy loading
  rootNode: document.getElementById('app')
});
```

### 3. Use Components in Templates

Now you can use the components in your templates as usual:

```js
const App = () => html`
  <div>
    <lazy-counter start="10"></lazy-counter>
    <lazy-greeting name="World"></lazy-greeting>
  </div>
`;
```

When the template is rendered, Glint will:
1. Detect that these components are not yet registered
2. Show a loading placeholder
3. Dynamically import the component module
4. Register the component
5. Replace the placeholder with the actual component

### 4. Dynamic Component Creation

You can also create components dynamically:

```js
const newCounter = document.createElement('lazy-counter');
newCounter.setAttribute('start', '100');
container.appendChild(newCounter);
```

The component will be loaded on-demand when it's first added to the DOM.

## Benefits

- **Reduced Initial Load Time**: Only load components when they're actually used
- **Code Splitting**: Each component is in its own module, reducing bundle size
- **Progressive Loading**: Components load as needed, improving perceived performance
- **Dynamic UI**: Create components on-demand based on user interactions

## Implementation Details

The lazy loading system consists of:

1. **Component Path Registry**: Maps component names to their module paths
2. **Loading Placeholder**: Shows while the component is being loaded
3. **Dynamic Import**: Uses ES modules to load components asynchronously
4. **Component Registration**: Registers components with the Web Components API when loaded
5. **DOM Replacement**: Replaces placeholders with actual components once loaded

This approach allows for a more efficient application that loads only what it needs when it needs it.
