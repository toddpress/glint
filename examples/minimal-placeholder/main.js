import {
  render,
  html,
  lazyComponent
} from '../../src/index.js';

// Register lazy components
lazyComponent('./components/SlowCounter.js');
lazyComponent('./components/SlowGreeting.js');

// Define the App component
const App = () => html`
  <div>
    <h1>Minimal Placeholder Example</h1>
    
    <section>
      <h2>Lazy-Loaded Components with Minimal Placeholders</h2>
      <p>These components are loaded on-demand with minimal placeholder elements:</p>
      
      <div>
        <h3>SlowCounter Component:</h3>
        <slow-counter start="10"></slow-counter>
      </div>
      
      <div>
        <h3>SlowGreeting Component:</h3>
        <slow-greeting name="World"></slow-greeting>
      </div>
    </section>
    
    <section>
      <h2>Dynamic Loading</h2>
      <p>Click the button to create more components dynamically:</p>
      
      <button id="load-more">Load More Components</button>
      <div id="more-components"></div>
    </section>
    
    <section>
      <h2>How It Works</h2>
      <p>When a component is being loaded:</p>
      <ul>
        <li>A minimal placeholder element is created with the same tag name</li>
        <li>The placeholder has a <code>data-loading</code> attribute</li>
        <li>No loading text or visual indicators are added by default</li>
        <li>You can style loading components with CSS: <code>[data-loading] { ... }</code></li>
      </ul>
      
      <h3>Example Code:</h3>
      <pre><code>// Register lazy components
lazyComponent('./components/SlowCounter.js');

// Use in templates
const App = () => html\`
  &lt;slow-counter start="10"&gt;&lt;/slow-counter&gt;
\`;

// Style loading placeholders (optional)
css\`
  [data-loading] {
    min-height: 20px;
    background-color: #f9f9f9;
  }
\`;
</code></pre>
    </section>
  </div>
`;

// Bootstrap the app
document.addEventListener('DOMContentLoaded', () => {
  render(App, {
    autoRegister: true,
    lazyLoad: true,
    rootNode: document.getElementById('app')
  });
  
  // Add event listener to load more components on demand
  document.getElementById('load-more').addEventListener('click', () => {
    const container = document.getElementById('more-components');
    
    // Create new components dynamically
    const newCounter = document.createElement('slow-counter');
    newCounter.setAttribute('start', '100');
    
    const newGreeting = document.createElement('slow-greeting');
    newGreeting.setAttribute('name', 'Dynamic User');
    
    // Add to the DOM
    container.innerHTML = '<h3>Dynamically Added Components:</h3>';
    container.appendChild(newCounter);
    container.appendChild(newGreeting);
  });
});
