# Lazy Loading Components in Glint

Glint now supports lazy loading components, allowing you to load components on-demand instead of registering all components upfront. This can significantly improve initial load time and performance for applications with many components.

## Basic Usage

### 1. Register Components for Lazy Loading

Use the `lazyComponent` function to register components that should be loaded on-demand:

```js
import { lazyComponent } from 'glint';

// Register components for lazy loading
lazyComponent('my-counter', './components/Counter.js');
lazyComponent('my-card', './components/Card.js');
```

### 2. Enable Lazy Loading in the Render Function

When bootstrapping your application, set the `lazyLoad` option to `true`:

```js
import { render } from 'glint';

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
    <my-counter start="10"></my-counter>
    <my-card title="Hello World"></my-card>
  </div>
`;
```

When the template is rendered, Glint will:
1. Detect that these components are not yet registered
2. Create a minimal placeholder element with the same tag name
3. Add a `data-loading` attribute to the placeholder
4. Dynamically import the component module
5. Register the component
6. Replace the placeholder with the actual component

## Component Implementation

When implementing a lazy-loaded component, make sure to export it as the default export:

```js
// Counter.js
import { component, html, signal } from 'glint';

export default component('my-counter', ({ start = 0 }) => {
  const count = signal(Number(start));

  return html`
    <button @click=${() => count(count() + 1)}>
      Count: ${count}
    </button>
  `;
});
```

## Dynamic Component Creation

You can also create components dynamically:

```js
// The component will be loaded on-demand when added to the DOM
const counter = document.createElement('my-counter');
counter.setAttribute('start', '100');
container.appendChild(counter);
```

## Advanced Usage

### Manual Component Loading

You can manually trigger component loading before it's needed:

```js
import { importAndRegisterComponent } from 'glint';

// Preload a component
importAndRegisterComponent('my-counter')
  .then(() => {
    console.log('Component loaded and registered');
  })
  .catch(error => {
    console.error('Failed to load component', error);
  });
```

### Component Loading States

Placeholder elements have a `data-loading` attribute that you can use for styling:

```css
/* Style all components that are loading */
[data-loading] {
  min-height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
}

/* Style specific component types that are loading */
my-counter[data-loading] {
  border: 1px dashed #ccc;
}
```

## Benefits

- **Reduced Initial Load Time**: Only load components when they're actually used
- **Code Splitting**: Each component is in its own module, reducing bundle size
- **Progressive Loading**: Components load as needed, improving perceived performance
- **Dynamic UI**: Create components on-demand based on user interactions
- **Clean UI**: Minimal placeholders without distracting loading indicators
- **Flexible Styling**: Style loading states however you want with CSS

## Examples

See the complete examples in:
- `examples/lazy-loading` - Basic lazy loading example
- `examples/minimal-placeholder` - Example with minimal placeholder styling
