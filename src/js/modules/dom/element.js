/**
 * Creates new element of defined `type` and sets a number of `attributes` on it.
 * 
 * @param {string} type Type of the new element. For example, `div` or `img`.
 * @param {Object} attributes An object containing the attributes to set on the new element.
 * @returns {HTMLElement} The newly created element.
 * @example
 * const tabIcon = element('img', {src: 'https://picsum.photos/100/100'})
 * // => <img src="https://picsum.photos/100/100">
 */
export const element = function createElementOfDefinedTypeAndOptions(type, attributes) {
  const el = document.createElement(type);
  Object.keys(attributes).forEach(key => {
    el.setAttribute(key, attributes[key])
  });
  return el;
}
