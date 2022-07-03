// If clicked on 'Show Vert Tabs panel on a sidebar', show it
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

class Config {
  static theme = 'Proton';
  static forceScheme = 'auto';
  static inlinePinnedTabs = false;
  static stickPinnedTabs = false;
  static tabHeight = 'compact';
  static textOverflow = 'fade';
  static scrollOnHover = false;
  static switchTabsOnCtrlWheel = false;
  static showCloseBtn = true;
  static compactSoundToggle = true;
  static stickNewTabBtn = false;
  static showTabTooltip = false;
  static showCloseBtnTooltip = true;
  static scrollbar = 'compact';
  static hideScrollBar = true;
  static scrollBarHideTimeout = 300;
}
