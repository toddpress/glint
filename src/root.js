import { BaseComponent, componentRegistry } from "./component";

export const registerAllComponents = () => {
  componentRegistry.forEach(({ renderer, options }, name) => {
    if (customElements.get(name)) return;

    customElements.define(
      name,
      class extends BaseComponent {
        static renderer = renderer;
        static options = options;
      }
    );
  });
};

// ------------------------------------------------------------
// Top-level render (non-component root)
// ------------------------------------------------------------

export const render = (
  AppComponent,
  { autoRegister = true, rootNode = document.body } = {}
) => {
  if (autoRegister) registerAllComponents();

  const tpl = AppComponent();
  const dom = renderTemplate(tpl, (fn) => Signal.effect(fn));

  rootNode.innerHTML = '';
  rootNode.appendChild(dom);
};

// ------------------------------------------------------------
// `createRoot` function -- like React but lighter
// ------------------------------------------------------------

export function createRoot(target, options = {}) {
  const rootNode =
    typeof target === 'string'
      ? document.querySelector(target)
      : target;

  if (!rootNode) {
    throw new Error('Glint: root node is required');
  }

  return {
    render(App) {
      return render(App, {
        ...options,
        rootNode,
      });
    },

    unmount() {
      rootNode.replaceChildren();
    },
  };
}
