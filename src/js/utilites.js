export function el(name, properties, attributes) {
  const e = document.createElement(name);

  if (typeof properties === 'object') {
    Object.assign(e, properties);
  }

  if (typeof attributes === 'object') {
    Object.entries(attributes).forEach(([key, value]) => {
      e.setAttribute(key, value);
    });
  }

  return e;
}
