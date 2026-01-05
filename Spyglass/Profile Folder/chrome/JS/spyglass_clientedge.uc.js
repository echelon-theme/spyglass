// ==UserScript==
// @name			Spyglass :: TEST
// @description 	test 
// @author			test
// @include			main
// ==/UserScript===


function isgoyslopornah() {
    let browser = gBrowser.selectedBrowser;

    browser.messageManager.loadFrameScript("data:application/javascript," +
        encodeURIComponent(`
            (function() {
                let root = content.document.documentElement;

                let hasInlineBorder = 
                    root.style.border || 
                    root.style.borderWidth || 
                    root.style.borderStyle;

                let style = content.getComputedStyle(root);
                let hasComputedBorder =
                    (style.borderWidth && style.borderWidth !== "0px") &&
                    (style.borderStyle && style.borderStyle !== "none");

                let hasBorder = false;
                for (let sheet of content.document.styleSheets) {
                    try {
                        let rules = sheet.cssRules;

                        if (!rules)
                            continue

                        for (let rule of rules) {
                            if (!rule.selectorText)
                                continue;

                            if (root.matches(rule.SelectorText)) {
                                if (rule.style.border || rule.style.borderWidth || rule.style.borderStyle) {
                                    hasBorder = true;
                                    break;
                                };
                            }
                        }
                    }
                    catch(e) {
                        throw e;
                    }  
                    if (hasBorder) {
                        break;
                    }
                }

                let hasBorderStyle = hasInlineBorder || hasComputedBorder || hasBorder;

                sendAsyncMessage("check-border-style", { hasBorderStyle });
            })();
        `),
        false
    );

    function messageListener(aMessage) {
        console.log(aMessage.data.hasBorderStyle);
        browser.messageManager.removeMessageListener("check-border-style", messageListener);
    }
    browser.messageManager.addMessageListener("check-border-style", messageListener);
}
