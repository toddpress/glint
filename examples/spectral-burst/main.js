import './components/SpectralBurst.js';

const burst = document.querySelector('glint-spectral-burst');
const controls = document.querySelector('#burst-controls');
const toggle = document.querySelector('#toggle-motion');

controls.addEventListener('input', ({ target }) => {
  if (!(target instanceof HTMLInputElement)) return;
  burst.setAttribute(target.name, target.value);
  const output = target.closest('label').querySelector('output');
  if (output) output.value = target.value + output.dataset.unit;
});

controls.addEventListener('reset', () => {
  for (const input of controls.querySelectorAll('input')) burst.removeAttribute(input.name);
  for (const output of controls.querySelectorAll('output')) output.value = output.dataset.default;
});

toggle.addEventListener('click', () => {
  toggle.textContent = burst.toggleAttribute('paused') ? 'Resume animation' : 'Pause animation';
});
