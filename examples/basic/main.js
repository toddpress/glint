import './components'

import {
  render,
  html,
} from '../../src'

render('#glint-app', html`
    <section>
        <h3>Signals, Computed, Effects</h3>
        <tsp-counter start="5" />
    </section>
    <section>
        <h3>TaskBoard:</h3>
        <tsp-task-board />
    </section>
`);
