import { analyzeTemplate } from './template-analysis.js';
import { extractMarkers } from './markers/index.js';
import { isTemplateResult } from './tags.js';
import { AttrPart, BooleanAttrPart } from './parts/AttrPart.js';
import { PropPart } from './parts/PropPart.js';
import { EventPart } from './parts/EventPart.js';
import { InterpolatedAttrPart } from './parts/InterpolatedAttrPart.js';
import { RefPart } from './parts/RefPart.js';
import { batch } from './signals/index.js';
export function instantiateTemplate(result, scope, doc, createNodePart) {
  if (!isTemplateResult(result)) throw new TypeError('Expected a Glint template result');
  if (scope.disposed) throw new Error('Cannot mount into a disposed scope');
  const plan = analyzeTemplate(result, doc);
  const fragment = doc.importNode(plan.template.content, true);
  const slots = [];
  const walker = doc.createTreeWalker(fragment, 1 | 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  try {
    for (const node of nodes) {
      if (node.nodeType === 3) {
        const markers = extractMarkers(node.data);
        if (!markers.length) continue;
        let offset = 0;
        for (const marker of markers) {
          node.before(doc.createTextNode(node.data.slice(offset, marker.start)));
          const start = doc.createComment('gl:start');
          const end = doc.createComment('gl:end');
          node.before(start, end);
          const binding = createNodePart(scope.child('expression'), start, end);
          binding.wire(result.values[marker.index]);
          slots.push({ binding, index: marker.index });
          offset = marker.start + marker.full.length;
        }
        node.before(doc.createTextNode(node.data.slice(offset)));
        node.remove();
      } else {
        for (const attr of [...node.attributes]) {
          if (attr.name.startsWith('glint-ref-')) {
            const index = Number(attr.name.slice(10));
            node.removeAttribute(attr.name);
            const binding = new RefPart(scope.child('ref'), node);
            binding.wire(result.values[index]);
            slots.push({ binding, index });
            continue;
          }
          const markers = extractMarkers(attr.value);
          if (!markers.length) continue;
          node.removeAttribute(attr.name);
          const name = plan.names.get(markers[0].index) ?? attr.name;
          if (name === 'key') continue;
          const single = markers.length === 1 && markers[0].full === attr.value;
          let binding;
          if (name.startsWith('@') || name.startsWith('on')) binding = new EventPart(scope.child('event'), node, name.startsWith('@') ? name.slice(1) : name.slice(2));
          else if (name.startsWith('.') || name.startsWith(':')) binding = new PropPart(scope.child('property'), node, name.slice(1));
          else if (name.startsWith('?')) binding = new BooleanAttrPart(scope.child('boolean'), node, name.slice(1));
          else if (single) binding = new AttrPart(scope.child('attribute'), node, name);
          else {
            const segments = [];
            let offset = 0;
            for (const marker of markers) {
              segments.push(attr.value.slice(offset, marker.start), { index: marker.index });
              offset = marker.start + marker.full.length;
            }
            segments.push(attr.value.slice(offset));
            binding = new InterpolatedAttrPart(scope.child('interpolated attribute'), node, name, segments);
            binding.wire(result.values);
            slots.push({ binding, all: true });
            continue;
          }
          if (!single) throw new Error(`Binding ${name} requires one expression`);
          binding.wire(result.values[markers[0].index]);
          slots.push({ binding, index: markers[0].index });
        }
      }
    }
  } catch (error) { scope.dispose(); throw error; }
  let out = fragment;
  if (plan.wrapper) {
    out = doc.createDocumentFragment();
    const wrapper = fragment.firstElementChild;
    while (wrapper.firstChild) out.append(wrapper.firstChild);
  }
  return {
    fragment: out,
    update(next) {
      if (!isTemplateResult(next) || next.kind !== result.kind || next.strings !== result.strings) return false;
      result = next;
      batch(() => { for (const slot of slots) slot.binding.updateSource(slot.all ? result.values : result.values[slot.index]); });
      return true;
    },
    dispose: () => scope.dispose(),
  };
}
