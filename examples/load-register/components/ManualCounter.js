import {
  component,
  html,
  css,
  signal,
  computed,
  onMount
} from '../../../src/index.js';

// Simulate slow loading
await new Promise(resolve => setTimeout(resolve, 1500));

console.log('[ManualCounter] - Module loaded after delay');

// Define the component
export function ManualCounter({ start = 0 }) {
  const count = signal(Number(start));
  const doubleCount = computed(() => count() * 2);

  function incrementCount() {
    count(count() + 1);
  }

  onMount(() => {
    console.log('[ManualCounter] - Component mounted');
  });

  css`
    :host {
      display: block;
      margin: 10px 0;
    }
    .counter {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: #f0f8ff;
      border-radius: 4px;
    }
    button {
      background-color: #08c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .value {
      font-weight: bold;
      min-width: 50px;
    }
  `;

  return html`
    <div class="counter">
      <button @click=${incrementCount}>Increment</button>
      <span class="value">Count: ${count}</span>
      <span>Double: ${doubleCount}</span>
    </div>
  `;
}

// Register the component with auto-naming
component(ManualCounter);

// Export the component
export default ManualCounter;
