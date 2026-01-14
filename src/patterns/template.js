// ============================================================
// Glint Template Helpers (HOF-based)
// ------------------------------------------------------------
// This file bundles:
// - resolveVal() : normalize signals/computed vs raw values
// - makeTemplateHelper() : build a getter fn for templates
// - each / when / match : canonical control-flow helpers
// ============================================================

import { isSignal, isComputed } from '../core/utils.js';

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

export const each = (source, keyOrRender, maybeRender) => {
  // --------------------------------------------
  // Unkeyed each — structural expansion only
  if (maybeRender == null) {
    const render = keyOrRender;

    return makeTemplateHelper(source, (list) =>
      list.map(render)
    );
  }

  // --------------------------------------------
  // Keyed each — identity-aware expansion
  const keyFn = keyOrRender;
  const render = maybeRender;

  return makeTemplateHelper(source, (list) => ({
    __glintEach: true,
    keyed: true,
    items: list.map((item) => ({
      key: keyFn(item),
      tpl: render(item),
    })),
  }));
};


export const when = (cond, renderFn) =>
  makeTemplateHelper(cond, (val) => (val ? renderFn() : []));

export const match = (source, cases) =>
  makeTemplateHelper(source, (val) =>
    val in cases ? cases[val]() : cases.default?.() ?? []
  );

function _each(list, keyFn, template) {
  return (ctx) => {
    const parentScope = ctx.effectScope;
    const records = new Map();

    ctx.effect(() => {
      const items = list();
      const seenKeys = new Set();

      items.forEach((item, index) => {
        const key = keyFn ? keyFn(item, index) : index;
        seenKeys.add(key);

        const record = records.get(key) ?? createRecord(key, item);
        positionRecord(record, index);
      });

      records.forEach((record, key) => {
        if (!seenKeys.has(key)) {
          disposeRecord(key, record);
        }
      });
    });

    // ---------- local helpers ----------

    function createRecord(key, item) {
      const scope = parentScope.fork();
      let nodes = null;

      withEffectScope(
        ctx,
        notify => notify(true),
        scopedCtx => {
          nodes = render(template(item), {
            ...scopedCtx,
            effect: scope.effect,
            effectScope: scope,
          });
        }
      );

      const record = { scope, nodes };
      records.set(key, record);
      return record;
    }

    function positionRecord(record, index) {
      moveNodes(record.nodes, index);
    }

    function disposeRecord(key, record) {
      record.scope.dispose();
      removeNodes(record.nodes);
      records.delete(key);
    }
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
