import { html } from '../../src';

// In glint, component registrations ARE side-effects... So, while this may look odd,
//   it's technically correct (i think).
import './components/Counter.js';
import './components/TaskBoard.js';

export const App = html`
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

export default App;
