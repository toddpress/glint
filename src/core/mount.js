import { renderTemplate } from './template';
import { Signal } from './signals';


export const mount = (template, target = document.body) => {
  const rootNode =
    typeof target === 'string'
      ? document.querySelector(target)
      : target;

  if (!rootNode) {
    throw new Error('Glint render target not found');
  }

  const dom = renderTemplate(template, (fn) => Signal.effect(fn));

  rootNode.innerHTML = '';
  rootNode.appendChild(dom);
};
