document.addEventListener("DOMContentLoaded", listTabs);

function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

let tabs = getCurrentWindowTabs();

function firstUnpinnedTab(tabs) {
  for (let tab of tabs) {
    if (!tab.pinned) {
      return tab.index;
    }
  }
}

// On left mouse click:
document.addEventListener("click", (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab-item parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
    target = target.parentNode; // should be .tab-item
  }

  e.preventDefault();

  function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
      for (let tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
  }

  if (target.id === "tabs-move-beginning") {
    callOnActiveTab((tab, tabs) => {
      let index = 0;
      if (!tab.pinned) {
        index = firstUnpinnedTab(tabs);
      }
      console.log(`moving ${tab.id} to ${index}`)
      browser.tabs.move([tab.id], { index });
    });
  }

  if (target.id === "tabs-move-end") {
    callOnActiveTab((tab, tabs) => {
      let index = -1;
      if (tab.pinned) {
        let lastPinnedTab = Math.max(0, firstUnpinnedTab(tabs) - 1);
        index = lastPinnedTab;
      }
      browser.tabs.move([tab.id], { index });
    });
  }

  if (target.id === "tabs-remove") {
    callOnActiveTab((tab) => {
      browser.tabs.remove(tab.id);
    });
  }

  if (target.id === "tabs-create") {
    browser.tabs.create({});
  }

  if (target.classList.contains('tab__item')) {
    let tabId = +target.getAttribute('data-id');
    document.querySelectorAll('.highlighted').forEach((el) => { el.classList.remove('highlighted') });
    // browser.tabs.update(tabId, { active: true });
    // document.querySelector(`.tab__item[data-id="${tabId}"]`).classList.add('highlighted');
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
            active: true
          });
          document.querySelector(`.tab__item[data-id="${tabId}"]`).classList.add('highlighted');
        }
      }
    });
  }
});

// On middle mouse click:
document.addEventListener('mousedown', (e) => {
  if (e.button == 1) {
    let target = e.target;
    // If we click on.tab__icon or.tab__title, then make.tab - item parent the target.Otherwise, you can't switch to another tab. 
    if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
      target = target.parentNode; // should be .tab-item
    }
    e.preventDefault();
    browser.tabs.remove(+target.getAttribute('data-id'));
    return false;
  }
});

// Prevent zooming
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });


function scrollTo(el) {
  window.scrollTo({ left: 0, top: el.getBoundingClientRect().top, behavior: "smooth" });
}

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();

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
  document.querySelector(`.tab__item[data-id="${tabId}"]`).remove();
});
browser.tabs.onCreated.addListener((tabId) => {
  listTabs();
  let newTab = document.querySelector(`.tab__item[data-id="${tabId}"]`);
  if (!isElementInViewport(newTab)) {
    scrollTo(newTab);
  }
});
browser.tabs.onAttached.addListener(listTabs);
browser.tabs.onDetached.addListener(listTabs);
browser.tabs.onUpdated.addListener(listTabs);
browser.tabs.onReplaced.addListener(listTabs);


/**
 * List all tabs to #tabs and #tabs--pinned HTML elements
 */
function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    let tabsList = document.getElementById('tabs');
    let pinnedTabsList = document.getElementById('tabs--pinned');
    let currentTabs = document.createDocumentFragment();
    let currentPinnedTabs = document.createDocumentFragment();

    tabsList.textContent = '';
    pinnedTabsList.textContent = '';

    for (let tab of tabs) {
      let tabLink = document.createElement('a');
      if (tab.favIconUrl == "") { };
      tabLink.innerHTML =
        '<img class="tab__icon" src="' + tab.favIconUrl + '" alt="🌐">' +
        '<span class="tab__title">' + tab.title + '</span>';
      if (tab.sharingState.camera) { tabLink.innerHTML += '<div class="tab__camera-sharing"></div>' }
      if (tab.sharingState.microphone) { tabLink.innerHTML += '<div class="tab__microphone-sharing></div>' }
      if (tab.sharingState.screen) { tabLink.innerHTML += '<div class="tab__screen-sharing></div>' }
      if (tab.isInReaderMode) { tabLink.innerHTML += '<div class="tab__reader-mode></div>' }
      tabLink.setAttribute('data-id', tab.id);
      tabLink.classList.add('tab__item');
      if (tab.highlighted) { tabLink.classList.add('highlighted'); }
      if (tab.audible) { tabLink.classList.add('audible'); }
      if (tab.mutedInfo.muted) { tabLink.classList.add('muted'); }

      tabLink.innerHTML += '<span class="tab__close" data-id="' + tab.id + '">⨉</span>';

      if (tab.pinned) { currentPinnedTabs.appendChild(tabLink); }
      else { currentTabs.appendChild(tabLink); }
    }

    pinnedTabsList.appendChild(currentPinnedTabs);
    tabsList.appendChild(currentTabs);
  });
}
