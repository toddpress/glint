import './components'

import {
  render,
  html,
} from '../../src'

const APP_TEMPLATE = html`
    <section>
        <h3>Updates:</h3>
        <ul>
            <li>✅ functional accessor signal syntax</li>
            <li>✅ property binding syntax</li>
            <li>✅ css helper</li>
            <li>✅ general cleanup and formatting</li>
        </ul>
    </section>
    <hr />
    <section>
        <h3>Signals, Computed, Effects</h3>
        <tsp-counter start="5" />
    </section>
    <section>
        <h3>TaskBoard:</h3>
        <tsp-task-board />
    </section>
`;

render(APP_TEMPLATE, '#glint-app')
