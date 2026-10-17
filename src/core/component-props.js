import { safeParse } from './utils.js';
export function propsFor(element) {
  const props = Object.create(null);
  for (const name of element.getAttributeNames()) {
    const raw = element.getAttribute(name);
    let value = raw === '' ? true : safeParse(raw);
    if (value === raw && raw.trim() !== '' && !Number.isNaN(Number(raw))) value = Number(raw);
    props[name] = value;
    props[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return props;
}
