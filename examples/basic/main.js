import { registerCounter } from './components/Counter.js';
import { registerTaskBoard } from './components/TaskBoard.js';

import {
  mount,
  html,
} from '../../src/index.js'

registerCounter();
registerTaskBoard();

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
