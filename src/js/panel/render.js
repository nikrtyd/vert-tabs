import { ROOT_URL } from "../modules/consts.js";
import { CONFIG } from "../modules/config.js";

/**
 * Get tab info and make an HTMLAnchorElement from it.
 * 
 * @param {Object} tab Tab to render
 * @returns Returns `undefined` if tab is hidden, else `HTMLAnchorElement`
 * 
 * @example
 * 
 * render(tabs.get(1));
 * // => true
 */
const render = function getTabInfoAndMakeTabElFromIt(tab) {
  if (tab.hidden)
    return;
  let tabElem = document.createElement('a');
  let favIconUrl = tab.favIconUrl;
  switch (favIconUrl) {
    case '':
    case undefined:
    case null:
    case []:
    case {}:
      favIconUrl = 'chrome://global/skin/icons/defaultFavicon.svg';
      break;
    // Unfortunately, due to some security reasons, Firefox forbids loading
    // these icons in WebExtensions. So we need to use our local copies of them.
    case 'chrome://mozapps/skin/extensions/extension.svg':
      favIconUrl = `${ROOT_URL}/icons/firefox/proton/extension.svg`;
      break;
    case 'chrome://devtools/skin/images/profiler-stopwatch.svg':
      favIconUrl = `${ROOT_URL}/icons/firefox/proton/profiler-stopwatch.svg`;
      break;
    default:
      break;
  }
  let tabIcon, tabTitleContainer, tabTitle, discardIndic, audioIndic, audioAnnotation, cameraSharingIndic, microphoneSharingIndic, screenSharingIndic, readerModeIndic, closeBtn;
  tabIcon = tabTitleContainer = tabTitle = discardIndic = audioIndic = audioAnnotation = cameraSharingIndic = microphoneSharingIndic = screenSharingIndic = readerModeIndic = closeBtn = '';

  if (CONFIG.tabs.contents.showCloseBtn) {
    closeBtn = document.createElement('div');
    closeBtn.classList.add('tab-close');
    closeBtn.setAttribute('data-id', tab.id);
    closeBtn.setAttribute('aria-label', 'Close 1 tab');
    closeBtn.setAttribute('role', 'button');
    closeBtn.setAttribute('title', 'Close 1 tab');
    closeBtn.textContent = '⨉';
  }

  tabIcon = document.createElement('img');
  tabIcon.className = 'tab-icon';
  tabIcon.setAttribute('src', favIconUrl);

  tabTitleContainer = document.createElement('div');
  tabTitleContainer.classList.add('tab-title-container');
  tabTitle = document.createElement('div');
  tabTitle.className = 'tab-title';
  if (tab.attention) {
    tabTitle.setAttribute('title', browser.i18n.getMessage('tabRequiresAttention'));
    tabElem.classList.add('attention');
  }
  tabTitle.textContent = tab.title;
  tabTitleContainer.appendChild(tabTitle);

  audioIndic = document.createElement('div');
  audioIndic.className = 'audio-indicator';
  // audioIndic.setAttribute('src', ''); // chrome://browser/skin/tabbrowser/tab-audio-playing-small.svg
  audioIndic.setAttribute('title', browser.i18n.getMessage('muteTab'));
  // audioIndic.setAttribute('alt', ''); // 🔊

  audioAnnotation = document.createElement('div');
  audioAnnotation.className = 'audio-annotation';


  discardIndic = document.createElement('div');
  discardIndic.className = 'discard-indicator';
  discardIndic.setAttribute('title', browser.i18n.getMessage('refreshDiscardedTab'));

  if (tab.audible) {
    audioAnnotation.innerText = browser.i18n.getMessage('playing');
    tabElem.classList.add('audible');
  }
  if (tab.mutedInfo.muted) {
    audioAnnotation.innerText = browser.i18n.getMessage('muted');
    tabElem.classList.add('muted');
  }
  if (tab.discarded) {
    tabElem.classList.add('discarded');
  }
  if (tab.sharingState.camera) {
    cameraSharingIndic = document.createElement('img');
    cameraSharingIndic.className = 'tab-camera-sharing';
    cameraSharingIndic.setAttribute('aria-label', browser.i18n.getMessage('currentlyUsingCamera'));
    cameraSharingIndic.setAttribute('src', 'TODO');
    cameraSharingIndic.setAttribute('alt', '📸');
    cameraSharingIndic.setAttribute('title', browser.i18n.getMessage('currentlyUsingCamera'));

    tabElem.classList.add('sharing-camera');
  }
  if (tab.sharingState.microphone) {
    microphoneSharingIndic = document.createElement('img');
    microphoneSharingIndic.className = 'tab-microphone-sharing';
    microphoneSharingIndic.setAttribute('aria-label', browser.i18n.getMessage('currentlyUsingMicrophone'));
    microphoneSharingIndic.setAttribute('src', 'TODO');
    microphoneSharingIndic.setAttribute('alt', '🎤');
    microphoneSharingIndic.setAttribute('title', browser.i18n.getMessage('currentlyUsingMicrophone'));

    tabElem.classList.add('sharing-microphone');
  }
  if (tab.sharingState.screen) {
    screenSharingIndic = document.createElement('img');
    screenSharingIndic.className = 'tab-screen-sharing';
    screenSharingIndic.setAttribute('aria-label', browser.i18n.getMessage('currentlySharingScreen'));
    screenSharingIndic.setAttribute('src', 'TODO');
    screenSharingIndic.setAttribute('alt', '🔴');
    screenSharingIndic.setAttribute('title', browser.i18n.getMessage('currentlySharingScreen'));

    tabElem.classList.add('sharing-screen');
  }
  if (tab.isInReaderMode) {
    readerModeIndic = document.createElement('img');
    readerModeIndic.className = 'tab-reader-mode';
    readerModeIndic.setAttribute('aria-label', browser.i18n.getMessage('inReaderMode'));
    readerModeIndic.setAttribute('src', 'TODO');
    readerModeIndic.setAttribute('alt', '📖');
    readerModeIndic.setAttribute('title', browser.i18n.getMessage('inReaderMode'));

    tabElem.classList.add('reader-mode');
  }
  if (tab.active) {
    tabElem.classList.add('active');
  }

  if (CONFIG.allowTabDrag) {
    tabElem.addEventListener('mouseenter', onTabElemMouseEnter);
    tabElem.addEventListener('mousedown', ontabElemMouseDown);
  }

  tabElem.append(tabIcon, discardIndic, audioIndic, tabTitleContainer, audioAnnotation, cameraSharingIndic, readerModeIndic, closeBtn);

  tabElem.setAttribute('data-id', tab.id);
  tabElem.setAttribute('data-index', tab.index);
  tabElem.setAttribute('data-window-id', tab.windowId);
  tabElem.setAttribute('aria-label', `Tab ${tab.index}${tab.pinned ? ', pinned' : ''}:`);
  tabElem.classList.add('tab-elem');

  return tabElem;
};
