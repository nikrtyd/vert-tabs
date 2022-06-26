/**
 * List all tabs to #tabs and #tabs--pinned HTML elements asynchronously
 */
let listAsync = new Promise(function (resolve, reject) {
  // Get tabs in current window
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    let tabsList = document.querySelector('#tabs');
    let pinnedTabsList = document.querySelector('#tabs--pinned');
    let currentTabs = document.createDocumentFragment();
    let currentPinnedTabs = document.createDocumentFragment();

    tabsList.innerText = '';
    pinnedTabsList.innerText = '';

    for (let tab of tabs) {
      let tabLink = document.createElement('a');
      
      let favIconUrl = tab.favIconUrl;
      switch (favIconUrl) {
        case "":
          favIconUrl = "chrome://global/skin/icons/defaultFavicon.svg"
          break;
        case "chrome://mozapps/skin/extensions/extension.svg":
          favIconUrl = "/icons/firefox/extension.svg"
          break;
        default:
          break;
      }

      tabLink.innerHTML =
        '<img class="tab__icon" src="' + favIconUrl + '" alt="🌐" aria-hidden="true">' +
        '<span class="tab__title">' + tab.title + '</span>';
      if (tab.sharingState.camera) { tabLink.innerHTML += '<div class="tab__camera-sharing"></div>' }
      if (tab.sharingState.microphone) { tabLink.innerHTML += '<div class="tab__microphone-sharing></div>' }
      if (tab.sharingState.screen) { tabLink.innerHTML += '<div class="tab__screen-sharing></div>' }
      if (tab.isInReaderMode) { tabLink.innerHTML += '<div class="tab__reader-mode></div>' }
      tabLink.setAttribute('data-id', tab.id);
      tabLink.classList.add('tab__item');
      if (tab.active) { tabLink.classList.add('active'); }
      if (tab.audible) { tabLink.classList.add('audible'); }
      if (tab.mutedInfo.muted) { tabLink.classList.add('muted'); }

      tabLink.innerHTML += '<span class="tab__close" title="Close this tab (Ctrl+W)" data-id="' + tab.id + '" aria-label="Close this tab" role="button">⨉</span>';

      if (tab.pinned) { currentPinnedTabs.appendChild(tabLink); }
      else { currentTabs.appendChild(tabLink); }
    }

    pinnedTabsList.appendChild(currentPinnedTabs);
    tabsList.appendChild(currentTabs);
    resolve('result');
  });
}).then(console.log('tabs are listed -> promise fullfilled'), 'promise rejected');

document.addEventListener("DOMContentLoaded", listAsync);

/**
 * List all tabs to #tabs and #tabs--pinned HTML elements
 */
let listSync = function () {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    let tabsList = document.querySelector('#tabs');
    let pinnedTabsList = document.querySelector('#tabs--pinned');
    let currentTabs = document.createDocumentFragment();
    let currentPinnedTabs = document.createDocumentFragment();

    tabsList.innerText = '';
    pinnedTabsList.innerText = '';

    for (let tab of tabs) {
      let tabLink = document.createElement('a');
      let favIconUrl = tab.favIconUrl;
      switch (favIconUrl) {
        case "":
          favIconUrl = "chrome://global/skin/icons/defaultFavicon.svg"
          break;
        case "chrome://mozapps/skin/extensions/extension.svg":
          favIconUrl = "/icons/firefox/extension.svg"
          break;
        default:
          break;
      }
      tabLink.innerHTML =
        '<img class="tab__icon" src="' + favIconUrl + '" alt="🌐">' +
        '<span class="tab__title">' + tab.title + '</span>';
      if (tab.sharingState.camera) { tabLink.innerHTML += '<div class="tab__camera-sharing"></div>' }
      if (tab.sharingState.microphone) { tabLink.innerHTML += '<div class="tab__microphone-sharing></div>' }
      if (tab.sharingState.screen) { tabLink.innerHTML += '<div class="tab__screen-sharing></div>' }
      if (tab.isInReaderMode) { tabLink.innerHTML += '<div class="tab__reader-mode></div>' }
      tabLink.setAttribute('data-id', tab.id);
      tabLink.classList.add('tab__item');
      if (tab.discarded && !tabLink.classList.contains('discarded')) { tabLink.classList.add('discarded') }
      if (tab.active && !tabLink.classList.contains('active')) { tabLink.classList.add('active'); }
      if (tab.audible && !tabLink.classList.contains('audible')) { tabLink.classList.add('audible'); }
      if (tab.mutedInfo.muted && !tabLink.classList.contains('muted')) { tabLink.classList.add('muted'); }

      tabLink.innerHTML += '<span class="tab__close" data-id="' + tab.id + '">⨉</span>';
      if (tab.pinned) { currentPinnedTabs.appendChild(tabLink); }
      else { currentTabs.appendChild(tabLink); }
    }

    pinnedTabsList.appendChild(currentPinnedTabs);
    tabsList.appendChild(currentTabs);
  });
}

let discard = (id) => { browser.tabs.discard(id).then(onDiscarded, onError) };

let activate = (id) => { browser.tabs.update(id, { active: true }).then(onActivated, onError) };

function onDiscarded(id) {
  console.log(`Discarded tab: ${id}`);
}

function onActivated(id) {
  console.log(`Activated tab: ${id}`)
}

function onError(error) {
  console.error(`There is an error: ${error}`);
}

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
    browser.tabs.query({ currentWindow: true }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
  }

  if (target.classList.contains('tab__close')) {
    browser.tabs.remove(+target.getAttribute('data-id')).finally(listAsync);
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
    document.querySelectorAll('.active').forEach((el) => { el.classList.remove('active') });
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
            active: true
          }).then(
            document.querySelector(`.tab__item[data-id="${tabId}"]`).classList.add('active'));
        }
      }
    });
    listAsync;
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
  document.querySelector(`.tab__item[data-id="${tabId}"]`).remove().then(listAsync, onError);
  console.log(`removed a tab: ${tabId}`);
});

browser.tabs.onCreated.addListener((tabId) => {
  listAsync.then(() => {
    let newTab = document.querySelector(`.tab__item[data-id="${tabId.id}"]`);
    console.log(`created a tab: ${tabId.id}`);
    if (!isElementInViewport(newTab)) {
      scrollTo(newTab);
    }
  }, onError);
});
