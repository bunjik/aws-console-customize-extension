/**
 * AWS Console Customize Extension
 * Created by fumiharu kinoshita
 */
$(function() {
    // get username & region

    var nameElm = $("#nav-usernameMenu span:first span:first");
    //var nameElm = $(".ThRjn7o-KwO0459UzmvoU.w8Kxy2XztOAkWobGpdJLt span:first");
    if (nameElm.length == 0) {
        // old layout
        nameElm = $("#nav-usernameMenu");
    }
    var name = nameElm.text();
    //console.log(name);

    var regions = location.search.match(/region=(.*?)(&|$)/);
    var region = "";
    if (regions != null && regions.length > 1) {
        region = regions[1];
    }

    // show/hide label
    $('#consoleNavHeader').hover( 
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
                    // for old layout
                    $('#nav-menubar').css('background-color', rule.color);
                    $('.nav-menu').css('background-color', rule.color);
                    $('#nav-menu-right').css('background-color', rule.color);
                    $('#console-nav-footer').css('background-color', rule.color);

                    // for new layout
                    //$('._2RLslneV9dNkchEUSPfzwC').css('background-color', rule.color);
                    $('#awsc-nav-header').css('background-color', rule.color);
                    $('#console-nav-footer-inner').css('background-color', rule.color);

                    if (rule.showLabel && rule.label != null && rule.label.length > 0) {
                        $('body').prepend('<span id="ruleLabel">' + rule.label + '</span>');
                    }
                    return true;
                }
            }
        });
    });
});
