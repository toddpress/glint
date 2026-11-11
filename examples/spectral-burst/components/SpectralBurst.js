import { define, html } from '../../../dist/glint.codepen.js';

const numericProps = {
  duration: { property: '--spectral-period', min: 0.5, max: 60, unit: 's' },
  intensity: { property: '--spectral-intensity', min: 0, max: 1 },
  blur: { property: '--spectral-blur', min: 0, max: 80, unit: 'px' },
  spread: { property: '--spectral-spread', min: 0, max: 3 },
  size: { property: '--spectral-size', min: 0.1, max: 3 },
};

const colorProps = {
  'tip-color': '--spectral-tip',
  'tail-color': '--spectral-tail',
};

const observedProps = [...Object.keys(numericProps), ...Object.keys(colorProps), 'streak-count'];
const initialized = new WeakSet();

function readNumber(element, name, min, max) {
  const raw = element.getAttribute(name)?.trim();
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : null;
}

function applyProps(element, backdrop) {
  for (const [name, { property, min, max, unit = '' }] of Object.entries(numericProps)) {
    const value = readNumber(element, name, min, max);
    if (value === null) backdrop.style.removeProperty(property);
    else backdrop.style.setProperty(property, `${value}${unit}`);
  }

  for (const [name, property] of Object.entries(colorProps)) {
    const value = element.getAttribute(name);
    if (value && CSS.supports('color', value)) backdrop.style.setProperty(property, value);
    else backdrop.style.removeProperty(property);
  }

  const count = readNumber(element, 'streak-count', 1, backdrop.children.length);
  Array.from(backdrop.children).forEach((streak, index) => {
    streak.hidden = count !== null && index >= Math.round(count);
  });
}

export const SpectralBurst = define('glint-spectral-burst', ({ el, root, onMount, onDestroy }) => {
  if (!initialized.has(el)) {
    initialized.add(el);

    const sync = () => applyProps(el, root.querySelector('.backdrop'));
    const observer = new MutationObserver(sync);
    onMount(() => {
      if (!el.isConnected) return;
      sync();
      observer.observe(el, { attributes: true, attributeFilter: observedProps });
    });
    onDestroy(() => observer.disconnect());
  }

  return html`
  <style>
    :host {
      display: block;
      position: relative;
      isolation: isolate;
      background: var(--spectral-surface, #181818);
      color: var(--spectral-color, #f5f5f5);
    }

    .backdrop {
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      border-radius: inherit;
      container-type: size;
      pointer-events: none;
    }

    .streak {
      --x: 58cqw;
      --y: -23cqh;
      --angle: atan2(var(--y), var(--x));
      --travel-x: calc(var(--x) * var(--spectral-spread, 1));
      --travel-y: calc(var(--y) * var(--spectral-spread, 1));
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(clamp(7rem, 25cqmax, 21rem) * var(--spectral-size, 1));
      height: calc(clamp(2.75rem, 8cqmax, 7rem) * var(--spectral-size, 1));
      border-radius: 50%;
      background: linear-gradient(90deg,
        transparent 3%, var(--spectral-tail, #a74823) 20%, #eaa52b 34%, #42f548 49%,
        #00c6ff 67%, var(--spectral-tip, #2924ff) 84%, transparent 100%);
      mask-image: radial-gradient(ellipse closest-side, #000 15%, #0008 63%, transparent 100%);
      filter: blur(var(--spectral-blur, clamp(0.45rem, 1.15cqmax, 1.35rem)));
      opacity: 0;
      animation: spectral-burst var(--spectral-period, 7s) linear
        calc(var(--spectral-period, 7s) * var(--phase, 0)) infinite;
    }

    .streak:nth-child(2) { --x: 23cqw; --y: -60cqh; --phase: 0.06857; }
    .streak:nth-child(3) { --x: -62cqw; --y: 33cqh; --phase: 0.12857; }
    .streak:nth-child(4) { --x: -27cqw; --y: -58cqh; --phase: 0.18571; }
    .streak:nth-child(5) { --x: 23cqw; --y: 64cqh; --phase: 0.39286; }
    .streak:nth-child(6) { --x: -58cqw; --y: -14cqh; --phase: 0.45714; }
    .streak:nth-child(7) { --x: 61cqw; --y: 44cqh; --phase: 0.52857; }

    @keyframes spectral-burst {
      0% {
        transform: translate(-50%, -50%) translate(0, 0) rotate(var(--angle)) scale(0.18);
        opacity: 0;
      }
      10% { opacity: calc(var(--spectral-intensity, 0.85) * 0.68); }
      28% { opacity: var(--spectral-intensity, 0.85); }
      58%, 100% {
        transform: translate(-50%, -50%) translate(var(--travel-x), var(--travel-y)) rotate(var(--angle)) scale(1.15);
        opacity: 0;
      }
    }

    :host([paused]) .streak {
      animation-play-state: paused;
    }

    @media (prefers-reduced-motion: reduce) {
      .streak {
        animation: none;
        transform: translate(-50%, -50%) translate(calc(var(--travel-x) * 0.72), calc(var(--travel-y) * 0.72))
          rotate(var(--angle));
        opacity: calc(var(--spectral-intensity, 0.85) * 0.4);
      }
    }
  </style>
  <div class="backdrop" aria-hidden="true" part="backdrop">
    <span class="streak"></span>
    <span class="streak"></span>
    <span class="streak"></span>
    <span class="streak"></span>
    <span class="streak"></span>
    <span class="streak"></span>
    <span class="streak"></span>
  </div>
  <slot></slot>
`;
});
