/**
 * Internal logging helper functions
 */

// Filter out null/undefined lines for the purposes of logging messages
export const lines = (...xs) => xs.filter(x => x != null)
