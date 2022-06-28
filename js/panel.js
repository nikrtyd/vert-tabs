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
      let tabLink = render(tab);
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
      let tabLink = render(tab);
      if (tab.pinned) { currentPinnedTabs.appendChild(tabLink); }
      else { currentTabs.appendChild(tabLink); }
    }
  });
}

function render(tab) {
  let tabLink = document.createElement('a');
  let favIconUrl = tab.favIconUrl;
  switch (favIconUrl) {
    case "":
    case undefined:
    case null:
    case []:
    case {}:
      favIconUrl = "chrome://global/skin/icons/defaultFavicon.svg";
      break;
    case "chrome://mozapps/skin/extensions/extension.svg":
      favIconUrl = window.location.origin + "/icons/firefox/extension.svg";
      break;
    default:
      break;
  }
  tabLink.innerHTML =
    '<img class="tab__icon" src="' + favIconUrl + '" aria-hidden="true">' +
    '<span class="tab__title">' + tab.title + '</span>';
  if (tab.active && !tabLink.classList.contains('active')) { tabLink.classList.add('active'); }
  if (tab.audible && !tabLink.classList.contains('audible')) { tabLink.classList.add('audible'); }
  if (tab.mutedInfo.muted && !tabLink.classList.contains('muted')) { tabLink.classList.add('muted'); }
  if (tab.sharingState.camera) { tabLink.innerHTML += '<div class="tab__camera-sharing"  aria-label="Currently using camera"></div>' }
  if (tab.sharingState.microphone) { tabLink.innerHTML += '<div class="tab__microphone-sharing" aria-label="Currently using microphone"></div>' }
  if (tab.sharingState.screen) { tabLink.innerHTML += '<div class="tab__screen-sharing" aria-label="Currently sharing your screen"></div>' }
  if (tab.isInReaderMode) { tabLink.innerHTML += '<div class="tab__reader-mode" aria-label="Opened in Reader mode"></div>' }
  if (tab.discarded && !tabLink.classList.contains('discarded')) { tabLink.classList.add('discarded') }
  if (tab.attention && !tabLink.classList.contains('attention')) { tabLink.classList.add('attention') }
  tabLink.setAttribute('data-id', tab.id);
  tabLink.setAttribute('data-index', tab.index);
  tabLink.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ", pinned" : ""}:`);
  tabLink.classList.add('tab__item');

  tabLink.innerHTML += '<span class="tab__close" data-id="' + tab.id + '" aria-label="Close tab" role="button">⨉</span>';
  return tabLink;
}

let discard = (id) => { browser.tabs.discard(id).then(onDiscarded, onError) };

let remove = (id) => { browser.tabs.remove(id).then(onRemoved(id), onError) };

function onDiscarded(id) {
  console.log(`Discarded tab: ${id}`);
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

  // TODO: REMOVE
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
    browser.tabs.remove(+target.getAttribute('data-id'));
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
    document.querySelector(`.tab__item[data-id="${tabId}"]`).classList.add('active');
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          // browser.tabs.update(tabId, {
          //   active: true
          // }).then(
          //   document.querySelectorAll(`.active:not([data-id="${tabId}"])`).forEach((el) => { el.classList.remove('active') }));
          browser.tabs.update(tabId, { active: true });
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
  if (document.querySelector(`.tab__item[data-id="${tabId}"]`)) {
    let xs = document.querySelector(`.tab__item[data-id="${tabId}"]`);
    xs.remove().then(listAsync, onError);
    console.log(`removed a tab: ${tabId}`);
  }
});

browser.tabs.onCreated.addListener((tab) => {
  place(tab);
});

browser.tabs.onUpdated.addListener((tabId) => {
  browser.tabs.get(tabId).then((tab) => {
    let elem = document.querySelector(`.tab__item[data-id="${tabId}"]`);
    if (elem) { elem.remove() }
    place(tab);
  });
});

browser.tabs.onActivated.addListener((tab) => {
  document.querySelector(`.tab__item[data-id="${tab.tabId}"]`).classList.add('active');
  document.querySelector(`.tab__item[data-id="${tab.previousTabId}"]`).classList.remove('active');
})

function place(tab) {
  console.log((new Date()) + ': Trying to place a tab, tab info:');
  console.log(tab);
  if (tab.index == 0) {
    document.querySelector(`.tab__item[data-index="${tab.index + 1}"]`).before(render(tab));
    return;
  }
  document.querySelector(`.tab__item[data-index="${tab.index - 1}"]`).after(render(tab));
}
