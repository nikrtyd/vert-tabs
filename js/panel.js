// TODO: config
// const config = JSON.parse("");

const tabsElem = document.getElementById('tabs');
const pinnedTabsElem = document.getElementById('pinned-tabs');

// Add 'unpinned' event listener for all pinned tabs
const unpinnedEvent = new Event('unpinned');

pinnedTabsElem.childNodes.forEach((childEl) => {
  childEl.addEventListener('unpinned', () => {

  })
})

/** List all tabs to #tabs and #pinned-tabs HTML elements asynchronously */
let listAsync = new Promise((resolve) => {
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
    fadeForEachTab();
    resolve('Tabs are listed');
  });
});

browser.windows.getCurrent().then((window) => this.currentWindowId = window.id);

/**
 * Get tab info and make an HTMLAnchorElement from it.
 * @param {object} tab - tab to render
 * @returns undefined if tab is hidden, else HTMLAnchorElement
 */
const render = function getTabInfoAndMakeTabElFromIt(tab) {
  if (tab.hidden) return;
  let tabLink = document.createElement('a');
  let favIconUrl = tab.favIconUrl;
  switch (favIconUrl) {
    case '':
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
  let tabIcon, tabTitleContainer, tabTitle, discardIndic, audioIndic, audioAnnotation, cameraSharingIndic, microphoneSharingIndic, screenSharingIndic, readerModeIndic, closeBtn;
  tabIcon = tabTitleContainer = tabTitle = discardIndic = audioIndic = audioAnnotation = cameraSharingIndic = microphoneSharingIndic = screenSharingIndic = readerModeIndic = closeBtn = '';

  if (Config.showCloseBtn) {
    closeBtn = document.createElement('div');
    closeBtn.classList.add('tab__close');
    closeBtn.setAttribute('data-id', tab.id);
    closeBtn.setAttribute('aria-label', 'Close 1 tab');
    closeBtn.setAttribute('role', 'button');
    closeBtn.setAttribute('title', 'Close 1 tab');
    closeBtn.textContent = '⨉';
  }

  tabIcon = document.createElement('img');
  tabIcon.className = 'tab__icon';
  tabIcon.setAttribute('src', favIconUrl);

  tabTitleContainer = document.createElement('div');
  tabTitleContainer.classList.add('tab__title-container');
  tabTitle = document.createElement('div');
  tabTitle.className = 'tab__title';
  if (tab.attention) {
    tabTitle.setAttribute('title', `${browser.i18n.getMessage('tabRequiresAttention')}`);
    tabLink.classList.add('attention');
  }
  tabTitle.textContent = tab.title;
  tabTitleContainer.appendChild(tabTitle);

  if (tab.audible) {
    audioIndic = document.createElement('div');
    audioIndic.className = 'audio__indicator';
    // audioIndic.setAttribute('src', ''); // chrome://browser/skin/tabbrowser/tab-audio-playing-small.svg
    audioIndic.setAttribute('title', 'Mute 1 tab');
    // audioIndic.setAttribute('alt', ''); // 🔊

    audioAnnotation = document.createElement('div');
    audioAnnotation.className = 'audio__annotation';
    audioAnnotation.innerText = browser.i18n.getMessage('playing');

    tabLink.classList.add('audible');
  }
  if (tab.mutedInfo.muted) {
    audioIndic = document.createElement('img');
    audioIndic.className = 'audio__indicator';
    audioIndic.setAttribute('src', 'TODO');
    audioIndic.setAttribute('alt', '🔇');

    audioAnnotation = document.createElement('div');
    audioAnnotation.className = 'audio__annotation';
    audioAnnotation.innerText = browser.i18n.getMessage('muted');

    tabLink.classList.add('muted');
  }
  if (tab.discarded) {
    discardIndic = document.createElement('img');
    discardIndic.className = 'discard__indicator';
    discardIndic.setAttribute('src', 'TODO');
    discardIndic.setAttribute('alt', '⏸️');
    discardIndic.setAttribute('title', 'Refresh discarded tab');

    tabLink.classList.add('discarded');
  }
  if (tab.sharingState.camera) {
    cameraSharingIndic = document.createElement('img');
    cameraSharingIndic.className = 'tab__camera-sharing';
    cameraSharingIndic.setAttribute('aria-label', 'Currently using camera');
    cameraSharingIndic.setAttribute('src', 'TODO');
    cameraSharingIndic.setAttribute('alt', '📸');
    cameraSharingIndic.setAttribute('title', 'Currently using camera');

    tabLink.classList.add('sharing-camera');
  }
  if (tab.sharingState.microphone) {
    microphoneSharingIndic = document.createElement('img');
    microphoneSharingIndic.className = 'tab__microphone-sharing';
    microphoneSharingIndic.setAttribute('aria-label', 'Currently using microphone');
    microphoneSharingIndic.setAttribute('src', 'TODO');
    microphoneSharingIndic.setAttribute('alt', '🎤');
    microphoneSharingIndic.setAttribute('title', 'Currently using microphone');

    tabLink.classList.add('sharing-microphone');
  }
  if (tab.sharingState.screen) {
    screenSharingIndic = document.createElement('img');
    screenSharingIndic.className = 'tab__screen-sharing';
    screenSharingIndic.setAttribute('aria-label', 'Currently sharing your screen');
    screenSharingIndic.setAttribute('src', 'TODO');
    screenSharingIndic.setAttribute('alt', '🔴');
    screenSharingIndic.setAttribute('title', 'Currently sharing your screen');

    tabLink.classList.add('sharing-screen');
  }
  if (tab.isInReaderMode) {
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

  tabLink.append(tabIcon, discardIndic, audioIndic, tabTitleContainer, audioAnnotation, cameraSharingIndic, readerModeIndic, closeBtn);

  tabLink.setAttribute('data-id', tab.id);
  tabLink.setAttribute('data-index', tab.index);
  tabLink.setAttribute('data-window-id', tab.windowId);
  tabLink.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ', pinned' : ''}:`);
  tabLink.classList.add('tab__elem');

  return tabLink;
};
/**
 * Finds relative .tab__elem parent container if target is .tab__icon / .tab__title-container / .tab__title or returns oldTarget if it isn't.
 * @param {HTMLElement} oldTarget - Original clicked target
 * @returns parent / oldTarget
 */
const makeParentTheTarget = function getRelativeParentContainersOfSelectedTarget(oldTarget) {
  let newTarget = oldTarget;
  // If we click on .tab__icon or .tab__title, then make .tab__elem parent the target. Otherwise, you can't switch to another tab. 
  if (newTarget.classList.contains('tab__icon') || newTarget.classList.contains('tab__title-container'))
    newTarget = newTarget.parentNode; // should be .tab__elem

  if (newTarget.classList.contains('tab__title'))
    newTarget = newTarget.parentNode.parentNode;
  return newTarget;
}

// On left mouse click:
document.addEventListener('click', (e) => {
  let target = makeParentTheTarget(e.target);

  e.preventDefault();

  if (target.classList.contains('tab__close'))
    browser.tabs.remove(+target.getAttribute('data-id'));

  if (target.id === 'tabs-create')
    browser.tabs.create({});
});

// On mousedown:
document.addEventListener('mousedown', (e) => {
  let target = makeParentTheTarget(e.target);

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
    if (target.classList.contains('body'))
      browser.tabs.create({});
    else
      browser.tabs.remove(+target.getAttribute('data-id'));
    return false;
  }

  if (target.classList.contains('tab__elem')) {
    let tabId = +target.getAttribute('data-id');

    if (e.shiftKey) {
      // Select all tabs starting with currently active and ending with target tab.
      let currentlyHighlightedTabIndexes = [];
      let currentActiveTabIndex;
      browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        currentActiveTabIndex = tabs[0].index;
        currentlyHighlightedTabIndexes.push(tabs[0].index);
      });
      browser.tabs.get(tabId).then((tab) => {
        if (tab.index > currentActiveTabIndex)
          for (let i = currentActiveTabIndex + 1; i <= tab.index; i++)
            currentlyHighlightedTabIndexes.push(i);
        else
          for (let i = currentActiveTabIndex - 1; i >= tab.index; i--)
            currentlyHighlightedTabIndexes.push(i);
        browser.tabs.highlight({ tabs: currentlyHighlightedTabIndexes });
      });
    }
    else if (e.ctrlKey) {
      // Highlight just the target tab additively.
      let currentlyHighlightedTabIndexes = [];
      browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => currentlyHighlightedTabIndexes.push(tabs[0].index));
      browser.tabs.query({ currentWindow: true, highlighted: true })
        .then((tabs) => tabs.forEach((tab) => currentlyHighlightedTabIndexes.push(tab.index)));
      browser.tabs.get(tabId)
        .then((tab) => tab.highlighted ? currentlyHighlightedTabIndexes.delete(tab.index) : currentlyHighlightedTabIndexes.push(tab.index))
        .then(() => browser.tabs.highlight({ tabs: currentlyHighlightedTabIndexes }));
    }
    else {
      target.onmousedown = tabOnMouseDown;
      document.querySelector(`.tab__elem[data-id="${tabId}"]`).classList.add('active');
      browser.tabs.query({ currentWindow: true, highlighted: true, active: false })
        .then((tabs) => tabs.forEach((tab) => browser.tabs.update(tab.id, { highlighted: false })));
      browser.tabs.update(tabId, { active: true });
    }
  }
});

Array.prototype.delete = (object) => {
  let index = this.indexOf(object);
  if (index > -1)
    this.splice(index, 1);
};

const tabOnMouseDown = (e) => {
  e.preventDefault();
  // var tabElTopOffset=
  e.tabElTopOffset = e.clientY;
  e.target.onmousemove = tabDrag;
};

const tabDrag = (e) => {
  e.preventDefault();
  let target = makeParentTheTarget(e.target);

  if (e.buttons) {
    console.log(e);
    console.log(e.tabElTopOffset);
    target.classList.add('dragged');
    target.style.top = `${e.clientY}px`;
  }
  else {
    target.classList.remove('dragged');
    target.style.top = '0px';
  };
};

// const dragMouseDown=(e)=> {
//   e.target.onmousemove = mouseMoveOnTab;
// }

// const mouseMoveOnTab=(e)=> {
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

// const countToActive=()=> {
//   let count = 0;
//   for (let i = 0; i < pinnedTabsElem.childElementCount; i++, count++)
//     if (pinnedTabsElem.childNodes[i].classList.contains('active')) return count;

//   for (let i = 0; i < tabsElem.childElementCount; i++, count++)
//     if (tabsElem.childNodes[i].classList.contains('active')) return count;

// }

document.addEventListener('mouseover', (e) => {
  if (Config.scrollOnHover && e.target.classList.contains('tab__title')) {
    let tabTitle = e.target;
    let tabTitleContainer = e.target.parentNode;
    if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
      tabTitleContainer.classList.add('overflow');
    else tabTitleContainer.classList.remove('overflow');
  }
});

const addFade = function addOverflowFadeForTabEl(tabLink) {
  const tabTitleContainer = tabLink.children[1];
  const tabTitle = tabTitleContainer.firstChild;
  if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
    tabTitleContainer.classList.add('overflow');
  else tabTitleContainer.classList.remove('overflow');
};

const fadeForEachTab = function addOverflowFadeForEveryTabEl() {
  pinnedTabsElem.childNodes.forEach((tabLink) => addFade(tabLink));
  tabsElem.childNodes.forEach((tabLink) => addFade(tabLink));
};

document.addEventListener('resize', () => fadeForEachTab());

// Prevent context menu showing
document.addEventListener('contextmenu', e => { e.preventDefault() });

// Prevent zooming
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey)
    e.preventDefault();
}, { passive: false });

/**
 * Scrolls document to given HTML element.
 * @param {HTMLElement} el - element to scroll to
 */
const scrollToEl = (el) => {
  window.scrollTo({ left: 0, top: el.getBoundingClientRect().top, behavior: 'smooth' });
};

/**
 * Checks if element is in view.
 * @param {HTMLElement} el - element to check
 * @returns true if element is in viewport, else returns false
 */
const isElementInViewport = (el) => {
  const rect = el.getBoundingClientRect();

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
};

browser.tabs.onRemoved.addListener((tabId) => {
  let tabElem = document.querySelector(`.tab__elem[data-id="${tabId}"]`);
  if (tabElem) {
    tabElem.remove();
    resetIndexes();
  }
});

const onResize = function (tab) {
  place(tab);
  resetIndexes();
}

const onUpdate = function (tabId) {
  browser.tabs.get(tabId).then((tab) => {
    console.log(tab);
    callIfTabIsOnCurrentWindow(tab, () => {
      if (tab.pinned) {

      }
      document.querySelector(`.tab__elem[data-id="${tabId}"]`).replaceWith(render(tab));
      addFade(document.querySelector(`.tab__elem[data-id="${tabId}"]`));
    });
  });
}

const onHighlight = function (highlightInfo) {
  document.querySelectorAll('.tab__elem').forEach((tabElem) => tabElem.classList.remove('highlighted'));
  highlightInfo.tabIds.forEach((tabId) => {
    document.querySelector(`.tab__elem[data-id="${tabId}"]`).classList.add('highlighted');
  });
}

const onMove = function (tabId) {
  console.log('tab is moved:');
  console.log(tabId);
  // TODO: check if tab is pinned and act accordingly. Same goes for onUpdated.
  getNewTabIndexAndMove(tabId);
  resetIndexes();
}

const onActivate = function (tab) {
  let tabElem = document.querySelector(`.tab__elem[data-id="${tab.tabId}"]`);
  let prevTabElem = document.querySelector(`.tab__elem[data-id="${tab.previousTabId}"]`);
  if (tabElem)
    tabElem.classList.add('active');
  if (prevTabElem)
    prevTabElem.classList.remove('active');

}

browser.tabs.onCreated.addListener(onResize);

browser.tabs.onUpdated.addListener(onUpdate);

browser.tabs.onMoved.addListener(onMove);

browser.tabs.onActivated.addListener(onActivate);

browser.tabs.onHighlighted.addListener(onHighlight);

const getNewTabIndexAndMove = (tabId) => {
  browser.tabs.get(tabId).then((tab) => {
    let tabEl = document.querySelector(`.tab__elem[data-id="${tab.id}"]`);
    if (tabEl)
      tabEl.remove();
    const scope = (tab.pinned) ? pinnedTabsElem : tabsElem;
    tab.checkIfIsFirstUnpinnedTab();
    // let tabEl = render(tab);

    switch (true) {
      case tab.index === 0 || tab.isFirstUnpinnedTab:
        scope.prepend(tabEl);
        break;
      case (tab.index === pinnedTabsElem.childElementCount + tabsElem.childElementCount):
        scope.append(tabEl);
        break;
      default:
        scope.children[tab.index - pinnedTabsElem.childElementCount].before(tabEl);
        break;
    }
  });
};

HTMLElement.prototype.move = function removeThisElementAndPlaceItInANewSpot(newIndexInParent) {
  this.remove();
  this.parentElement.children[newIndexInParent - 1].after();
};

/**
 * Get scope to place tab in and determine whether the tab is first or not.
 * @param {object} tab - tab to render & place in tab list
 */
const place = function getScopeToPlaceTabInAndDetermineWhetherTabIsFirstOrNot(tab) {
  callIfTabIsOnCurrentWindow(tab, () => {
    const scope = (tab.pinned) ? pinnedTabsElem : tabsElem;
    if (tab.index === 0 || tab.index === pinnedTabsElem.childElementCount)
      scope.prepend(render(tab));
    else
      scope.querySelector(`.tab__elem[data-index="${tab.index - 1}"]`).after(render(tab));
  });
};

Object.prototype.checkIfIsFirstUnpinnedTab = () => {
  browser.tabs.query({ pinned: false })
    .then((tabs) => { this.isFirstUnpinnedTab = (tabs[0].id === this.id) ? true : false; });
};

/**
 * Call a function only if tab belongs to current window.
 * @param {object} tab - tab to check
 * @param {Function} callback - function to call
 */
const callIfTabIsOnCurrentWindow = (tab, callback) => {
  if (tab.windowId === this.currentWindowId)
    callback(tab);
};

/** Blindly reset indexes and a11y labels */
const resetIndexes = () => {
  const pinnedTabsCount = pinnedTabsElem.childElementCount;
  const unpinnedTabsCount = tabsElem.childElementCount;
  const tabsCount = pinnedTabsCount + unpinnedTabsCount;
  for (let i = 0; i < pinnedTabsCount; i++) {
    pinnedTabsElem.childNodes[i].setAttribute('data-index', i);
    pinnedTabsElem.childNodes[i].setAttribute('aria-label', `Tab ${i}, pinned:`);
  }
  for (let i = pinnedTabsCount, j = 0; i < tabsCount, j < unpinnedTabsCount; i++, j++) {
    tabsElem.childNodes[j].setAttribute('data-index', i);
    tabsElem.childNodes[j].setAttribute('aria-label', `Tab ${i}:`);
  }
};
