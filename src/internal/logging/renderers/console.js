// Render %c-based console log arguments from framed fragments
export function render(fragments) {
  const { text, styles } = fragments.reduce(
    (acc, frag) => {
      if (!frag.styleHints) {
        acc.text += frag.text
        return acc
      }

      acc.text += `%c${frag.text}%c`
      acc.styles.push(frag.styleHints.join(' '), '')
      return acc
    },
    { text: '', styles: [] }
  )

  return [text, ...styles]
}
