/**
 * AWS Console Customize Extension
 * Created by fumiharu kinoshita
 */
$(function() {
    // get username & region
    var name = $("#nav-usernameMenu").text();
    //var region = location.search.match(/region=(.*?)(&|$)/)[1];
    var regions = location.search.match(/region=(.*?)(&|$)/);
    var region = "";
    if (regions != null && regions.length > 1) {
        region = regions[1];
    }

    // show/hide label
    $('#consoleNavHeader').hover(
    //$('.nav-elt').hover(
            () => $('#ruleLabel').css('visibility', 'hidden'),
            () => $('#ruleLabel').css('visibility', '')
    );

    // load setting.
    chrome.storage.sync.get(['awsconsole'], function(ruleList) {
        ruleList.awsconsole.some(rule => { 
            var re = new RegExp(rule.user);
            if (rule.enableRule && re.test(name)) {
                if (region == rule.region || "all-region" == rule.region) {
                    // apply rule.
                    //console.log("matched. ", rule);
                    $('#nav-menubar').css('background-color', rule.color);
                    $('.nav-menu').css('background-color', rule.color);
                    $('#nav-menu-right').css('background-color', rule.color);
                    $('#console-nav-footer').css('background-color', rule.color);

                    if (rule.showLabel && rule.label != null && rule.label.length > 0) {
                        $('body').prepend('<span id="ruleLabel">' + rule.label + '</span>');
                    }
                    return true;
                }
            }
        });
    });
});
