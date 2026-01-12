// ------------------------------------------------------------
// Attribute mapper
// ------------------------------------------------------------
export const mapAttrs = (el) =>
  [...el.attributes].map((a) => ({
    name: a.name,
    value: a.value,
  }));
