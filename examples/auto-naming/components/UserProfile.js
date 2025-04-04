import {
  component,
  html,
  css
} from '../../../src/index.js';

// This file name (UserProfile.js) will be converted to 'user-profile'
export function UserProfile({ name = 'User', avatar = '' }) {
  css`
    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }
    .name {
      font-weight: bold;
    }
  `;
  
  return html`
    <div class="profile">
      <img class="avatar" src="${avatar}" alt="${name}'s avatar" />
      <div class="name">${name}</div>
    </div>
  `;
}

// Register the component with auto-naming
component(UserProfile);

// Export the component
export default UserProfile;
