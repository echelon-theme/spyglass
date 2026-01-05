// ==UserScript==
// @name			Spyglass :: Context Menu
// @description 	Changes to the content area context menu
// @author			aubymori
// @github          https://github.com/aubymori
// @include			main
// ==/UserScript===

{
    var { waitForElement } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    /* Add labels to navigation items so they can look exactly like normal items again */

    function onContextNavMutation(list)
    {
        for (const mut of list)
        {
            if ((mut.type == "attributes"
            || mut.type == "childList")
            && mut.target.nodeName == "menuitem")
            {
                for (const item of mut.target.parentNode.children)
                {
                    if (item.label != item.getAttribute("aria-label"))
                    {
                        item.label = item.getAttribute("aria-label");
                    }
                }
            }
        }
    }

    waitForElement("#context-navigation").then(e => {
        let observer = new MutationObserver(onContextNavMutation);
        observer.observe(
            e,
            {
                attributes: true,
                attributeFilter: ["aria-label", "disabled", "label"],
                childList: true,
                subtree: true
            }
        );
        for (const item of e.children)
        {
            item.label = item.getAttribute("aria-label");
        }
    });
}