import {
  html,
  component,
  onMount,
  onDestroy,
  debouncedSignal,
  effect
} from '../../../src/core/index.js';

export const DelayedInput = component('tsp-delayed-input', () => {
  const delayedText = debouncedSignal(' ', 1000, {
    leading: false,
    trailing: true
  });

  onMount(() => {
    console.log('[DelayedInput] - component mounted');
  });

  onDestroy(() => {
    console.log('[DelayedInput] - component unmounted');
  });

  effect(() => {
    console.log('[DelayedInput] - text changed:', delayedText.value);
  });

  return html`
    <div>
      <input type="text" value="${delayedText}" />
      <pre>${delayedText}</pre>
    </div>
  `;
});

export default DelayedInput;