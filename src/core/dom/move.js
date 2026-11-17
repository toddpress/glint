const moving = new WeakSet();

export const isMoving = (node) => {
  while (node) {
    if (moving.has(node)) return true;
    node = node.parentNode ?? node.host;
  }
  return false;
};

export const moveNodeBefore = (node, anchor) => {
  const parent = anchor.parentNode;
  if (parent.moveBefore) {
    parent.moveBefore(node, anchor);
    return;
  }

  moving.add(node);
  try {
    parent.insertBefore(node, anchor);
  } finally {
    moving.delete(node);
  }
};
