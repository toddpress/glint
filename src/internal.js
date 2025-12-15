// ============================================================
// Glint Internal Utilities (NOT exported to app authors)
// ============================================================

// ------------------------------------------------------------
// Higher-order DOM walker
// ------------------------------------------------------------
export const walk = (whatToShow) => (root) => {
  const walker = document.createTreeWalker(root, whatToShow);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};

// Specialized walkers
export const walkTextNodes = walk(NodeFilter.SHOW_TEXT);
export const walkElementNodes = walk(NodeFilter.SHOW_ELEMENT);

// ------------------------------------------------------------
// Attribute mapper
// ------------------------------------------------------------
export const mapAttrs = (el) =>
  [...el.attributes].map((a) => ({
    name: a.name,
    value: a.value,
  }));

// ------------------------------------------------------------
// Marker extractor for __glint_<index>__
// ------------------------------------------------------------
export const extractMarkers = (str, pattern) => {
  const matches = [];
  pattern.lastIndex = 0;

  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = pattern.exec(str)) !== null) {
    matches.push({
      full: m[0],
      index: Number(m[1]),
      start: m.index,
    });
  }

  return matches;
};
