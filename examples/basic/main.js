import {
  render
} from '../../src/index.js'

// Import the App component
import { App as _App_ } from './App.js'

// Bootstrap the app and render the App component
render(_App_, {
  rootNode: document.getElementById('glint-app')
})
