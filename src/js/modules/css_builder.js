/**
 * Puts new CSS style together using `theme` gotten by {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/theme/getCurrent browser.theme.getCurrent}.
 */
export class CSSBuilder {

  /**
   * Creates a new instance of `CSSBuilder`.
   * 
   * @param {string} selector CSS selector for the generated styles.
   * @param {Object} theme Theme object containing color values. You can get it
   * using the `browser.theme.getCurrent` method.
   * @example
   * let builder = new CSSBuilder(':root', theme)
   */
  constructor(selector, theme) {
    this.selector = selector;
    this.theme = theme;
  }

  /**
   * Stringifies `CSSBuilder.theme` in `text/css` format.
   * 
   * @returns {string} CSS in text format.
   * @example
   * new CSSBuilder(':root', theme).toCSSString()
   * // => ":root{--colors__bookmark_text:..."
   */
  toCSSString() {
    let css = `${this.selector}{`;
    // Recursively search for all keys in `theme` object.
    Object.keys(this.theme).forEach(key => {
      // Skip all entries that contain `null`.
      if (this.theme[key])
        Object.keys(this.theme[key]).forEach(innerKey => {
          if (this.theme[key][innerKey])
            css += `--${key}__${innerKey}:${this.theme[key][innerKey]};`
        })
    });
    return `${css}}`;
  }
}

// TODO: Implement dark theming when bug #1542044 (https://bugzilla.mozilla.org/show_bug.cgi?id=1542044) gets resolved. Or try to figure out any possible workarounds.
