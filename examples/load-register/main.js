import {
  render,
  html,
  lazyComponent,
  loadComponent,
  registerLoadedComponent
} from '../../src/index.js';

// Register components for lazy loading
lazyComponent('./components/ManualCounter.js');
lazyComponent('./components/ManualGreeting.js');

// Define the App component
const App = () => html`
  <div>
    <h1>Separate Load and Register Example</h1>
    
    <section>
      <h2>Manual Loading and Registration</h2>
      <p>This example demonstrates how to manually control the loading and registration of components:</p>
      
      <div class="component-container">
        <h3>ManualCounter Component:</h3>
        <div class="controls">
          <button id="load-counter">1. Load Component</button>
          <button id="register-counter" disabled>2. Register Component</button>
        </div>
        <div id="counter-status" class="status">Component not loaded</div>
        <div id="counter-container"></div>
      </div>
      
      <div class="component-container">
        <h3>ManualGreeting Component:</h3>
        <div class="controls">
          <button id="load-greeting">1. Load Component</button>
          <button id="register-greeting" disabled>2. Register Component</button>
        </div>
        <div id="greeting-status" class="status">Component not loaded</div>
        <div id="greeting-container"></div>
      </div>
    </section>
    
    <section>
      <h2>Automatic Loading and Registration</h2>
      <p>For comparison, these components are loaded and registered automatically when added to the DOM:</p>
      
      <div class="component-container">
        <h3>Auto Components:</h3>
        <button id="add-auto">Add Auto Components</button>
        <div id="auto-container"></div>
      </div>
    </section>
    
    <section>
      <h2>How It Works</h2>
      <p>Glint now separates the loading and registration steps:</p>
      <ul>
        <li><code>loadComponent(name)</code>: Loads the component module but doesn't register it</li>
        <li><code>registerLoadedComponent(name)</code>: Registers a loaded component</li>
        <li><code>importAndRegisterComponent(name)</code>: Does both in one step</li>
      </ul>
      
      <h3>Example Code:</h3>
      <pre><code>// Register components for lazy loading
lazyComponent('./components/ManualCounter.js');

// Load the component but don't register it yet
loadComponent('manual-counter')
  .then(() => {
    console.log('Component loaded successfully');
    // Enable the register button
    registerButton.disabled = false;
  });

// Later, when the user clicks the register button
registerLoadedComponent('manual-counter');
</code></pre>
    </section>
  </div>
`;

// Bootstrap the app
document.addEventListener('DOMContentLoaded', () => {
  render(App, {
    autoRegister: false, // Don't auto-register components
    lazyLoad: true,
    rootNode: document.getElementById('app')
  });
  
  // Set up event listeners for the counter component
  const loadCounterButton = document.getElementById('load-counter');
  const registerCounterButton = document.getElementById('register-counter');
  const counterStatus = document.getElementById('counter-status');
  const counterContainer = document.getElementById('counter-container');
  
  loadCounterButton.addEventListener('click', async () => {
    loadCounterButton.disabled = true;
    counterStatus.textContent = 'Loading component...';
    
    try {
      await loadComponent('manual-counter');
      counterStatus.textContent = 'Component loaded successfully';
      counterStatus.classList.add('success');
      registerCounterButton.disabled = false;
    } catch (error) {
      counterStatus.textContent = `Error loading component: ${error.message}`;
      counterStatus.classList.add('error');
      loadCounterButton.disabled = false;
    }
  });
  
  registerCounterButton.addEventListener('click', () => {
    registerCounterButton.disabled = true;
    counterStatus.textContent = 'Registering component...';
    
    try {
      const registered = registerLoadedComponent('manual-counter');
      
      if (registered) {
        counterStatus.textContent = 'Component registered successfully';
        
        // Create and add the component
        const counter = document.createElement('manual-counter');
        counter.setAttribute('start', '10');
        counterContainer.appendChild(counter);
      } else {
        counterStatus.textContent = 'Failed to register component';
        counterStatus.classList.add('error');
        registerCounterButton.disabled = false;
      }
    } catch (error) {
      counterStatus.textContent = `Error registering component: ${error.message}`;
      counterStatus.classList.add('error');
      registerCounterButton.disabled = false;
    }
  });
  
  // Set up event listeners for the greeting component
  const loadGreetingButton = document.getElementById('load-greeting');
  const registerGreetingButton = document.getElementById('register-greeting');
  const greetingStatus = document.getElementById('greeting-status');
  const greetingContainer = document.getElementById('greeting-container');
  
  loadGreetingButton.addEventListener('click', async () => {
    loadGreetingButton.disabled = true;
    greetingStatus.textContent = 'Loading component...';
    
    try {
      await loadComponent('manual-greeting');
      greetingStatus.textContent = 'Component loaded successfully';
      greetingStatus.classList.add('success');
      registerGreetingButton.disabled = false;
    } catch (error) {
      greetingStatus.textContent = `Error loading component: ${error.message}`;
      greetingStatus.classList.add('error');
      loadGreetingButton.disabled = false;
    }
  });
  
  registerGreetingButton.addEventListener('click', () => {
    registerGreetingButton.disabled = true;
    greetingStatus.textContent = 'Registering component...';
    
    try {
      const registered = registerLoadedComponent('manual-greeting');
      
      if (registered) {
        greetingStatus.textContent = 'Component registered successfully';
        
        // Create and add the component
        const greeting = document.createElement('manual-greeting');
        greeting.setAttribute('name', 'Manual User');
        greetingContainer.appendChild(greeting);
      } else {
        greetingStatus.textContent = 'Failed to register component';
        greetingStatus.classList.add('error');
        registerGreetingButton.disabled = false;
      }
    } catch (error) {
      greetingStatus.textContent = `Error registering component: ${error.message}`;
      greetingStatus.classList.add('error');
      registerGreetingButton.disabled = false;
    }
  });
  
  // Set up event listener for auto components
  const addAutoButton = document.getElementById('add-auto');
  const autoContainer = document.getElementById('auto-container');
  
  addAutoButton.addEventListener('click', () => {
    // These components will be loaded and registered automatically
    const counter = document.createElement('manual-counter');
    counter.setAttribute('start', '50');
    
    const greeting = document.createElement('manual-greeting');
    greeting.setAttribute('name', 'Auto User');
    
    autoContainer.innerHTML = '';
    autoContainer.appendChild(counter);
    autoContainer.appendChild(greeting);
  });
});
