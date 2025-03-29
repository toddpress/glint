import { html } from '../../src/core/index.js';

import * as all from './components/index.js';
//? NOTE: `import * as all` is just a shorter way to import all named exports
//? -> from a module. it is used in the render function below. This is necessary
//? -> for the component function to register its renderer with the Glint componentRegistry.

export const App = () => html`
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
        <h3>Debounced Signal (1 second):</h3>
        <tsp-delayed-input />
    </section>
`;

export default App;