import { __DEV__ } from "./env";
import { _emit } from "./logging";

export function createInternalsController(host, Component) {
  let internals = null;
  let requested = false;
  let didSetFormValue = false;
  let didSetValidity = false;

  const name = Component.is ?? Component.name;

  function attach() {
    internals = host.attachInternals();

    if (!__DEV__) return internals;

    const _setFormValue = internals.setFormValue.bind(internals);
    const _setValidity = internals.setValidity.bind(internals);

    internals.setFormValue = (...args) => {
      didSetFormValue = true;
      return _setFormValue(...args);
    };

    internals.setValidity = (...args) => {
      didSetValidity = true;

      if (!didSetFormValue) {
        _emit('VALIDITY_WITHOUT_FORM_VALUE', { name });
      }

      return _setValidity(...args);
    };

    return internals;
  }

  function get() {
    requested = true;

    if (__DEV__) {
      if (!Component.formAssociated) {
        _emit('INTERNALS_WITHOUT_FORM_ASSOCIATION', { name });
      }

      if (typeof host.attachInternals !== 'function') {
        _emit('INTERNALS_UNSUPPORTED', { name });
        return null;
      }
    }

    if (!internals) attach();
    return internals;
  }

  function audit() {
    if (
      !requested ||
      !internals ||
      didSetFormValue ||
      didSetValidity
    ) return;

    _emit('INTERNALS_UNUSED', { name });
  }

  return { get, audit };
}
