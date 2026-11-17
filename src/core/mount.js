import { instantiateTemplate } from './template';

const templates = new WeakMap();


export const mount = (target = document.body, template) => {
  const rootNode =
    typeof target === 'string'
      ? document.querySelector(target)
      : target;

  if (!rootNode) {
    throw new Error('Glint render target not found');
  }

  const instance = instantiateTemplate(template);
  templates.get(rootNode)?.dispose();
  templates.set(rootNode, instance);
  rootNode.replaceChildren(instance.fragment);
};
