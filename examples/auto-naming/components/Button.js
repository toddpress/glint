import {
  component,
  html,
  css,
  signal
} from '../../../src/index.js';

// This function name (Button) will be converted to 'gl-button'
export function Button({ label = 'Button' }) {
  const clickCount = signal(0);
  
  function handleClick() {
    clickCount(clickCount() + 1);
  }
  
  css`
    button {
      background-color: #08c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0077b3;
    }
    .count {
      margin-left: 8px;
      font-size: 0.8em;
      opacity: 0.8;
    }
  `;
  
  return html`
    <button @click=${handleClick}>
      ${label}
      ${clickCount() > 0 ? html`<span class="count">(${clickCount()})</span>` : ''}
    </button>
  `;
}

// Register the component with auto-naming
component(Button);

// Export the component
export default Button;
