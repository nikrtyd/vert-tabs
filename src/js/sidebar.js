import { CSSBuilder } from "./modules/css_builder.js";
import { TabElement } from "./modules/dom/tab_element.js";


/* Get current theme's CSS, and if we get something,
   wrap it in `style` element and insert into sidebar's head.
*/
(async function applyCssOfCurrentTheme() {
  const theme = await browser.theme.getCurrent();
  if (!theme.colors && !theme.images && !theme.properties) {
    const style = `<style type='text/css>${new CSSBuilder(':root',
      theme).toCSSString()}</style>`;
    SIDEBAR_DOM.HEAD.insertAdjacentHTML('beforeend', style);
  }
})();

/* Get all opened tabs in a current window,
   check if they are pinned, and decide where to place them into.
*/
(async function getAndPlaceTabs() {
  const pinnedTabs = await browser.tabs.query({ currentWindow: true, pinned: true });
  const tabs = await browser.tabs.query({ currentWindow: true, pinned: false });
  const pinnedTabsFragment = document.createDocumentFragment();
  pinnedTabs.forEach(tab => {
    const tabHtml = (new TabElement(tab)).toHTMLDivElement();
    pinnedTabsFragment.appendChild(tabHtml);
  });
  const tabsFragment = document.createDocumentFragment();
  tabs.forEach(tab => {
    const tabHtml = (new TabElement(tab)).toHTMLDivElement();
    tabsFragment.appendChild(tabHtml);
  });
  
})();
