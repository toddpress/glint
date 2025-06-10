// === lazy.js ===
import { componentRegistry } from './component.js';
import { isFunction, exportNameToTagName } from './utils.js';

const lazyComponentLoaders = new Map();

export function getLazyLoaderForTag(tag) {
  return lazyComponentLoaders.get(tag);
}

export function registerLazyGlob(...sources) {
  for (const source of sources) {
    const globMap = typeof source === 'string'
      ? import.meta.glob(source)
      : source;

    for (const [path, loader] of Object.entries(globMap)) {
      loader().then((mod) => {
        const exported = mod.default || mod[Object.keys(mod)[0]];
        if (!isFunction(exported)) return;

        const inferredTag = exportNameToTagName(
          path.split('/').pop().replace('.js', '')
        );

        const tagName = [...componentRegistry.keys()].find(tag =>
          tag.includes(inferredTag)
        );

        if (!tagName) {
          console.warn(`[glint] Lazy component loaded from ${path} but did not register a tag.`);
          return;
        }

        lazyComponentLoaders.set(tagName, loader);
      });
    }
  }
}
