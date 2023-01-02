import { TabElementTemplate } from "./tab_element_template.js";
import { SIDEBAR_DOM } from "./consts.js";

/**
 * Used for constructing (or rendering) tab element to place into
 * {@linkcode SIDEBAR_DOM}'s TAB_LIST.
 * 
 * `tab` object can be passed to construct its corresponding tab div.
 * 
 * @class TabElement
 * @extends TabElementTemplate
 */
export class TabElement extends TabElementTemplate {

  /**
   * Pick only these properties that can be used to create CSS classes for
   * `TabElement` objects.
   * 
   * @param {Object} tab `Tab` object from `browser.tabs.get` or `query`.
   * @returns {Object} Object with properties needed for CSS.
   * @example
   * this.pickNeededProperties(tab)
   * // => Object { active: true, attention: false, ...
   */
  extractNeededProperties = ({ active, attention, audible, discarded, hidden,
    highlighted, isInReaderMode, mutedInfo, sharingState, status }) => {
    const muted = mutedInfo.muted;
    const readermode = isInReaderMode;
    const screensharing = sharingState.screen;
    const microphonesharing = sharingState.microphone;
    const camerasharing = sharingState.camera;
    const loading = (status === 'loading');
    const complete = (status === 'complete');
    return {
      active, attention, audible, discarded, hidden, highlighted, readermode,
      muted, screensharing, microphonesharing, camerasharing, loading,
      complete
    }
  };

  /**
   * Calls {@linkcode extractNeededProperties} to retrieve needed properties,
   * and returns an `Array` of classes.
   * 
   * @param {Object} tab `Tab` object from `browser.tabs.get` or `query`.
   * @returns {string[]} List of classes to append to `TabElement` object.
   * @example
   * this.makeClasses(tab)
   * // => Array [ "active", "audible", "highlighted" ]
   */
  generateClasses = function (tab) {
    const props = this.pickNeededProperties(tab);
    const keys = Object.keys(props);
    const classes = [];
    keys.forEach(key => {
      if (props[key])
        classes.push(key);
    });
    return classes;
  };

  /**
   * Gets info about a tab from `tab` parameter and then creates an object
   * of class TabElement that's needed to build an HTML div.
   * 
   * @param {Object} tab The object of a tab, gotten using `browser.tabs.get`
   * or smth else.
   * @example
   * let tab = browser.tabs.get(2)
   * // => Tab { id: 2, index: 0, windowId: 1, ...
   * let tabHtml = new TabElement(tab)
   * // => TabElement { toHTMLDivElement: function(), ...
   */
  constructor(tab) {
    super(tab);

    const TAB_TITLE_DIV = this.contents.tabTitleContainer.childNodes[0];

    this.generateClasses(tab).forEach(className => {
      // Add class names, for example 'audible' or 'highlighted'.
      this.contents.root.classList.add(className);
    });
    // Modify inner HTML contents to include gotten info.
    this.contents.favIcon.src = tab.favIconUrl;
    TAB_TITLE_DIV.textContent = tab.title;

    // Assemble resulting div.
    this.contents.root.append(
      ...[
        this.contents.favIcon,
        this.contents.tabTitleContainer,
        this.contents.buttons.pin,
        this.contents.buttons.reload,
        this.contents.buttons.back,
        this.contents.buttons.forward,
        this.contents.buttons.close,
        this.contents.indicators.audio,
        this.contents.indicators.discard,
        this.contents.indicators.sharing.camera,
        this.contents.indicators.sharing.microphone,
        this.contents.indicators.sharing.screen,
        this.contents.annotations.audio
      ]
    );
  };

  /**
   * Returns TabElement as an `HTMLDivElement` object.
   * Then it can be inserted to {@linkcode SIDEBAR_DOM}'s `TAB_LIST`.
   * Assumes that `this.tabIcon`, `this.tabTitle`, etc. properties are set.
   * 
   * @returns {HTMLDivElement} HTML div to append to DOM.
   * @example
   * tab.toHTMLDivElement()
   * // => <a data-id="15" data-index="3" data-window-id="2"...> 
   */
  toHTMLDivElement = function () {
    return this.contents.root;
  };
};

