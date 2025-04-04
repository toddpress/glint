import {
  component,
  html,
  css,
  signal,
  computed,
  onMount,
  onDestroy
} from '../../../src/index.js';

// This component will be loaded lazily when it's first used in the DOM
export default component('lazy-counter', ({ start = 0 }) => {
  console.log('[LazyCounter] - Component module loaded and executed');
  
  const count = signal(Number(start));
  const doubleCount = computed(() => count() * 2);

  function incrementCount() {
    count(count() + 1);
  }

  onMount(() => {
    console.log('[LazyCounter] - Component mounted');
  });

  onDestroy(() => {
    console.log('[LazyCounter] - Component unmounted');
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
});
