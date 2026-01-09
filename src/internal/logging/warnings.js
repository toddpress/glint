/**
 * Warnings emitted during development to help guide correct usage.
 */

import { iif } from '../../core/utils';

export const WARNINGS = {
  SIGNAL_OUTSIDE_CONTAINER: {
    category: 'ownership',
    level: 'warn',
    summary: 'Signal created without a state container owner',
    message: () =>
      `This signal was created outside of component or model.\n` +
      `It will not be automatically cleaned up and may outlive its intended scope.`
  },

  COMPUTED_OUTSIDE_CONTAINER: {
    category: 'ownership',
    level: 'warn',
    summary: 'Computed created without a state container owner',
    message: () =>
      `This computed value was created outside of component or model.\n` +
      `If it depends on signals, its lifetime may be unclear.`
  },

  MODEL_EFFECT_WITHOUT_OWNER: {
    category: 'ownership',
    level: 'warn',
    summary: 'Effect created without an owning container',
    message: () =>
      `This effect has no owning state container.\n` +
      `It may continue running after the model is no longer in use.`
  },

  MODEL_FACTORY_HAS_PARAMS: {
    category: 'model',
    level: 'warn',
    summary: 'Model factory expects arguments',
    message: ({ name, arity }) =>
      `Model factories must be pure functions with zero-arity.\n` +
      `This factory${iif(name, ` (${name})`, '')} declares ${arity} parameter(s).\n` +
      'If you need component ownership, use model.owned(() => { ... }) ' +
      'and pass ctx at instantiation time.'
  },

  SHARED_MODEL_KEY_COLLISION: {
    category: 'model',
    level: 'warn',
    summary: 'Shared model key reused for a different model',
    message: ({ key }) =>
      `A shared model already exists for key "${key}".\n` +
      `Reusing keys across different models can cause unexpected state sharing.`
  },

  SHARED_MODEL_DYNAMIC_KEY: {
    category: 'state',
    level: 'warn',
    summary: 'model.shared() called with unstable key',
    message: ({ key }) =>
      `model.shared() requires a stable, deterministic key.\n` +
      `The provided key ${String(key)} may change between calls`
  },

  MODEL_CREATES_CONTAINER_IMPLICITLY: {
    category: 'state',
    level: 'warn',
    summary: 'Model created its own state container',
    message: () =>
      `This model created a state container implicitly.\n` +
      `If ownership matters, consider creating the container explicitly instead.`
  },


  MULTIPLE_CONTAINERS_IN_MODEL: {
    category: 'state',
    level: 'warn',
    summary: 'Multiple state containers created in a single model',
    message: () =>
      `This model created more than one state container.\n` +
      `This can make ownership and cleanup harder to reason about.`
  },

  MODEL_OWNED_WITHOUT_CONTEXT: {
    category: 'model',
    level: 'warn',
    summary: 'model.owned() called without a context',
    message: () =>
      `model.owned() was called without a context.\n` +
      `This may cause ownership and cleanup to function incorrectly.`
  },

  MODEL_SHARED_WITHOUT_KEY: {
    category: 'model',
    level: 'warn',
    summary: 'model.shared() called without a key',
    message: () =>
      `model.shared() requires an explicit key to define its sharing boundary.\n` +
      `Without one, the model cannot be safely reused.`
  },

  STATE_CONTAINER_UNUSED: {
    category: 'state',
    level: 'warn',
    summary: 'State container created but never used',
    message: () =>
      `A state container was created but no state or computed values were added.\n` +
      `This may be leftover scaffolding.`
  },


};
