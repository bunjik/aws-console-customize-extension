
const agent = window.navigator.userAgent.toLowerCase();
const SETTING_KEY = 'awsconsole';

function getStorage() {
  if (agent.indexOf("chrome") != -1) {
    // chrome extension
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(SETTING_KEY, (ruleList) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(ruleList);
        }
      })
    });
  } else {
    // other browser
    return browser.storage.sync.get(SETTING_KEY);
  }
}

function setStorage(val) {
  var data = {};
  data[SETTING_KEY] = val;
  if (agent.indexOf("chrome") != -1) {
    // chrome extension
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } else {
    // other browser
    return browser.storage.sync.set(data);
  }
}

