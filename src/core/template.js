// ============================================================
// Glint Template Engine
// ============================================================

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

import {
  NodePart,
  AttrPart,
  PropPart,
  EventPart,
  InterpolatedAttrPart,
} from './parts';

import { isString, isTemplate } from './utils';

// ------------------------------------------------------------
// Template tag
// ------------------------------------------------------------

export const html = (strings, ...exprs) => {
  // Store expressions as getters so they can be re-evaluated in effects
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
// renderTemplate
// ------------------------------------------------------------

export const renderTemplate = (tpl, ctxEffect) => {
  if (!isTemplate(tpl)) {
    throw new Error('renderTemplate expected a template.');
  }

  const { strings, values } = tpl;
  const compiled = getCompiled(strings, values.length);
  const fragment = compiled.fragment.cloneNode(true);

  const pendingNodeParts = [];

  // ----------------------------------------------------------
  // TEXT PARTS
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

      const comment = document.createComment(`gl:${index}`);
      newNodes.push(comment);

      pendingNodeParts.push({
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

  // Bind NodeParts after anchors exist
  pendingNodeParts.forEach(({ marker, getter }) => {
    const part = new NodePart(marker, ctxEffect);
    part.bind(getter);
  });

  // ----------------------------------------------------------
  // ATTRIBUTE / PROP / EVENT PARTS
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
        const getter = values[markers[0].index];
        const propName = rawName.slice(1);
        el.removeAttribute(rawName);

        const part = new PropPart(el, propName, ctxEffect);
        part.bind(getter);
        return;
      }

      // ----------------------------
      // Event binding: onclick
      // ----------------------------
      if (rawName.startsWith('on')) {
        const getter = values[markers[0].index];
        const eventName = rawName.slice(2);
        el.removeAttribute(rawName);

        const part = new EventPart(el, eventName, ctxEffect);
        part.bind(getter);
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

      // Full dynamic attribute
      if (segments.length === 1 && !isString(segments[0])) {
        const part = new AttrPart(el, rawName, ctxEffect);
        part.bind(segments[0]);
      } else {
        const part = new InterpolatedAttrPart(
          el,
          rawName,
          segments,
          ctxEffect
        );
        part.bind();
      }
    });
  });

  return fragment;
};
