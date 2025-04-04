import {
  component,
  html,
  css,
  signal
} from '../../../src/index.js';

// This file name (NotificationBadge.js) will be converted to 'notification-badge'
export function NotificationBadge({ count = 0 }) {
  const notifications = signal(Number(count));
  
  function clearNotifications() {
    notifications(0);
  }
  
  css`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      background-color: #f44336;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      padding: 0 6px;
    }
    button {
      background-color: #08c;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
  `;
  
  return html`
    <div class="badge">
      <div class="count">${notifications}</div>
      <span>Notifications</span>
      ${notifications() > 0 ? html`<button @click=${clearNotifications}>Clear</button>` : ''}
    </div>
  `;
}

// Register the component with auto-naming
component(NotificationBadge);

// Export the component
export default NotificationBadge;
