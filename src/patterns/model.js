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

const model = (name, factory) => {
  let instance;
  return (state) => {
    if (!instance) {
      instance = factory(state);
      // TODO: IR capture here
    }
    return instance;
  };
};

model.scoped = (name, factory) => {
  return (state) => {
    const instance = factory(state);
    //TODO: IR capture here
    return instance;
  };
};

export { model };
