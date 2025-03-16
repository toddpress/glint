import {
  html,
  component,
  onMount,
  onDestroy,
  signal,
  computed,
  effect
} from '../../../src/core/index.js';


export const Counter = component('tsp-counter', ({ start = 0 }) => {
  const count = signal(Number(start));
  const doubleCount = computed(() => count.value * 2);


  function increment() {
    count.value += 1;
  }


  onMount(() => {
    console.log('[Counter] - component mounted');
  });


  onDestroy(() => {
    console.log('[Counter] - component unmounted');
  });


  effect(() => {
    console.log('[Counter] - count changed:', count.value);
  });


  return html`
    <div>
      <button @click=${increment}>Count: ${count}</button>
      <p>Double: ${doubleCount}</p>
    </div>
  `;
});


export default Counter;