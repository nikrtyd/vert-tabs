// TODO: config
// const config = JSON.parse("");

const tabsElem = document.getElementById('tabs');
const pinnedTabsElem = document.getElementById('tabs--pinned');

/** List all tabs to #tabs and #tabs--pinned HTML elements asynchronously */
let listAsync = new Promise(function (resolve) {
  // Get tabs in current window
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    let currentTabs = document.createDocumentFragment();
    let currentPinnedTabs = document.createDocumentFragment();

    tabsElem.innerText = '';
    pinnedTabsElem.innerText = '';

    for (let tab of tabs) {
      let tabLink = render(tab);
      if (tab.pinned) { currentPinnedTabs.appendChild(tabLink); }
      else { currentTabs.appendChild(tabLink); }
    }

    pinnedTabsElem.appendChild(currentPinnedTabs);
    tabsElem.appendChild(currentTabs);
    resolve('Tabs are listed');
  });
});

browser.windows.getCurrent().then((window) => {
  this.currentWindowId = window.id;
});

// document.addEventListener("DOMContentLoaded", listAsync);

/**
 * Renders a tab with its info into HTML tab element.
 * @param {object} tab - tab to render
 * @returns undefined if tab is hidden, else HTMLAnchorElement
 */
function render(tab) {
  if (tab.hidden) return;
  let tabLink = document.createElement('a');
  let favIconUrl = tab.favIconUrl;
  switch (favIconUrl) {
    case "":
    // case "'":
    // case "`":
    // case "\"":
    case undefined:
    case null:
    case []:
    case {}:
      favIconUrl = "chrome://global/skin/icons/defaultFavicon.svg";
      break;
    case "chrome://mozapps/skin/extensions/extension.svg":
      favIconUrl = window.location.origin + "/icons/firefox/proton/extension.svg";
      break;
    default:
      break;
  }
  let tabIcon = tabTitle = discardIndic = audioIndic = audioAnnotation = cameraSharingIndic = microphoneSharingIndic = screenSharingIndic = readerModeIndic = closeBtn = '';
  tabIcon = '<img class="tab__icon" src="' + favIconUrl + '">';
  tabTitle = '<div class="tab__title-container"><div class="tab__title">' + tab.title + '</div></div>';
  if (tab.audible) {
    audioIndic = '<img class="audio__indicator" src="TODO" alt="🔊">';
    audioAnnotation = '<div class="audio__annotation">PLAYING AUDIO</div>';
  }
  if (tab.mutedInfo.muted) {
    audioIndic = '<img class="audio__indicator" src="TODO" alt="🔇">';
    audioAnnotation = '<div class="audio__annotation">MUTED</div>';
  }
  if (tab.discarded) {
    discardIndic = '<img class="discard__indicator" src="TODO" alt="⏸️" title="Currently idle">';
    tabLink.classList.add('discarded');
  }
  if (tab.sharingState.camera)
    cameraSharingIndic = '<img class="tab__camera-sharing" aria-label="Currently using camera" src="TODO" alt="📸" title="Currently using camera">';
  if (tab.sharingState.microphone)
    microphoneSharingIndic = '<div class="tab__microphone-sharing" aria-label="Currently using microphone" src="TODO" alt="🎤" title="Currently using microphone">';
  if (tab.sharingState.screen)
    screenSharingIndic = '<img class="tab__screen-sharing" aria-label="Currently sharing your screen" src="TODO" alt="🔴" title="Currently sharing your screen">';
  if (tab.isInReaderMode)
    readerModeIndic = '<img class="tab__reader-mode" aria-label="Opened in Reader mode" src="TODO" alt="📖" title="Opened in Reader mode">';
  closeBtn = '<div class="tab__close" data-id="' + tab.id + '" aria-label="Close tab" role="button" title="Close tab">⨉</div>';

  tabLink.innerHTML = tabIcon + tabTitle + discardIndic + audioIndic + audioAnnotation + cameraSharingIndic + readerModeIndic + closeBtn;

  if (tab.active)
    tabLink.classList.add('active');
  if (tab.attention)
    tabLink.classList.add('attention');

  tabLink.setAttribute('data-id', tab.id);
  tabLink.setAttribute('data-index', tab.index);
  tabLink.setAttribute('data-window-id', tab.windowId);
  tabLink.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ", pinned" : ""}:`);
  tabLink.classList.add('tab__elem');
  return tabLink;
}

// On left mouse click:
document.addEventListener("click", (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon'))
    target = target.parentNode; // should be .tab__elem

  if (target.classList.contains('tab__title'))
    target = target.parentNode.parentNode;

  e.preventDefault();

  if (target.classList.contains('tab__close'))
    browser.tabs.remove(+target.getAttribute('data-id'));

  if (target.id === "tabs-create")
    browser.tabs.create({});
});

// On mousedown:
document.addEventListener('mousedown', (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon'))
    target = target.parentNode; // should be .tab__elem

  if (target.classList.contains('tab__title'))
    target = target.parentNode.parentNode;

  if (target.classList.contains('discard__indicator')) {
    let tabId = +target.parentNode.getAttribute('data-id');
    // Unfortunately, we cannot directly update 'discarded' property at the moment. So to undiscard the tab, we're setting URL anew.
    browser.tabs.get(tabId).then((tab) => browser.tabs.update(tabId, { url: tab.url }));
  }

  if (target.classList.contains('audio__indicator')) {
    let tabId = +target.parentNode.getAttribute('data-id');
    browser.tabs.get(tabId).then((tab) => {
      browser.tabs.update(tabId, { muted: (tab.mutedInfo.muted) ? false : true });
    });

  }

  if (e.button === 1) {
    e.preventDefault();
    browser.tabs.remove(+target.getAttribute('data-id'));
    return false;
  }

  console.log(target);
  if (target.classList.contains('tab__elem')) {
    let tabId = +target.getAttribute('data-id');
    document.querySelector(`.tab__elem[data-id="${tabId}"]`).classList.add('active');
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, { active: true });
        }
      }
    });
  }
});

// Prevent context menu showing
document.addEventListener("contextmenu", e => e.preventDefault())

// Prevent zooming
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

/**
 * Scrolls document to given HTML element.
 * @param {HTMLElement} el - element to scroll to
 */
function scrollToEl(el) {
  window.scrollTo({ left: 0, top: el.getBoundingClientRect().top, behavior: "smooth" });
}

/**
 * Checks if element is in view.
 * @param {HTMLElement} el - element to check
 * @returns true if element is in viewport, else returns false
 */
function isElementInViewport(el) {
  let rect = el.getBoundingClientRect();

  console.log('el is in viewport: ' +
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth));

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

browser.tabs.onRemoved.addListener((tabId) => {
  let tabElem = document.querySelector(`.tab__elem[data-id="${tabId}"]`);
  if (tabElem) {
    tabElem.remove();
    console.log(`removed a tab: ${tabId}`);
    resetIndexes();
  }
});

browser.tabs.onCreated.addListener((tab) => {
  console.log('created a tab:');
  console.log(tab);
  place(tab);
  resetIndexes();
});

browser.tabs.onUpdated.addListener((tabId) => {
  browser.tabs.get(tabId).then((tab) => {
    document.querySelector(`.tab__elem[data-id="${tabId}"]`).replaceWith(render(tab));
  });
});

browser.tabs.onActivated.addListener((tab) => {
  // callIfTabIsOnCurrentWindow(tab, () => {
  let tabElem = document.querySelector(`.tab__elem[data-id="${tab.tabId}"]`);
  let prevTabElem = document.querySelector(`.tab__elem[data-id="${tab.previousTabId}"]`);
  if (tabElem)
    tabElem.classList.add('active');
  if (prevTabElem)
    prevTabElem.classList.remove('active');
  // });
});

/**
 * Places a tab in a tab list.
 * @param {object} tab - tab to render & place in tab list
 */
function place(tab) {
  callIfTabIsOnCurrentWindow(tab, () => {
    if (tab.openerTabId) {
      document.querySelector(`.tab__elem[data-id="${tab.openerTabId}"]`).after(render(tab));
      return;
    }
    if (tab.index === 0) {
      document.querySelector(`.tab__elem[data-index="${tab.index + 1}"]`).before(render(tab));
      return;
    }
    document.querySelector(`.tab__elem[data-index="${tab.index - 1}"]`).after(render(tab));
  });
}

/**
 * Call a function only if tab belongs to current window.
 * @param {object} tab - tab to check
 * @param {Function} callback - function to call
 */
function callIfTabIsOnCurrentWindow(tab, callback) {
  if (tab.windowId === this.currentWindowId)
    callback(tab);
}

/** Blindly reset indexes and a11y labels */
function resetIndexes() {
  let pinnedTabsCount = pinnedTabsElem.childElementCount;
  let tabsCount = tabsElem.childElementCount;
  let allTabsCount = pinnedTabsCount + tabsCount;
  for (let i = 0; i < pinnedTabsCount; i++) {
    pinnedTabsElem.childNodes[i].setAttribute('data-index', i);
    pinnedTabsElem.childNodes[i].setAttribute('aria-label', `Tab ${i}, pinned:`);
  }
  for (let i = pinnedTabsCount, j = 0; i < allTabsCount, j < tabsCount; i++, j++) {
    tabsElem.childNodes[j].setAttribute('data-index', i);
    tabsElem.childNodes[j].setAttribute('aria-label', `Tab ${i}:`);
  }
}

/**
 * Moves tab1 to place of tab2.
 * If trying to swap pinned and unpinned tab, does nothing.
 * @param {object} tab1 - tab to swap
 * @param {object} tab2 - tab it will be swapped with
 */
function move(tab1, tab2) {
  // Make sure to not swap pinned and unpinned tab
  if ((tab1.pinned && !tab2.pinned) || (!tab1.pinned && tab2.pinned)) return;
}

/**
 * Swaps tabEl1 and tabEl2 in tabs list.
 * @param {HTMLElement} tabEl1 - tabEl to swap
 * @param {HTMLElement} tabEl2 - tabEl it will be swapped with
 */
function swapEl(tabEl1, tabEl2) {
  let temp = tabEl1;
  tabEl1.replaceWith(tabEl2);
  tabEl2.replaceWith(temp);
}

