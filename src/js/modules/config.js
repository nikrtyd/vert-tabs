import { ROOT_URL } from "./consts.js";

// Parse config from config.json file.
let config;
let configUrl = `${ROOT_URL}/config.json`;

fetch(configUrl)
  .then(req => req.text())
  .then(json => config = JSON.parse(json));

export const CONFIG = config;
