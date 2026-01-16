import {
  NodePart,
  AttrPart,
  PropPart,
  EventPart,
  InterpolatedAttrPart,
} from '../parts';

// TODO - consider using a PartFactory pattern here
// TODO - consider using object access patterns to avoid the switch/case... use
// TODO -> if (!sitePart) throw... for default
/**
 * Realize binding sites into owned Parts.
 *
 * @param {Part} parentPart
 * @param {Array<BindingSite>} bindingSites
 * @param {Object} ctx - rendering context (effect, effectScope, etc.)
 */
export function realizeBindings(parentPart, bindingSites, ctx) {
  bindingSites.forEach((site) => {
    let part;

    switch (site.kind) {
      case 'node': {
        part = new NodePart(site.marker, ctx.effect);
        part.bind(site.getter);
        break;
      }

      case 'prop': {
        part = new PropPart(site.el, site.name, ctx.effect);
        part.bind(site.getter);
        break;
      }

      case 'event': {
        part = new EventPart(site.el, site.name, ctx.effect);
        part.bind(site.getter);
        break;
      }

      case 'attr': {
        part = new AttrPart(site.el, site.name, ctx.effect);
        part.bind(site.getter);
        break;
      }

      case 'attr_interpolated': {
        part = new InterpolatedAttrPart(
          site.el,
          site.name,
          site.segments,
          ctx.effect
        );
        part.bind();
        break;
      }

      default:
        throw new Error(`Unknown binding site kind: ${site.kind ?? 'Beats me.'}`);
    }

    parentPart.addOwnedPart(part);
  });
}
