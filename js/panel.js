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
    addOverflowFadeForEveryTab();
    resolve('Tabs are listed');
  });
});

browser.windows.getCurrent().then((window) => this.currentWindowId = window.id);

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
    case '':
    // case '\'':
    // case '`':
    // case '"':
    case undefined:
    case null:
    case []:
    case {}:
      favIconUrl = 'chrome://global/skin/icons/defaultFavicon.svg';
      break;
    case 'chrome://mozapps/skin/extensions/extension.svg':
      favIconUrl = window.location.origin + '/icons/firefox/proton/extension.svg';
      break;
    case 'chrome://devtools/skin/images/profiler-stopwatch.svg':
      favIconUrl = window.location.origin + '/icons/firefox/proton/profiler-stopwatch.svg';
      break;
    default:
      break;
  }
  let tabIcon = tabTitleContainer = tabTitle = discardIndic = audioIndic = audioAnnotation = attentionTooltip = cameraSharingIndic = microphoneSharingIndic = screenSharingIndic = readerModeIndic = closeBtn = document.createElement('div');

  // closeBtn = '<div class="tab__close" data-id="' + tab.id + '" aria-label="Close tab" role="button" title="Close 1 tab">⨉</div>';
  closeBtn = document.createElement('div');
  closeBtn.classList.add('tab__close');
  closeBtn.setAttribute('data-id', tab.id);
  closeBtn.setAttribute('aria-label', 'Close 1 tab');
  closeBtn.setAttribute('role', 'button');
  closeBtn.setAttribute('title', 'Close 1 tab');
  closeBtn.textContent = '⨉';

  // tabIcon = '<img class="tab__icon" src="' + favIconUrl + '">';
  tabIcon = document.createElement('img');
  tabIcon.className = 'tab__icon';
  tabIcon.setAttribute('src', favIconUrl);

  // tabTitle = '<div class="tab__title-container"><div class="tab__title" ' + attentionTooltip + '>' + tab.title + '</div></div>';
  tabTitleContainer = document.createElement('div');
  tabTitleContainer.classList.add('tab__title-container');
  tabTitle = document.createElement('div');
  tabTitle.className = 'tab__title';
  if (tab.attention) {
    tabTitle.setAttribute('title', 'This tab requires your attention.');
    tabLink.classList.add('attention');
  }
  tabTitle.textContent = tab.title;
  tabTitleContainer.appendChild(tabTitle);

  if (tab.audible) {
    // audioIndic = '<img class="audio__indicator" src="TODO" alt="🔊">';
    audioIndic = document.createElement('img');
    audioIndic.className = 'audio__indicator';
    audioIndic.setAttribute('src', 'TODO');
    audioIndic.setAttribute('alt', '🔊');

    // audioAnnotation = '<div class="audio__annotation">PLAYING AUDIO</div>';
    audioAnnotation = document.createElement('div');
    audioAnnotation.className = 'audio__annotation';
    audioAnnotation.innerText = 'PLAYING AUDIO';

    tabLink.classList.add('audible');
  }
  if (tab.mutedInfo.muted) {
    // audioIndic = '<img class="audio__indicator" src="TODO" alt="🔇">';
    audioIndic = document.createElement('img');
    audioIndic.className = 'audio__indicator';
    audioIndic.setAttribute('src', 'TODO');
    audioIndic.setAttribute('alt', '🔇');

    // audioAnnotation = '<div class="audio__annotation">MUTED</div>';
    audioAnnotation = document.createElement('div');
    audioAnnotation.className = 'audio__annotation';
    audioAnnotation.innerText = 'MUTED';

    tabLink.classList.add('muted');
  }
  if (tab.discarded) {
    // discardIndic = '<img class="discard__indicator" src="TODO" alt="⏸️" title="This tab is currently discarded. Click to refresh.">';
    discardIndic = document.createElement('img');
    discardIndic.className = 'discard__indicator';
    discardIndic.setAttribute('src', 'TODO');
    discardIndic.setAttribute('alt', '⏸️');
    discardIndic.setAttribute('title', 'This tab is currently discarded. Click to refresh.');

    tabLink.classList.add('discarded');
  }
  if (tab.sharingState.camera) {
    // cameraSharingIndic = '<img class="tab__camera-sharing" aria-label="Currently using camera" src="TODO" alt="📸" title="Currently using camera">';
    cameraSharingIndic = document.createElement('img');
    cameraSharingIndic.className = 'tab__camera-sharing';
    cameraSharingIndic.setAttribute('aria-label', 'Currently using camera');
    cameraSharingIndic.setAttribute('src', 'TODO');
    cameraSharingIndic.setAttribute('alt', '📸');
    cameraSharingIndic.setAttribute('title', 'Currently using camera');

    tabLink.classList.add('sharing-camera');
  }
  if (tab.sharingState.microphone) {
    // microphoneSharingIndic = '<img class="tab__microphone-sharing" aria-label="Currently using microphone" src="TODO" alt="🎤" title="Currently using microphone">';
    microphoneSharingIndic = document.createElement('img');
    microphoneSharingIndic.className = 'tab__microphone-sharing';
    microphoneSharingIndic.setAttribute('aria-label', 'Currently using microphone');
    microphoneSharingIndic.setAttribute('src', 'TODO');
    microphoneSharingIndic.setAttribute('alt', '🎤');
    microphoneSharingIndic.setAttribute('title', 'Currently using microphone');

    tabLink.classList.add('sharing-microphone');
  }
  if (tab.sharingState.screen) {
    // screenSharingIndic = '<img class="tab__screen-sharing" aria-label="Currently sharing your screen" src="TODO" alt="🔴" title="Currently sharing your screen">';
    screenSharingIndic = document.createElement('img');
    screenSharingIndic.className = 'tab__screen-sharing';
    screenSharingIndic.setAttribute('aria-label', 'Currently sharing your screen');
    screenSharingIndic.setAttribute('src', 'TODO');
    screenSharingIndic.setAttribute('alt', '🔴');
    screenSharingIndic.setAttribute('title', 'Currently sharing your screen');

    tabLink.classList.add('sharing-screen');
  }
  if (tab.isInReaderMode) {
    // readerModeIndic = '<img class="tab__reader-mode" aria-label="Opened in Reader mode" src="TODO" alt="📖" title="Opened in Reader mode">';    
    readerModeIndic = document.createElement('img');
    readerModeIndic.className = 'tab__reader-mode';
    readerModeIndic.setAttribute('aria-label', 'Opened in Reader mode');
    readerModeIndic.setAttribute('src', 'TODO');
    readerModeIndic.setAttribute('alt', '📖');
    readerModeIndic.setAttribute('title', 'Opened in Reader mode');

    tabLink.classList.add('reader-mode');
  }
  if (tab.active) {
    tabLink.classList.add('active');
  }

  // tabLink.innerHTML = tabIcon + tabTitleContainer + discardIndic + audioIndic + audioAnnotation + cameraSharingIndic + readerModeIndic + closeBtn;
  tabLink.appendChild(tabIcon);
  tabLink.appendChild(tabTitleContainer);
  tabLink.appendChild(discardIndic);
  tabLink.appendChild(audioIndic);
  tabLink.appendChild(audioAnnotation);
  tabLink.appendChild(cameraSharingIndic);
  tabLink.appendChild(readerModeIndic);
  tabLink.appendChild(closeBtn);

  tabLink.setAttribute('data-id', tab.id);
  tabLink.setAttribute('data-index', tab.index);
  tabLink.setAttribute('data-window-id', tab.windowId);
  tabLink.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ', pinned' : ''}:`);
  tabLink.classList.add('tab__elem');
  addOverflowFade(tabLink);
  return tabLink;
}

// On left mouse click:
document.addEventListener('click', (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title-container'))
    target = target.parentNode; // should be .tab__elem

  if (target.classList.contains('tab__title'))
    target = target.parentNode.parentNode;

  e.preventDefault();

  if (target.classList.contains('tab__close'))
    browser.tabs.remove(+target.getAttribute('data-id'));

  if (target.id === 'tabs-create')
    browser.tabs.create({});
});

// On mousedown:
document.addEventListener('mousedown', (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title-container'))
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

  if (target.classList.contains('tab__elem')) {
    let tabId = +target.getAttribute('data-id');
    // target.style.zIndex = '1';
    // target.onmousedown = dragMouseDown;
    target.onmousedown = tabOnMouseDown;
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

function tabOnMouseDown(e) {
  e.target.onmousemove = tabDrag;
}

function tabDrag(e) {
  console.log(e);
}

// function dragMouseDown(e) {
//   e.target.onmousemove = mouseMoveOnTab;
// }

// function mouseMoveOnTab(e) {
//   let target = e.target;

//   // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
//   if (target.classList.contains('tab__icon') || target.classList.contains('tab__title-container') || target.classList.contains('tab__close'))
//     target = target.parentNode; // should be .tab__elem

//   if (target.classList.contains('tab__title'))
//     target = target.parentNode.parentNode;

//   target.style.zIndex = '1';
//   target.style.position = 'relative';
//   target.style.top = (e.clientY - (26 * countToActive()) - 26) + 'px';
//   console.log(e.clientY);
//   console.log((26 * countToActive()));

// }

// function countToActive() {
//   let count = 0;
//   for (let i = 0; i < pinnedTabsElem.childElementCount; i++, count++)
//     if (pinnedTabsElem.childNodes[i].classList.contains('active')) return count;

//   for (let i = 0; i < tabsElem.childElementCount; i++, count++)
//     if (tabsElem.childNodes[i].classList.contains('active')) return count;

// }

// document.addEventListener('mouseover', (e) => {
//   if (e.target.classList.contains('tab__title')) {
//     let tabTitle = e.target;
//     let tabTitleContainer = e.target.parentNode;
//     if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
//       tabTitleContainer.classList.add('overflow');
//     else tabTitleContainer.classList.remove('overflow');
//   }
// });

function addOverflowFade(tabLink) {
  let tabTitleContainer = tabLink.children[1];
  let tabTitle = tabTitleContainer.firstChild;
  if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
    tabTitleContainer.classList.add('overflow');
  else tabTitleContainer.classList.remove('overflow');
}

function addOverflowFadeForEveryTab() {
  pinnedTabsElem.childNodes.forEach((tabLink) => addOverflowFade(tabLink));
  tabsElem.childNodes.forEach((tabLink) => addOverflowFade(tabLink));
}

document.addEventListener('resize', () => addOverflowFadeForEveryTab());

// Prevent context menu showing
document.addEventListener('contextmenu', e => e.preventDefault())

// Prevent zooming
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey)
    e.preventDefault();
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
    resetIndexes();
  }
});

browser.tabs.onCreated.addListener((tab) => {
  place(tab);
  resetIndexes();
});

browser.tabs.onUpdated.addListener((tabId) => {
  browser.tabs.get(tabId).then((tab) => {
    callIfTabIsOnCurrentWindow(tab, () => {
      if (tab.pinned) {

      }
      document.querySelector(`.tab__elem[data-id="${tabId}"]`).replaceWith(render(tab));
      addOverflowFade(document.querySelector(`.tab__elem[data-id="${tabId}"]`));
    });
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
    let scope;
    if (tab.pinned) {
      scope = pinnedTabsElem;
    } else {
      scope = tabsElem;
    }
    if (tab.openerTabId) {
      scope.querySelector(`.tab__elem[data-id="${tab.openerTabId}"]`).after(render(tab));
      return;
    }
    if (tab.index === 0) {
      scope.querySelector(`.tab__elem[data-index="${tab.index + 1}"]`).before(render(tab));
      return;
    }
    scope.querySelector(`.tab__elem[data-index="${tab.index - 1}"]`).after(render(tab));
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

