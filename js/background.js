// If clicked on 'Show Vert Tabs panel on a sidebar', show it
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

// browser.windows.onCreated.addListener((window) => {
//   this[`tabs${window.id}`] = new Tabs(window.id);
// })

// browser.windows.onRemoved.addListener((windowId) => {
//   this[`tabs${windowId}`] = null;
// })  
