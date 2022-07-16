const localize = function replaceTextContentWithLocString(el) {
  el.textContent = browser.i18n.getMessage(el.getAttribute('data-i18n'));
}

document.querySelectorAll('[data-i18n]').forEach(localize);
