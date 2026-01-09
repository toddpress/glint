// internal/formatWarning.ts
import { __DEV__ } from '../env';
import { createStyler } from './chalky' // whatever surface you already have

const chalky = createStyler();

export function formatWarning(code, def, details) {
  const header =
    chalky.dim('[glint] ') +
    chalky.bold(def.summary)

  const category =
    def.category
      ? chalky.dim(` (${def.category})`)
      : ''

  const body = def.message(details)

  return (
    header +
    category +
    '\n\n' +
    chalky.dim(body)
  )
}
