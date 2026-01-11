// ---------------------------------------------------------------------------
// Companion helpers expected by the architecture
// ---------------------------------------------------------------------------

function mergeFragments(prefix, fragment) {
  return {
    text: prefix.text + fragment.text,
    styleHints: [
      ...(prefix.styleHints ?? []),
      ...(fragment.styleHints ?? [])
    ]
  }
}

// Frame fragments with a prefix, conditionally
export function frameFragments(fragments, prefixFragment) {
  if (!fragments.length) return fragments

  const [first, ...rest] = fragments

  return [
    mergeFragments(prefixFragment, first),
    ...rest
  ]
}

export function normalizeStyleIntents(values) {
  return values.flatMap((value) => {
    if (typeof value === 'string') {
      return [{ text: value, styleHints: null }]
    }

    if (value && value.__styleIntent) {
      return [{ text: value.text, styleHints: value.styleHints }]
    }

    return []
  })
}
