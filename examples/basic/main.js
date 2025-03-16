import {
  render
} from '../../src/core/index.js'

// Import the App component
import { App as _App_ } from './App.js'

// Bootstrap the app and render the App component
render(_App_, {
  autoRegister: true,
  rootNode: document.getElementById('glint-app')
})
