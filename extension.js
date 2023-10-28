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
  $("header > nav").css("background-color", rule.color);
  $(".globalNav-0366 > a").css("background-color", rule.color);

  // footer
  $("#console-nav-footer-inner").css("background-color", rule.color);

  // label
  if (rule.showLabel && rule.label != null && rule.label.length > 0) {
    $("body").prepend('<span id="ruleLabel">' + rule.label + "</span>");
  }
}


function findAccount() {
  // Need to wait for element to be rendered to account for possible racing condition
  // that would prevent header from showing.
  var p1 = waitForElementToExist("span[data-testid='awsc-nav-account-menu-button'] span:first-child");
  var p2 = waitForElementToExist("div[data-testid='account-detail-menu'] span:nth-child(2)");
  Promise.all([p1, p2]).then(elements => {
    const name = elements[0].innerText;
    const account = elements[1].innerText.replaceAll('-', '');
    const regions = location.search.match(/region=(.*?)(&|$)/);
    const region = (regions != null && regions.length > 1) ? regions[1] : "";
    //console.log(name, account, region);

    // load setting.
    getStorage().then(ruleList => {
      ruleList[SETTING_KEY].some(rule => { 
        var re = new RegExp(rule.user);
        if (rule.enableRule && (re.test(name) || re.test(acct))) {
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
