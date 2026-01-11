import { renderTemplate } from './template';
import { Signal } from './signals';


export const mount = (target = document.body, template) => {
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
