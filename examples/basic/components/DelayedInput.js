import {
  html,
  effect,
  component,
  onMount,
  onDestroy,
  debouncedSignal,
} from '../../../src/index.js';

export const DelayedInput = component('tsp-delayed-input', () => {
  const delayedText = debouncedSignal(' ', 1000, {
      leading: false,
      trailing: true,
  });

  function setDelayedText(e) {
      const text = e?.target?.value ?? ''
      delayedText(text);
  }

  onMount(() => {
      console.log('[DelayedInput] - component mounted');
  });

  onDestroy(() => {
      console.log('[DelayedInput] - component unmounted');
  });

  effect(() => {
      console.log('[DelayedInput] - text changed:', delayedText());
  });

  return html`
    <input type="text" :value=${delayedText} @input="${setDelayedText}" />
    <pre>${delayedText}</pre>
  `;
});

export default DelayedInput;
