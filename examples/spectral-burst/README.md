# Spectral burst

A Glint container that launches CSS gradient streaks from its center. The demo lets you change the settings while the animation runs.

From the repository root, install dependencies, rebuild the browser bundle, and start the example server.

```sh
npm ci
npm run build:codepen
npm start
```

Open [the spectral burst demo](http://localhost:8000/examples/spectral-burst/).

The component accepts these live attributes.

| Attribute | Effect | Default |
| --- | --- | --- |
| `duration` | Cycle duration in seconds | 7 |
| `streak-count` | Number of streaks, from 1 to 7 | 7 |
| `intensity` | Peak opacity, from 0 to 1 | 0.85 |
| `blur` | Blur radius in pixels | Scales with the container |
| `spread` | Travel distance multiplier | 1 |
| `size` | Streak size multiplier | 1 |
| `tip-color` | CSS color at the leading end | `#2924ff` |
| `tail-color` | CSS color at the trailing end | `#a74823` |
| `paused` | Pauses the animation when present | Absent |

Place the content you want to display above the burst inside `<glint-spectral-burst>`. The component displays a static backdrop when the browser requests reduced motion.
