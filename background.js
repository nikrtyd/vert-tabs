function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
    .then((tabs) => {
      let length = tabs.length;

      // onRemoved fires too early and the count is one too many.
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
      if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
        length--;
      }

      browser.browserAction.setBadgeText({ text: length.toString() });
      if (length > 2) {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'green' });
      } else {
        browser.browserAction.setBadgeBackgroundColor({ 'color': 'red' });
      }
    });
}

// If clicked on 'Show Vert Tabs panel on a sidebar'
browser.browserAction.onClicked.addListener(() => {
  alert('clicked!');
  if (browser.sidebarAction.isOpen()) {
    browser.sidebarAction.close();
  }
  else {
    browser.sidebarAction.open();
  }
});

browser.tabs.onRemoved.addListener(
  (tabId) => {
    updateCount(tabId, true);
  });
browser.tabs.onCreated.addListener(
  (tabId) => {
    updateCount(tabId, false);
  });
updateCount();
