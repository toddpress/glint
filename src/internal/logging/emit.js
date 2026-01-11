import { __DEV__ } from '../env';
import { MESSAGES } from './messages'
import { chalky } from './chalky'
import { frameFragments, normalizeStyleIntents } from './fragments'
import { render } from './renderers/console'

export function emit(code, payload) {
  if (!__DEV__) return

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
