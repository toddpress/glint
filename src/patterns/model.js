/**
 * Models are an optional PATTERN in Glint, not a core primitive.
 *
 * A model is a small helper for bundling signal-backed identity
 * and domain logic into a reusable closure. This pattern kind of emerged
 * naturally as a consequence of how Glint components are structured and
 * defined. And more importantly, how Glint handles identity.
 *
 * Glint does not treat models specially — they are plain objects
 * passed through props like any other value.
 */

import { __DEV__ as IS_DEV } from "../internal/env";
import { devlog } from "../internal/logging/devlog";

const model = (factory) => {
  if (IS_DEV && factory.length !== 0) {
    devlog.warn(
      '[glint:model] Model factories must be zero-arity.\n' +
      'If you need component ownership, use model.owned(() => { ... }) ' +
      'and pass ctx at instantiation time.'
    );
  }

  return factory;
};

model.owned = (factory) => {
  const create = model(factory);

  return (ctx) => {
    if (IS_DEV && !ctx) {
      devlog.warn('[glint:model.owned] Missing ctx');
    }

    const instance = create();

    // TODO: implement cleanup registration

    // ctx participates ONLY here
    // ownership, cleanup, diagnostics, IR
    // TODO: IR capture here (scoped)
    return instance;
  };
};


const sharedModels = new Map();

model.shared = (key, factory) => {
  const create = model(factory);

  return () => {
    if (!sharedModels.has(key)) {
      const instance = create();
      // TODO: IR capture here (shared)
      sharedModels.set(key, instance);
    }
    return sharedModels.get(key);
  };
};

export { model };
