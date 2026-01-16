// ============================================================
// Glint Template Helpers (HOF-based)
// ------------------------------------------------------------
// This file bundles:
// - resolveVal() : normalize signals/computed vs raw values
// - makeTemplateHelper() : build a getter fn for templates
// - each / when / match : canonical control-flow helpers
// ============================================================

import { isSignal, isComputed } from '../core/utils.js';
import { KeyedEachPart } from '../core/parts/KeyedEachPart';

// ------------------------------------------------------------
// Helper core utilities
// ------------------------------------------------------------

const resolveVal = (val) =>
  isSignal(val) || isComputed(val) ? val() : val;

const makeTemplateHelper = (source, fn) =>
  () => fn(resolveVal(source));

// ------------------------------------------------------------
// Public helpers
// ------------------------------------------------------------

export const when = (cond, renderFn) =>
  makeTemplateHelper(cond, (val) => (val ? renderFn() : []));

export const match = (source, cases) =>
  makeTemplateHelper(source, (val) =>
    val in cases ? cases[val]() : cases.default?.() ?? []
  );

export function each(list, keyFn, template) {
  return (ctx) => {
    let part = null;

    ctx.effect(() => {
      const items = list();
      const keyed = items.map((item, index) => ({
        key: keyFn ? keyFn(item, index) : index,
        tpl: template(item),
      }));

      if (!part) {
        part = new KeyedEachPart(ctx.part.start, ctx.part.end, ctx.effect);
        ctx.part.addOwnedPart(part);
      }

      part.update(keyed);
    });
  };
}


function _when(condition, template) {
  return (ctx) => {
    withEffectScope(
      ctx,
      (notify) => {
        ctx.effect(() => notify(!!condition()));
      },
      (scopedCtx) => render(template, scopedCtx)
    );
  };
}

function _match(expr, cases) {
  return (ctx) => {
    withEffectScope(
      ctx,
      (notify) => {
        ctx.effect(() => notify(expr() in cases));
      },
      (scopedCtx) => {
        const key = expr();
        const tpl = cases[key];
        if (tpl) render(tpl, scopedCtx);
      }
    );
  };
}
