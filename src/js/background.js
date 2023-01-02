// Toggle visibility on `Show/hide Verts panel on a sidebar` click.
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

// Custom context menu
// browser.menus.remove(); - maybe we don't need this now.
