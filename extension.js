/**
 * AWS Console Customize Extension
 * Created by fumiharu kinoshita
 */
const agent = window.navigator.userAgent.toLowerCase();
const SETTING_KEY = "awsconsole";

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
      });
    });
  } else {
    // other browser
    return browser.storage.sync.get(SETTING_KEY);
  }
}

function applyRule(rule) {
  // header
  waitForElementToExist("header > nav").then(elem => {
    $("header > nav").css("background-color", rule.color);
    $(".globalNav-0366 > a").css("background-color", rule.color);
  });

  // footer
  waitForElementToExist("#console-nav-footer-inner").then(elem => {
    $("#console-nav-footer-inner").css("background-color", rule.color);
  });

  // label
  if (rule.showLabel && rule.label != null && rule.label.length > 0) {
    $("body").prepend('<span id="ruleLabel">' + rule.label + "</span>");
  }
}


function findAccount() {
  // Need to wait for element to be rendered to account for possible racing condition
  // that would prevent header from showing.
  waitForElementToExist("meta[name='awsc-session-data']").then(elem => {
    session_data = JSON.parse(elem.content)
    const name = decodeURI(session_data.displayName)
    const account = session_data.accountId
    const accountAlias = session_data.accountAlias
    const region = session_data.infrastructureRegion;

    // load setting.
    getStorage().then(ruleList => {
      ruleList[SETTING_KEY].some(rule => { 
        var re = new RegExp(rule.user);
        if (rule.enableRule && (re.test(name) || re.test(account) || re.test(accountAlias))) {
          if (region == rule.region || "all-region" == rule.region) {
            // apply rule.
            applyRule(rule);
            return true;
          }
        }
      });
    }, 
    err => {
      console.error(err);
    });
  });
}


function waitForElementToExist(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

// main function
$(function () {
  // show/hide label
  $("#consoleNavHeader").hover(
    () => $("#ruleLabel").css("visibility", "hidden"),
    () => $("#ruleLabel").css("visibility", "")
  );

  // check accont.
  findAccount();
});
