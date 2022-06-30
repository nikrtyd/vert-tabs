// TODO: config
// const config = JSON.parse("");

const tabsElem = document.getElementById('tabs');
const pinnedTabsElem = document.getElementById('tabs--pinned');

/** List all tabs to #tabs and #tabs--pinned HTML elements asynchronously */
let listAsync = new Promise(function (resolve, reject) {
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
    resolve('result');
  });
});

browser.windows.getCurrent().then((window) => { this.currentWindowId = window.id });

// document.addEventListener("DOMContentLoaded", listAsync);

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
      favIconUrl = window.location.origin + "/icons/firefox/proton/extension.svg";
      break;
    default:
      break;
  }
  tabLink.innerHTML =
    '<img class="tab__icon" src="' + favIconUrl + '" aria-hidden="true">' +
    '<span class="tab__title">' + tab.title + '</span>';
  if (tab.active) { tabLink.classList.add('active'); }
  if (tab.audible) { tabLink.classList.add('audible'); }
  if (tab.mutedInfo.muted) { tabLink.classList.add('muted'); }
  if (tab.sharingState.camera) { tabLink.innerHTML += '<div class="tab__camera-sharing"  aria-label="Currently using camera"></div>' }
  if (tab.sharingState.microphone) { tabLink.innerHTML += '<div class="tab__microphone-sharing" aria-label="Currently using microphone"></div>' }
  if (tab.sharingState.screen) { tabLink.innerHTML += '<div class="tab__screen-sharing" aria-label="Currently sharing your screen"></div>' }
  if (tab.isInReaderMode) { tabLink.innerHTML += '<div class="tab__reader-mode" aria-label="Opened in Reader mode"></div>' }
  if (tab.discarded) { tabLink.classList.add('discarded') }
  if (tab.attention) { tabLink.classList.add('attention') }
  tabLink.setAttribute('data-id', tab.id);
  tabLink.setAttribute('data-index', tab.index);
  tabLink.setAttribute('data-window-id', tab.windowId);
  tabLink.setAttribute('aria-label', `Tab ${tab.index}${(tab.pinned) ? ", pinned" : ""}:`);
  tabLink.classList.add('tab__item');

  tabLink.innerHTML += '<span class="tab__close" data-id="' + tab.id + '" aria-label="Close tab" role="button">⨉</span>';
  return tabLink;
}

// On left mouse click:
document.addEventListener("click", (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab-item parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
    target = target.parentNode; // should be .tab-item
  }

  e.preventDefault();

  if (target.classList.contains('tab__close')) {
    browser.tabs.remove(+target.getAttribute('data-id'));
  }

  if (target.id === "tabs-create") {
    browser.tabs.create({});
  }
});

// On middle mouse click:
document.addEventListener('mousedown', (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .tab-item parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
    target = target.parentNode; // should be .tab-item
  }

  if (e.button === 1) {
    e.preventDefault();
    browser.tabs.remove(+target.getAttribute('data-id'));
    return false;
  }

  console.log(target);
  if (target.classList.contains('tab__item')) {
    let tabId = +target.getAttribute('data-id');
    document.querySelector(`.tab__item[data-id="${tabId}"]`).classList.add('active');
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
document.addEventListener("contextmenu", event => event.preventDefault())

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
  console.log(`removing tab: ${tabId}`);
  let tabElem = document.querySelector(`.tab__item[data-id="${tabId}"]`);
  if (tabElem) {
    tabElem.remove();
    console.log(`removed a tab: ${tabId}`);
    resetIndexes();
  }
});

browser.tabs.onCreated.addListener((tab) => {
  place(tab);
  resetIndexes();
});

browser.tabs.onUpdated.addListener((tabId) => {
  console.log(`updating tab: ${tabId}`);
  browser.tabs.get(tabId).then((tab) => {
    document.querySelector(`.tab__item[data-id="${tabId}"]`).replaceWith(render(tab));
  });
});

browser.tabs.onActivated.addListener((tab) => {
  // callIfTabIsOnCurrentWindow(tab, () => {
  let tabElem = document.querySelector(`.tab__item[data-id="${tab.tabId}"]`);
  let prevTabElem = document.querySelector(`.tab__item[data-id="${tab.previousTabId}"]`);
  if (tabElem)
    tabElem.classList.add('active');
  if (prevTabElem)
    prevTabElem.classList.remove('active');
  // });
});

function place(tab) {
  callIfTabIsOnCurrentWindow(tab, () => {
    // console.log((new Date()) + ': Trying to place a tab, tab info:');
    // console.log(tab);
    if (tab.index === 0) {
      document.querySelector(`.tab__item[data-index="${tab.index + 1}"]`).before(render(tab));
      return;
    }
    document.querySelector(`.tab__item[data-index="${tab.index - 1}"]`).after(render(tab));
  });
}

function callIfTabIsOnCurrentWindow(tab, callback) {
  if (tab.windowId === this.currentWindowId) {
    callback(tab);
  }
  // TODO: REMOVE, FOR DEBUGGING PURPOSES
  else console.log(`${(new Date())}: Tried to place tab of window ID: ${tab.windowId} in a window of ID: ${this.currentWindowId}. Aborted.`);
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

// function slist (target) {
//   // (A) SET CSS + GET ALL LIST ITEMS
//   target.classList.add("slist");
//   let items = target.getElementsByTagName("li"), current = null;

//   // (B) MAKE ITEMS DRAGGABLE + SORTABLE
//   for (let i of items) {
//     // (B1) ATTACH DRAGGABLE
//     i.draggable = true;
    
//     // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
//     i.ondragstart = (ev) => {
//       current = i;
//       for (let it of items) {
//         if (it != current) { it.classList.add("hint"); }
//       }
//     };
    
//     // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
//     i.ondragenter = (ev) => {
//       if (i != current) { i.classList.add("active"); }
//     };

//     // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
//     i.ondragleave = () => {
//       i.classList.remove("active");
//     };

//     // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
//     i.ondragend = () => { for (let it of items) {
//         it.classList.remove("hint");
//         it.classList.remove("active");
//     }};
 
//     // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
//     i.ondragover = (evt) => { evt.preventDefault(); };
 
//     // (B7) ON DROP - DO SOMETHING
//     i.ondrop = (evt) => {
//       evt.preventDefault();
//       if (i != current) {
//         let currentpos = 0, droppedpos = 0;
//         for (let it=0; it<items.length; it++) {
//           if (current == items[it]) { currentpos = it; }
//           if (i == items[it]) { droppedpos = it; }
//         }
//         if (currentpos < droppedpos) {
//           i.parentNode.insertBefore(current, i.nextSibling);
//         } else {
//           i.parentNode.insertBefore(current, i);
//         }
//       }
//     };
//   }
// }
