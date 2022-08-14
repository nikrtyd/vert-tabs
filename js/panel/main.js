// TODO: config
// const config = JSON.parse('');

const tabsElem = document.getElementById('tabs');
const pinnedTabsElem = document.getElementById('pinned-tabs');

// Add 'unpinned' event listener for all pinned tabs
const unpinnedEvent = new Event('unpinned');

// pinnedTabsElem.childNodes.forEach((childEl) => {
//   childEl.addEventListener('unpinned', () => {

//   })
// })

/** List all tabs to #tabs and #pinned-tabs HTML elements asynchronously */
let listAsync = new Promise((resolve) => {
  // Get tabs in current window
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    let currentTabs = document.createDocumentFragment();
    let currentPinnedTabs = document.createDocumentFragment();

    tabsElem.innerText = '';
    pinnedTabsElem.innerText = '';

    for (let tab of tabs) {
      let tabElem = render(tab);
      if (tab.pinned) { currentPinnedTabs.appendChild(tabElem); }
      else { currentTabs.appendChild(tabElem); }
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

  if (Config.allowTabDrag) {
    tabElem.setAttribute('draggable', 'true');
    tabElem.addEventListener('mouseenter', onTabElemMouseEnter);
    tabElem.addEventListener('mousedown', ontabElemMouseDown);
  }

  tabElem.append(tabIcon, discardIndic, audioIndic, tabTitleContainer, audioAnnotation, cameraSharingIndic, readerModeIndic, closeBtn);

  tabElem.setAttribute('data-id', tab.id);
  tabElem.setAttribute('data-index', tab.index);
  tabElem.setAttribute('data-window-id', tab.windowId);
  tabElem.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ', pinned' : ''}:`);
  tabElem.classList.add('tab-elem');

  return tabElem;
};

const dndGhost = document.createElement('div');
dndGhost.appendChild(document.createElement('img'));
const dndGhostImg = dndGhost.children[0];
dndGhost.id = 'drag-ghost';
document.body.appendChild(dndGhost);

if (Config.allowTabDrag) {
  document.addEventListener('dragstart', ontabElemDragStart);
  document.addEventListener('dragover', ontabElemDragOver);
  document.addEventListener('dragleave', ontabElemDragLeave);
  document.addEventListener('dragend', ontabElemDragEnd);
}

if (Config.showDragThumbs) {
  const tempCanvas = document.createElement('canvas');
  const tempCanvasCtx = tempCanvas.getContext('2d');
  document.body.appendChild(tempCanvas);

  pinnedTabsElem.childNodes.forEach(tabElem => {
    getThumbnail(tabElem).then(resizedImage => tabElem.setAttribute('data-thumbnail', resizedImage));
  });
  tabsElem.childNodes.forEach(tabElem => {
    getThumbnail(tabElem).then(resizedImage => tabElem.setAttribute('data-thumbnail', resizedImage));
  });
}

async function getThumbnail(tabElem) {
  const tabId = +tabElem.getAttribute('data-id');
  const tab = await browser.tabs.get(tabId);
  const src = await browser.tabs.captureTab(tabId, { rect: { x: 0, y: 0, width: tab.width, height: tab.height } });
  tempCanvasCtx.drawImage(src, 0, 0, 160, 90);
  return tempCanvas.toDataURL();
}


async function onTabElemMouseEnter(e) {
  console.log('tabElem mouse enter');
}

async function ontabElemMouseDown(e) {
  console.log('tabElem mouseDown');

  let target = makeParentTheTarget(e.target);
  dndGhostImg.src = target.dataset.thumbnail;

  // let target = makeParentTheTarget(e.target);
  // const tabId = +target.getAttribute('data-id');
  // const tab = await browser.tabs.get(tabId);
  // dndGhostImg.src = await browser.tabs.captureTab(tabId, { rect: { x: 0, y: 0, width: tab.width, height: tab.height } });

  // TODO: Update DnD image if platform is Windows or macOS & figure out what to do on Linux.
  // e.dataTransfer.updateDragImage(dndGhost, 0, 0);

}

function ontabElemDragStart(e) {
  e.dataTransfer.setDragImage(dndGhost, 0, 0);
}

async function ontabElemDragEnd(e) {
  console.log('tabElem dragEnd');
}

function ontabElemDragOver(e) {
  console.log('tabElem dragOver');
}

function ontabElemDragLeave(e) {
  console.log('tabElem dragLeave');
  // TODO: Create a window on dragleave (?) with all tabs stored in event data. 
}

function ontabElemDrop(e) {
  console.log('tabElem drop');
  e.preventDefault();
  // Get the data, which is the id of the drop target
  const data = e.dataTransfer.getData('text');
  e.target.appendChild(document.getElementById(data));
  browser.windows.create({ tabId });
}

/**
 * Finds relative .tab-elem parent container if target is .tab-icon / .tab-title-container / .tab-title or returns oldTarget if it isn't.
 * @param {HTMLElement} oldTarget - Original clicked target
 * @returns parent / oldTarget
 */
const makeParentTheTarget = function getRelativeParentContainersOfSelectedTarget(oldTarget) {
  let newTarget = oldTarget;
  // If we click on .tab-icon or .tab-title, then make .tab-elem parent the target. Otherwise, you can't switch to another tab. 
  if (newTarget.classList.contains('tab-icon') || newTarget.classList.contains('tab-title-container'))
    newTarget = newTarget.parentNode; // should be .tab-elem

  if (newTarget.classList.contains('tab-title'))
    newTarget = newTarget.parentNode.parentNode;
  return newTarget;
}

// On left mouse click:
document.addEventListener('click', (e) => {
  let target = makeParentTheTarget(e.target);

  e.preventDefault();

  if (target.classList.contains('tab-close'))
    browser.tabs.remove(+target.getAttribute('data-id'));

  if (target.id === 'tabs-create')
    browser.tabs.create({});
});

// On mousedown:
document.addEventListener('mousedown', (e) => {
  let target = makeParentTheTarget(e.target);

  if (target.classList.contains('discard-indicator')) {
    let tabId = +target.parentNode.getAttribute('data-id');
    // Unfortunately, we cannot directly update 'discarded' property at the moment. So to undiscard the tab, we're setting URL anew.
    browser.tabs.get(tabId).then((tab) => browser.tabs.update(tabId, { url: tab.url }));
  }

  if (target.classList.contains('audio-indicator')) {
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

  if (target.classList.contains('tab-elem')) {
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
      document.querySelector(`.tab-elem[data-id="${tabId}"]`).classList.add('active');
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

document.addEventListener('mouseover', (e) => {
  if (Config.scrollOnHover && e.target.classList.contains('tab-title')) {
    let tabTitle = e.target;
    let tabTitleContainer = e.target.parentNode;
    if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
      tabTitleContainer.classList.add('overflow');
    else tabTitleContainer.classList.remove('overflow');
  }
});

const addFade = function addOverflowFadeForTabEl(tabElem) {
  // .tab-title-container is usually placed at index 3 of parent tab-link
  const tabTitleContainer = tabElem.children[3];
  const tabTitle = tabTitleContainer.firstChild;
  if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
    tabTitleContainer.classList.add('overflow');
  else tabTitleContainer.classList.remove('overflow');
};

const fadeForEachTab = function addOverflowFadeForEveryTabEl() {
  pinnedTabsElem.childNodes.forEach(addFade);
  tabsElem.childNodes.forEach(addFade);
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

browser.tabs.onRemoved.addListener(tabId => {
  let tabElem = document.querySelector(`.tab-elem[data-id="${tabId}"]`);
  if (tabElem) {
    tabElem.remove();
    resetIndexes();
  }
});

const onCreated = function placeTabAndResetIndexes(tab) {
  place(tab);
  resetIndexes();
}

const onUpdated = function rerenderTabAndAddFadeToIt(tabId) {
  browser.tabs.get(tabId).then((tab) => {
    console.log(tab);
    callIfTabIsOnCurrentWindow(tab, () => {
      if (tab.pinned) {

      }
      document.querySelector(`.tab-elem[data-id="${tabId}"]`).replaceWith(render(tab));
      addFade(document.querySelector(`.tab-elem[data-id="${tabId}"]`));
    });
  });
}

const onHighlighted = function addHighlightedHtmlClassForEachHighlightedTab(highlightInfo) {
  document.querySelectorAll('.tab-elem').forEach((tabElem) => tabElem.classList.remove('highlighted'));
  highlightInfo.tabIds.forEach((tabId) => {
    document.querySelector(`.tab-elem[data-id="${tabId}"]`).classList.add('highlighted');
  });
}

const onMoved = function getNewTabIndexAndMoveTabThenResetIndexes(tabId) {
  console.log('tab is moved:');
  console.log(tabId);
  // TODO: check if tab is pinned and act accordingly. Same goes for onUpdated.
  moveTabById(tabId);
  resetIndexes();
}

const onActivated = function (tab) {
  let tabElem = document.querySelector(`.tab-elem[data-id="${tab.tabId}"]`);
  let prevTabElem = document.querySelector(`.tab-elem[data-id="${tab.previousTabId}"]`);
  if (tabElem)
    tabElem.classList.add('active');
  if (prevTabElem)
    prevTabElem.classList.remove('active');

}

browser.tabs.onCreated.addListener(onCreated);

browser.tabs.onUpdated.addListener(onUpdated);

browser.tabs.onMoved.addListener(onMoved);

browser.tabs.onActivated.addListener(onActivated);

browser.tabs.onHighlighted.addListener(onHighlighted);

/**
 * If tabToCheck's ID equals first unpinned tab's ID then return true, else return false.
 * @param {object} tabToCheck - Tab object from browser.tabs.query | browser.tabs.get
 * @returns Promise of boolean type
 */
const firstUnpinnedCheck = async function checkIfThisIsFirstUnpinnedTab(tabToCheck) {
  let tabs = await browser.tabs.query({ pinned: false });
  return (tabs[0].id === tabToCheck.id) ? true : false;
};

const moveTabById = async function getNewTabIndexFromIdAndMoveAccordingly(tabId) {
  browser.tabs.get(tabId).then(tab => {
    let tabEl = document.querySelector(`.tab-elem[data-id="${tab.id}"]`);
    if (tabEl) { tabEl.remove(); }
    const scope = (tab.pinned) ? pinnedTabsElem : tabsElem;
    let tabIsFirstUnpinned;
    firstUnpinnedCheck(tab).then(val => tabIsFirstUnpinned = val);
    switch (true) {
      case tab.index === 0 || tabIsFirstUnpinned:
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
 * @param {object} tab - Tab to render & place in tab list
 */
const place = function getScopeToPlaceTabInAndDetermineWhetherTabIsFirstOrNot(tab) {
  callIfTabIsOnCurrentWindow(tab, () => {
    const scope = (tab.pinned) ? pinnedTabsElem : tabsElem;
    if (tab.index === 0 || tab.index === pinnedTabsElem.childElementCount)
      scope.prepend(render(tab));
    else
      scope.querySelector(`.tab-elem[data-index="${tab.index - 1}"]`).after(render(tab));
  });
};

/**
 * Call a function only if tab belongs to current window.
 * @param {object} tab - Tab to check
 * @param {Function} callback - Function to call
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
