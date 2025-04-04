import {
  component,
  html,
  css,
  signal,
  onMount
} from '../../../src/index.js';

// Simulate slow loading
await new Promise(resolve => setTimeout(resolve, 1000));

console.log('[ManualGreeting] - Module loaded after delay');

// Define the component
export function ManualGreeting({ name = 'User' }) {
  const greeting = signal(`Hello, ${name}!`);
  const showTimestamp = signal(false);
  const timestamp = signal(new Date().toLocaleTimeString());

  function toggleTimestamp() {
    showTimestamp(!showTimestamp());
    if (showTimestamp()) {
      timestamp(new Date().toLocaleTimeString());
    }
  }

  onMount(() => {
    console.log('[ManualGreeting] - Component mounted');
  });

  css`
    :host {
      display: block;
      margin: 10px 0;
    }
    .greeting {
      padding: 10px;
      background-color: #f5fff5;
      border-radius: 4px;
    }
    .timestamp {
      font-size: 0.8em;
      color: #666;
      margin-top: 5px;
    }
    button {
      background-color: #08c;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      margin-top: 5px;
    }
  `;

  return html`
    <div class="greeting">
      <div>${greeting}</div>
      ${showTimestamp() ? html`<div class="timestamp">Loaded at: ${timestamp}</div>` : ''}
      <button @click=${toggleTimestamp}>
        ${showTimestamp() ? 'Hide' : 'Show'} Timestamp
      </button>
    </div>
  `;
}

// Register the component with auto-naming
component(ManualGreeting);

// Export the component
export default ManualGreeting;
