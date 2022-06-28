class Tabs {
  constructor(windowId) {
    this.windowId = windowId;
    this.list = await browser.tabs.query({ currentWindow: true });
  }
  get list() {
    return this.list;
  }
  update(tab) {
    // If an ID is passed, get a tab object with given ID.
    if (typeof tab === "number")
      tab = browser.tabs.get(tab);
    this.list[tab.index] = tab;
  }
}
