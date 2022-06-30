// class Tabs {
//   constructor(windowId) {
//     this.windowId = windowId;
//     this.list = await browser.tabs.query({ windowId: windowId });
//   }
//   get list() {
//     return this.list;
//   }
//   update(tab) {
//     // If an ID is passed, get a tab object with given ID.
//     if (typeof tab === "number")
//       tab = browser.tabs.get(tab);
//     this.list[tab.index] = tab;
//   }
// }

// If clicked on 'Show Vert Tabs panel on a sidebar', show it
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

class Config {
  static theme = "Proton";
  static 
}

// browser.windows.onCreated.addListener((window) => {
//   console.log('created a window!');
//   console.log(window);
//   this[`tabs${window.id}`] = new Tabs(window.id);
// })

// browser.windows.onRemoved.addListener((windowId) => {
//   console.log('removed a window!');
//   console.log(windowId);
//   this[`tabs${windowId}`] = null;
// })


// debug
// const EventTargetPrototype = document.__proto__.__proto__.__proto__.__proto__;
// const origAddEventListener = EventTargetPrototype.addEventListener;
// EventTargetPrototype.addEventListener = function addEventListenerWrapper(type, listener) {
//     if (typeof listener !== 'function') throw new Error('bad listener for ' + type);
//     return origAddEventListener.apply(this, arguments);
// };
