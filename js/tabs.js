class Tabs {
  constructor(windowId) {
    this.windowId = windowId;
    browser.tabs.query({ windowId: windowId }).then((list) => this.list = list);
  }
  update(tab) {
    // If an ID is passed, get a tab object with given ID.
    if (typeof tab === "number")
      browser.tabs.get(tab).then((tabObj) => tab = tabObj);
    this.list[tab.index] = tab;
  }
}
