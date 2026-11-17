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
export const walkTextNodes = walk(4);
export const walkElementNodes = walk(1);
