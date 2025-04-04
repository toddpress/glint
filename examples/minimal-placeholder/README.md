# Glint Minimal Placeholder Example

This example demonstrates how to use the minimal placeholder feature in Glint for lazy-loaded components. Instead of showing a loading indicator, components are loaded with a minimal placeholder element that has a `data-loading` attribute.

## How It Works

### 1. Register Components for Lazy Loading

```js
import { lazyComponent } from '../../src/index.js';

// Register components for lazy loading
lazyComponent('./components/SlowCounter.js');
lazyComponent('./components/SlowGreeting.js');
```

### 2. Enable Lazy Loading in the Render Function

```js
render(App, {
  autoRegister: true,
  lazyLoad: true,
  rootNode: document.getElementById('app')
});
```

### 3. Use Components in Templates

```js
const App = () => html`
  <div>
    <slow-counter start="10"></slow-counter>
    <slow-greeting name="World"></slow-greeting>
  </div>
`;
```

### 4. Style Loading Placeholders (Optional)

You can style components that are in the loading state using the `data-loading` attribute:

```css
[data-loading] {
  min-height: 20px;
  position: relative;
  outline: 1px dashed #ccc;
  background-color: #f9f9f9;
}
```

## Implementation Details

When a component is being loaded:

1. A minimal placeholder element is created with the same tag name
2. The placeholder has a `data-loading` attribute and a `__placeholder` property
3. No loading text or visual indicators are added by default
4. When the real component is loaded, all placeholder instances are replaced

This approach provides several benefits:

- **Clean UI**: No distracting loading indicators unless you want them
- **Semantic HTML**: The DOM structure remains the same during loading
- **Flexible Styling**: You can style loading states however you want with CSS
- **Minimal Overhead**: Placeholder elements are extremely lightweight

## Example Components

The example includes two components with simulated loading delays:

- **SlowCounter**: A counter component with a 2-second loading delay
- **SlowGreeting**: A greeting component with a 1.5-second loading delay

These delays help demonstrate how the placeholder elements work while components are loading.
