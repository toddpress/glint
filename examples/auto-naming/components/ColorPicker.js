import {
  component,
  html,
  css,
  signal
} from '../../../src/index.js';

// This function name (ColorPicker) will be converted to 'color-picker'
export function ColorPicker({ initialColor = '#000000' }) {
  const color = signal(initialColor);
  
  function handleChange(e) {
    color(e.target.value);
  }
  
  css`
    .color-picker {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .color-preview {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `;
  
  return html`
    <div class="color-picker">
      <input type="color" :value=${color} @input=${handleChange} />
      <div class="color-preview" style="background-color: ${color}"></div>
      <span>${color}</span>
    </div>
  `;
}

// Register the component with auto-naming
component(ColorPicker);

// Export the component
export default ColorPicker;
