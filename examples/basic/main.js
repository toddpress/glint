import {
  createRoot,
} from '../../src'

// Import the App component
import { App } from './App'

// Bootstrap the app and render the App component
createRoot('#glint-app', { autoRegister: true }).render(App)
