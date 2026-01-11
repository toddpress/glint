// ------------------------------------------------------------
// Markers - create,  extract, and pattern for `__glint_<index>__`
// ------------------------------------------------------------

export const markerPattern = /__glint_(\d+)__/g;

export const createMarker = (index) => `__glint_${index}__`;

export const extractMarkers = (str) =>
  Array.from(str.matchAll(markerPattern), (match) => ({
    full: match.at(0),
    index: Number(match.at(1)),
    start: match.index,
  }));
