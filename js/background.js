// If clicked on 'Show Vert Tabs panel on a sidebar', show it
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});
