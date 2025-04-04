import {
  render,
  html,
  component,
  lazyComponent
} from '../../src/index.js';

// Import components
import './components/index.js';

// Register lazy components
lazyComponent('./components/UserProfile.js');
lazyComponent('./components/NotificationBadge.js');

// Define the App component
const App = () => html`
  <div>
    <h1>Auto-Naming Components Example</h1>
    
    <section>
      <h2>Auto-Named Components</h2>
      <p>These components use auto-naming based on their export names:</p>
      
      <div>
        <h3>Single-word component (with gl- prefix):</h3>
        <gl-button label="Click Me"></gl-button>
      </div>
      
      <div>
        <h3>Multi-word component (kebab-case):</h3>
        <color-picker initial-color="#08c"></color-picker>
      </div>
    </section>
    
    <section>
      <h2>Lazy-Loaded Auto-Named Components</h2>
      <p>These components are lazy-loaded with names derived from their file names:</p>
      
      <div>
        <h3>UserProfile.js → user-profile:</h3>
        <user-profile name="John Doe" avatar="https://i.pravatar.cc/100?u=john"></user-profile>
      </div>
      
      <div>
        <h3>NotificationBadge.js → notification-badge:</h3>
        <notification-badge count="5"></notification-badge>
      </div>
    </section>
    
    <section>
      <h2>How It Works</h2>
      <p>Component names are automatically derived from:</p>
      <ul>
        <li>Function names for regular components</li>
        <li>File names for lazy-loaded components</li>
      </ul>
      
      <h3>Example Code:</h3>
      <pre><code>// Auto-named component (Button → gl-button)
function Button({ label }) {
  return html\`<button>\${label}</button>\`;
}
component(Button);

// Auto-named component (ColorPicker → color-picker)
function ColorPicker({ initialColor }) {
  return html\`<div>Color: \${initialColor}</div>\`;
}
component(ColorPicker);

// Auto-named lazy component (UserProfile.js → user-profile)
lazyComponent('./components/UserProfile.js');
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
});
