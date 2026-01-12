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

import { _emit } from "../internal/logging";

const model = (factory) => {
  if (factory.length !== 0) {
    _emit('MODEL_FACTORY_HAS_PARAMS', {
      name: factory.name,
      arity: factory.length,
    });
  }

  return factory;
};

model.owned = (factory) => {
  const create = model(factory);

  return (ctx) => {
    if (!ctx) {
      _emit('MODEL_OWNED_WITHOUT_CONTEXT');
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
