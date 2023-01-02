import { element } from "./element.js";
import { SIDEBAR_DOM } from "./consts.js";

/**
 * Used as a template for constructing (or rendering) tab element
 * to place into {@linkcode SIDEBAR_DOM}'s TAB_LIST.
 * 
 * @class TabElementTemplate
 */
export class TabElementTemplate {
  classes = [];
  contents = {
    root: element('div', {
      'class': 'tab'
    }),
    favIcon: element('img', {
      'class': 'tab-favicon',
      'alt': '🌐'
    }),
    tabTitleContainer: element('div', {
      'class': 'tab-title-container'
    }),
    tabTitle: element('div', {
      'class': 'tab-title'
    }),
    buttons: {
      pin: element('div', {
        'class': 'tab-pin',
        'role': 'button',
        'aria-label': `${browser.i18n.getMessage('pin')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`,
        'title': `${browser.i18n.getMessage('pin')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`
      }),
      reload: element('div', {
        'class': 'tab-reload',
        'role': 'button',
        'aria-label': `${browser.i18n.getMessage('reload')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`,
        'title': `${browser.i18n.getMessage('reload')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`
      }),
      back: element('div', {
        'class': 'tab-back',
        'role': 'button',
        'aria-label': browser.i18n.getMessage('goBackOnePage'),
        'title': browser.i18n.getMessage('goBackOnePage')
      }),
      forward: element('div', {
        'class': 'tab-forward',
        'role': 'button',
        'aria-button': browser.i18n.getMessage('goForwardOnePage'),
        'title': browser.i18n.getMessage('goForwardOnePage')
      }),
      close: element('div', {
        'class': 'tab-close',
        'role': 'button',
        'aria-label': `${browser.i18n.getMessage('close')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`,
        'title': `${browser.i18n.getMessage('close')} 1 ${browser.i18n.getMessage('langSpecificSingularTab')}`
      }),
    },
    indicators: {
      audio: element('div', {
        'class': 'audio-indicator',
        'aria-label': browser.i18n.getMessage('muteTab'),
        'title': browser.i18n.getMessage('muteTab'),
        'src': '',
        'alt': '🔊'
      }),
      discard: element('div', {
        'class': 'discard-indicator',
        'aria-label': browser.i18n.getMessage('refreshDiscardedTab'),
        'title': browser.i18n.getMessage('refreshDiscardedTab'),
        'src': '',
        'alt': '♻'
      }),
      sharing: {
        camera: element('img', {
          'class': 'camera-sharing-indicator',
          'aria-label': browser.i18n.getMessage('refreshDiscardedTab'),
          'title': browser.i18n.getMessage('refreshDiscardedTab'),
          'src': '',
          'alt': '📸',
        }),
        microphone: element('img', {
          'class': 'microphone-sharing-indicator',
          'aria-label': browser.i18n.getMessage('currentlyUsingMicrophone'),
          'title': browser.i18n.getMessage('currentlyUsingMicrophone'),
          'src': '',
          'alt': '🎤',
        }),
        screen: element('img', {
          'class': 'screen-sharing-indicator',
          'aria-label': browser.i18n.getMessage('currentlySharingScreen'),
          'title': browser.i18n.getMessage('currentlySharingScreen'),
          'src': '',
          'alt': '🔴',
        })
      },
      readerMode: element('img', {
        'class': 'reader-mode-indicator',
        'aria-label': browser.i18n.getMessage('inReaderMode'),
        'title': browser.i18n.getMessage('inReaderMode'),
        'src': '',
        'alt': '📖',
      })
    },
    annotations: {
      audio: element('div', {
        'class': 'audio-annotation',
        'aria-label': browser.i18n.getMessage('playing')
      })
    }
  };

  constructor() {
    this.contents.tabTitleContainer.appendChild(this.contents.tabTitle);
  };
}
