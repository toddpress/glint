import {
  render,
  html,
  lazyComponent
} from '../../src/index.js';

// Register components for lazy loading
lazyComponent('lazy-counter', './components/LazyCounter.js');
lazyComponent('lazy-greeting', './components/LazyGreeting.js');

// Define the App component
const App = () => html`
  <div>
    <h1>Lazy Loading Components Example</h1>
    
    <section>
      <h2>These components will be loaded on demand:</h2>
      
      <div>
        <h3>Counter Component:</h3>
        <lazy-counter start="10"></lazy-counter>
      </div>
      
      <div>
        <h3>Greeting Component:</h3>
        <lazy-greeting name="World"></lazy-greeting>
      </div>
      
      <div>
        <button id="load-more">Load More Components</button>
        <div id="more-components"></div>
      </div>
    </section>
  </div>
`;

// Bootstrap the app
document.addEventListener('DOMContentLoaded', () => {
  render(App, {
    autoRegister: true,
    lazyLoad: true, // Enable lazy loading
    rootNode: document.getElementById('app')
  });
  
  // Add event listener to load more components on demand
  document.getElementById('load-more').addEventListener('click', () => {
    const container = document.getElementById('more-components');
    
    // Create new components dynamically
    const newCounter = document.createElement('lazy-counter');
    newCounter.setAttribute('start', '100');
    
    const newGreeting = document.createElement('lazy-greeting');
    newGreeting.setAttribute('name', 'Dynamic User');
    
    // Add to the DOM
    container.innerHTML = '<h3>Dynamically Added Components:</h3>';
    container.appendChild(newCounter);
    container.appendChild(newGreeting);
  });
});
