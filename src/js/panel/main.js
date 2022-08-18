// TODO: config
// const config = JSON.parse('');

const tabsElem = document.getElementById('tabs');
const pinnedTabsElem = document.getElementById('pinned-tabs');

// Add 'unpinned' event listener for all pinned tabs
const unpinnedEvent = new Event('unpinned');

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

// This ghost is shown when the 
// TODO: figure out how to make it render in a sidebar
// for
const dndGhost = document.createElement('div');
dndGhost.appendChild(document.createElement('img'));
const dndGhostImg = dndGhost.children[0];
dndGhost.id = 'drag-ghost';
document.body.appendChild(dndGhost);


function onDocumentMouseMove(e) {
  // Show drag ghost only with left mouse button down.
  if (e.buttons !== 1) {
    removePseudoDragGhost();
    return;
  }
  dndGhost.style.top = `${e.clientY}px`;
  dndGhost.style.left = `${e.clientX}px`;
  console.log('document mousemove');
  console.log(e);
}

function onTabElemMouseEnter(e) {
  console.log('tabElem mouse enter');
}

function removePseudoDragGhost() {
  dndGhost.style = '';
  document.removeEventListener('mousemove', onDocumentMouseMove);
}

async function ontabElemMouseDown(e) {
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);

  console.log('tabElem mouseDown');

  // let target = makeParentTheTarget(e.target);
  // dndGhostImg.src = target.dataset.thumbnail;

  let target = makeParentTheTarget(e.target);

  const tabId = +target.getAttribute('data-id');
  const tab = await browser.tabs.get(tabId);
  dndGhostImg.src = await browser.tabs.captureTab(tabId, { rect: { x: 0, y: 0, width: tab.width, height: tab.height } });

  dndGhostImg.onload = function (e) {
    console.log('%c%s', 'color: green; font-weight: 700; font-size: 18px;', `image loaded!`);
    removePseudoDragGhost();

    const dragstart = new DragEvent('dragstart', { 'dataTransfer': new DataTransfer() });
    console.log(e);
    target.setAttribute('draggable', 'true');
    document.ondragstart = onDocumentDragStart;
    document.ondragend = onDocumentDragEnd;
    document.dispatchEvent(dragstart);
  }
}

function onDocumentMouseUp(e) {
  const target = makeParentTheTarget(e.target);
  console.log(`document mouse up`);
  console.log(e);
  target.removeAttribute('draggable');
  const dragend = new DragEvent('dragend', { 'dataTransfer': new DataTransfer() });
  e.target.dispatchEvent(dragend);
  document.removeEventListener('mouseup', onDocumentMouseUp);
}

function onDocumentDragStart(e) {
  console.info(`Drag start`);
  console.info(e);
  e.dataTransfer.setDragImage(dndGhost, 0, 0);
}

function onDocumentDragEnd(e) {
  console.log('document dragEnd');
}

function onDocumentDragOver(e) {
  console.log('document dragOver');
}

function onDocumentDragLeave(e) {
  console.log('tabElem dragLeave');
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

    // TODO: HERE
    if (target.classList.contains(''))

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
        .then((tab) => tab.highlighted ? currentlyHighlightedTabIndexes.remove(tab.index) : currentlyHighlightedTabIndexes.push(tab.index))
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


// Array.prototype.delete = (object) => {
//   let index = this.indexOf(object);
//   if (index > -1)
//     this.splice(index, 1);
// };

document.addEventListener('mouseover', (e) => {
  if (config.scrollOnHover && e.target.classList.contains('tab-title')) {
    let tabTitle = e.target;
    let tabTitleContainer = e.target.parentNode;
    if (tabTitle.getBoundingClientRect().width > tabTitleContainer.getBoundingClientRect().width)
      tabTitleContainer.classList.add('overflow');
    else tabTitleContainer.classList.remove('overflow');
  }
});

const addFade = function addOverflowFadeForTabEl(tabElem) {
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
