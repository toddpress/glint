/**
 * Warnings emitted during development to help guide correct usage.
 */

import { iif } from '../../core/utils';
import { lines } from './helpers';

export const MESSAGES = Object.freeze({
  SIGNAL_OUTSIDE_CONTAINER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Signal created without a state container owner',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This signal was created outside of a component or model.',
        'It will not be automatically cleaned up and may outlive its intended scope.'
      )
    }
  },

  COMPONENT_ALREADY_DEFINED: {
    kind: 'warn',
    category: 'component',
    summary: 'Component already defined',

    format({ name }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `The component "${name}" has already been defined in the custom elements registry.`,
        'Subsequent definitions are ignored.'
      )
    }
  },

  COMPUTED_OUTSIDE_CONTAINER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Computed created without a state container owner',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This computed value was created outside of a component or model.',
        'If it depends on signals, its lifetime may be unclear.'
      )
    }
  },

  MODEL_EFFECT_WITHOUT_OWNER: {
    kind: 'warn',
    category: 'ownership',
    summary: 'Effect created without an owning container',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This effect has no owning state container.',
        'It may continue running after the model is no longer in use.'
      )
    }
  },

  MODEL_FACTORY_HAS_PARAMS: {
    kind: 'warn',
    category: 'model',
    summary: 'Model factory expects arguments',

    validate({ arity }) {
      if (typeof arity !== 'number') {
        return 'Expected numeric "arity"'
      }
    },

    format({ name = null, arity }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'Model factories must be pure functions with zero arity.',
        `This factory${iif(name, ` (${name})`, '')} declares ${arity} parameter(s).`,
        'If you need component ownership, use model.owned(() => { ... })',
        'and pass ctx at instantiation time.'
      )
    }
  },

  SHARED_MODEL_KEY_COLLISION: {
    kind: 'warn',
    category: 'model',
    summary: 'Shared model key reused for a different model',

    validate({ key }) {
      if (key == null) {
        return 'Expected "key"'
      }
    },

    format({ key }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        `A shared model already exists for key "${key}".`,
        'Reusing keys across different models can cause unexpected state sharing.'
      )
    }
  },

  SHARED_MODEL_DYNAMIC_KEY: {
    kind: 'warn',
    category: 'state',
    summary: 'model.shared() called with unstable key',

    validate({ key }) {
      if (key == null) {
        return 'Expected "key"'
      }
    },

    format({ key }, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.shared() requires a stable, deterministic key.',
        `The provided key ${String(key)} may change between calls.`
      )
    }
  },

  MODEL_CREATES_CONTAINER_IMPLICITLY: {
    kind: 'warn',
    category: 'state',
    summary: 'Model created its own state container',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This model created a state container implicitly.',
        'If ownership matters, consider creating the container explicitly instead.'
      )
    }
  },

  MULTIPLE_CONTAINERS_IN_MODEL: {
    kind: 'warn',
    category: 'state',
    summary: 'Multiple state containers created in a single model',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'This model created more than one state container.',
        'This can make ownership and cleanup harder to reason about.'
      )
    }
  },

  MODEL_OWNED_WITHOUT_CONTEXT: {
    kind: 'warn',
    category: 'model',
    summary: 'model.owned() called without a context',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.owned() was called without a context.',
        'This may cause ownership and cleanup to function incorrectly.'
      )
    }
  },

  MODEL_SHARED_WITHOUT_KEY: {
    kind: 'warn',
    category: 'model',
    summary: 'model.shared() called without a key',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'model.shared() requires an explicit key to define its sharing boundary.',
        'Without one, the model cannot be safely reused.'
      )
    }
  },

  STATE_CONTAINER_UNUSED: {
    kind: 'warn',
    category: 'state',
    summary: 'State container created but never used',

    format(_, { chalky }) {
      return lines(
        chalky.bold(this.summary),
        '',
        'A state container was created but no state or computed values were added.',
        'This may be leftover scaffolding.'
      )
    }
  }
})
