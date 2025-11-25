import {
  css,
  html,
  define,
  onMount,
  onDestroy,
  signal,
  computed,
  effect
} from '../../../src/index.js';


export const Counter = define('tsp-counter', ({ start = 0 }) => {
  const count = signal(Number(start));
  const doubleCount = computed(() => count() * 2);

  function incrementCount() {
    count(count() + 1);
  }

  onMount(() => {
    console.log('[Counter] - component mounted');
  });

  onDestroy(() => {
    console.log('[Counter] - component unmounted');
  });

  effect(() => {
    console.log('[Counter] - count changed:', count());

    return () => {
      console.log('[Counter] - cleanup running');
    };
  });

  css`
    button {
      background-color: #08c;
      color: #fff;
      border: none;
      padding: 0.4rem 0.8rem;
    }
  `;

  return html`
    <button @click=${incrementCount}>Count: ${count}</button>
    <p>Double: ${doubleCount}</p>
  `;
});


export default Counter;
