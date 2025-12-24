import { define, html } from '../../../src';

define('tsp-counter', (ctx) => {
  // const { props, state, emit, onMount, onDestroy, effect } = ctx;
  const { state, props } = ctx;

  const start = Number(props.start ?? 0);
  const count = state.signal(start);
  const doubled = state.computed(() => count() * 2);

  function inc() {
    count(count() + 1);
  }

  function dec() {
    count(count() - 1);
  }

  return html`
    <div style="display:inline-flex;gap:.5rem;align-items:center;">
      <button onclick=${dec}>-</button>
      <span>Count: ${count} (x2 = ${doubled})</span>
      <button onclick=${inc}>+</button>
    </div>
  `;
});
