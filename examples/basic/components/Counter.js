import { define, html } from '../../../src';

define('tsp-counter', (ctx) => {
  const { state, props } = ctx;

  const start = Number(props.start ?? 0);
  const count = state.signal(start);
  const doubled = state.computed(() => count() * 2);

  function increment() {
    count(count() + 1);
  }

  function decrement() {
    count(count() - 1);
  }

  return html`
    <div style="display: inline-flex; gap: 0.5rem; align-items: center;">
      <button onclick=${decrement}>-</button>
      <span>Count: ${count} (x2 = ${doubled})</span>
      <button onclick=${increment}>+</button>
    </div>
  `;
});
