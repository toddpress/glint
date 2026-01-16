import {
  walkTextNodes,
  walkElementNodes,
  mapAttrs,
} from './dom';

import {
  createMarker,
  extractMarkers,
  markerPattern,
} from './markers';

import { isString, isTemplate } from './utils';

// ------------------------------------------------------------
// Template tag
// ------------------------------------------------------------

export const html = (strings, ...exprs) => {
  // Store expressions as getters so they can be re-evaluated later (by Parts).
  const values = exprs.map((expr) => () => expr);
  return { __template: true, strings, values };
};

// ------------------------------------------------------------
// Template compilation + cache
// ------------------------------------------------------------

const templateCache = new WeakMap();

const compileTemplate = (strings, valueCount) => {
  const htmlString = strings
    .map((chunk, i) => chunk + (i < valueCount ? createMarker(i) : ''))
    .join('');

  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString;
  return { fragment: tpl.content };
};

const getCompiled = (strings, valueCount) => {
  const cached = templateCache.get(strings);
  if (cached) return cached;

  const compiled = compileTemplate(strings, valueCount);
  templateCache.set(strings, compiled);
  return compiled;
};

// ------------------------------------------------------------
// expandTemplate (responsibilities -- DOM + discovery only)
// ------------------------------------------------------------

/**
 * BindingSite shapes (intentionally boring and factual):
 *
 * - { kind: 'node', marker: Comment, getter: () => any }
 * - { kind: 'prop', el: Element, name: string, getter: () => any }
 * - { kind: 'event', el: Element, name: string, getter: () => any }
 * - { kind: 'attr', el: Element, name: string, getter: () => any }
 * - { kind: 'attr_interpolated', el: Element, name: string, segments: Array<string | (() => any)> }
 *
 * No Parts. No effects. No ownership.
 */
export const expandTemplate = (tpl) => {
  if (!isTemplate(tpl)) {
    throw new Error('expandTemplate expected a template.');
  }

  const { strings, values } = tpl;
  const compiled = getCompiled(strings, values.length);
  const fragment = compiled.fragment.cloneNode(true);

  const bindingSites = [];

  // ----------------------------------------------------------
  // TEXT / NODE BINDINGS
  // ----------------------------------------------------------
  walkTextNodes(fragment).forEach((textNode) => {
    const raw = textNode.nodeValue;
    if (!raw || !raw.includes('__glint_')) return;

    const parent = textNode.parentNode;
    if (!parent) return;

    const markers = extractMarkers(raw, markerPattern);
    if (!markers.length) return;

    const newNodes = [];
    let lastIndex = 0;

    markers.forEach(({ full, index, start }) => {
      const pre = raw.slice(lastIndex, start);
      if (pre) newNodes.push(document.createTextNode(pre));

      // Anchor for a NodePart to own a range ending at this marker.
      const comment = document.createComment(`gl:${index}`);
      newNodes.push(comment);

      bindingSites.push({
        kind: 'node',
        marker: comment,
        getter: values[index],
      });

      lastIndex = start + full.length;
    });

    const tail = raw.slice(lastIndex);
    if (tail) newNodes.push(document.createTextNode(tail));

    newNodes.forEach((n) => parent.insertBefore(n, textNode));
    textNode.remove();
  });

  // ----------------------------------------------------------
  // ATTRIBUTE / PROP / EVENT BINDINGS
  // ----------------------------------------------------------
  walkElementNodes(fragment).forEach((el) => {
    mapAttrs(el).forEach(({ name: rawName, value: rawValue }) => {
      if (!rawValue || !rawValue.includes('__glint_')) return;

      const markers = extractMarkers(rawValue, markerPattern);
      if (!markers.length) return;

      // ----------------------------
      // Property binding: :value
      // ----------------------------
      if (rawName.startsWith(':')) {
        const propName = rawName.slice(1);
        const getter = values[markers[0].index];

        el.removeAttribute(rawName);

        bindingSites.push({
          kind: 'prop',
          el,
          name: propName,
          getter,
        });

        return;
      }

      // ----------------------------
      // Event binding: onclick
      // ----------------------------
      if (rawName.startsWith('on')) {
        const eventName = rawName.slice(2);
        const getter = values[markers[0].index];

        el.removeAttribute(rawName);

        bindingSites.push({
          kind: 'event',
          el,
          name: eventName,
          getter,
        });

        return;
      }

      // ----------------------------
      // Attribute interpolation
      // ----------------------------
      el.removeAttribute(rawName);

      const segments = markers.reduce((acc, m, idx) => {
        const prevEnd =
          idx === 0
            ? 0
            : markers[idx - 1].start +
              markers[idx - 1].full.length;

        const pre = rawValue.slice(prevEnd, m.start);
        if (pre) acc.push(pre);

        acc.push(values[m.index]);
        return acc;
      }, []);

      const last = markers[markers.length - 1];
      const tail = rawValue.slice(last.start + last.full.length);
      if (tail) segments.push(tail);

      // Full dynamic attribute: attr="${expr}"
      // (single dynamic segment, no static text around it)
      if (segments.length === 1 && !isString(segments[0])) {
        bindingSites.push({
          kind: 'attr',
          el,
          name: rawName,
          getter: segments[0],
        });
      } else {
        bindingSites.push({
          kind: 'attr_interpolated',
          el,
          name: rawName,
          segments,
        });
      }
    });
  });

  return { fragment, bindingSites };
};
