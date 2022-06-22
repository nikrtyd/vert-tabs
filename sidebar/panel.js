function firstUnpinnedTab(tabs) {
  for (let tab of tabs) {
    if (!tab.pinned) {
      return tab.index;
    }
  }
}

/**
 * listTabs to switch to
 */
function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    let tabsList = document.getElementById('tabs-list');
    let currentTabs = document.createDocumentFragment();
    let counter = 0;

    tabsList.textContent = '';

    for (let tab of tabs) {
      let tabLink = document.createElement('a');

      // let tabIcon = document.createElement('img');
      // tabIcon.setAttribute('src', tab.favIconUrl);
      // tabLink.appendChild(tabIcon);

      tabLink.innerHTML = '<img class="tab__icon" src="' + tab.favIconUrl + '" alt="🌎"></img>';
      tabLink.innerHTML += '<span class="tab__title">' + tab.title || tab.id + '</span>';
      tabLink.setAttribute('href', tab.id);
      tabLink.classList.add('switch-tab');
      // if (tab.highlighted) {
      //   tabLink.classList.add('highlighted');
      // }
      currentTabs.appendChild(tabLink);

      counter += 1;
    }

    tabsList.appendChild(currentTabs);
  });
}

document.addEventListener("DOMContentLoaded", listTabs);

function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

// On left mouse click:
document.addEventListener("click", (e) => {
  let target = e.target;

  // If we click on .tab__icon or .tab__title, then make .switch-tab parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
    target = target.parentNode;
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

  callOnActiveTab((tab) => {
    switch (target.id) {
      case "tabs-reload":
        browser.tabs.reload(tab.id);
        break;
      case "tabs-duplicate":
        browser.tabs.duplicate(tab.id);
        break;
      case "tabs-remove":
        browser.tabs.remove(tab.id);
        break;
      case "tabs-alertinfo":
        let props = "";
        for (let item in tab) {
          props += `${item} = ${tab[item]} \n`;
        }
        alert(props);
        break;

      default:
        break;
    }
  });

  if (target.id === "tabs-create") {
    browser.tabs.create({});
  }

  if (target.id === "tabs__open-debug") {
    browser.tabs.create({ url: "about:debugging#/runtime/this-firefox" });
  }

  if (target.classList.contains('switch-tab')) {
    let tabId = +target.getAttribute('href');
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
            active: true
          });
        }
      }
    });
  }

  listTabs();
});

// On middle mouse click:
document.addEventListener('auxclick', (e) => {
  let target = e.target;
  e.preventDefault();

  // If we click on .tab__icon or .tab__title, then make .switch-tab parent the target. Otherwise, you can't switch to another tab. 
  if (target.classList.contains('tab__icon') || target.classList.contains('tab__title')) {
    target = target.parentNode;
  }

  // Remove the tab with some ID. It's located in HREF attribute. `+` is to parse int from id string.
  browser.tabs.remove(+target.getAttribute('href'));
});

document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, true);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key == 'w') {
    console.log('ctrl+w is pressed');
    listTabs();
  }
})

//onRemoved listener. fired when tab is removed
browser.tabs.onRemoved.addListener((tabId) => {
  console.log(`The tab with id: ${tabId}, is closing`);
  setTimeout(() => {
    listTabs();
  }, 150);
});

//onMoved listener. fired when tab is moved into the same window
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  let startIndex = moveInfo.fromIndex;
  let endIndex = moveInfo.toIndex;
  console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
  listTabs();
});

browser.tabs.onCreated.addListener(listTabs);
browser.tabs.onAttached.addListener(listTabs);
browser.tabs.onDetached.addListener(listTabs);
browser.tabs.onUpdated.addListener(listTabs);
browser.tabs.onReplaced.addListener(listTabs);
