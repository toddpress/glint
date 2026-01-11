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
