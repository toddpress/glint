import './components/index.js';

import {
  mount,
  html,
} from '../../src/index.js';

mount('#glint-app', html`
    <section>
        <h3>Signals, Computed, Effects</h3>
        <tsp-counter start="5"></tsp-counter>
    </section>
    <section>
        <h3>TaskBoard:</h3>
        <tsp-task-board></tsp-task-board>
    </section>
`);
