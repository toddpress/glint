import { html } from '../../src/core/index.js';

import * as all from './components/index.js';
//? NOTE: `import * as all` is just a shorter way to import all named exports
//? -> from a module.
//? NOTE - import appears to be unused, but it is used in the render
//? -> function below. This is necessary for the component function to register
//? -> its renderer with the componentRegistry.


export const App = () => html`
  <div>
    <section>
      <h3>Signals, Computed, Effects</h3>
      <tsp-counter start="5"></tsp-counter>
    </section>
    <section>
      <h3>Debounced Signal (1 second):</h3>
      <tsp-delayed-input></tsp-delayed-input>
    </section>
  </div>
`;

export default App;