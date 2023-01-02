import { URLS } from "./urls.js";

/* If `config` entry in `browser.storage.local` is empty,
   (for example on first extension load), then parse `default_config.json`
   in extension's root folder and apply these settings.
*/
if (browser.storage.local.get('config') === undefined) {
  fetch(`${URLS.ROOT}/default_config.json`)
    .then(req => req.text())
    .then(json => saveConfig(JSON.parse(json)));
}

/**
 * Writes `config` to `config` entry in extension's browser storage.
 * 
 * @param {Object} config The config to save.
 */
export const saveConfig = function writeConfigToBrowserStorage(config) {
  browser.storage.local.set(config);
}

/**
 * Gets `config` from extension's browser storage.
 * 
 * @returns {Object} Returns config to apply. 
 */
export const getConfig = function getConfigFromBrowserStorage() {
  return browser.storage.local.get('config');
}
