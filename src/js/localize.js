/**
 * Replaces `textContent` of `el` with localized string gotten from
 * `_locales/<langcode>/messages.json`.
 * 
 * Warning: `data-i18n` attribute must precisely
 * match the equivalent key in `messages.json`.
 * 
 * @param {HTMLElement} htmlElement The element whose textContent will be
 * localized.
 */
const localize = function replaceTextContentWithLocString(htmlElement) {
  htmlElement.textContent = browser.i18n.getMessage(htmlElement.getAttribute('data-i18n'));
}

// Finds all elements with a `data-i18n` attribute and
// localizes their text content.
document.querySelectorAll('[data-i18n]').forEach(localize);
