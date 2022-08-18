// If clicked on 'Show Vert Tabs panel on a sidebar', show it
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

// Custom context menu
// browser.menus.remove(); - maybe we don't need this now.
