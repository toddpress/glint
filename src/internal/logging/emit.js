import { __DEV__ } from '../env.js';
import { getConfig } from '../../diagnostics/config.js';
import { MESSAGES } from './messages.js'
import { chalky } from './chalky.js'
import { frameFragments, normalizeStyleIntents } from './fragments.js'
import { render } from './renderers/console.js'

export function emit(code, payload) {
  if (!__DEV__ || !getConfig().diagnostics) return

  const msg = MESSAGES[code]

  if (!msg) {
    console.warn(`[glint] Unknown message code "${code}". This is likely a framework bug.`)
    return
  }

  if (msg.validate) {
    const error = msg.validate(payload)
    if (error) {
      console.warn(`[glint] Invalid payload for message "${code}": ${error}`)
      return
    }
  }

  const values = msg.format(payload, { chalky })
  const fragments = normalizeStyleIntents(values)
  const framed = frameFragments(fragments, chalky.dim('[glint] '))
  const args = render(framed)

  console[msg.kind](...args)
}
