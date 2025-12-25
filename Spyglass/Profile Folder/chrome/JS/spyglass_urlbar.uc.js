// ==UserScript==
// @name			Spyglass :: URLbar
// @description 	Several modifications to the URlBar
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

{
    var { waitForElement, LocaleUtils } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    waitForElement("#urlbar").then(e => {
        let dropmarker = window.MozXULElement.parseXULToFragment(`
            <dropmarker id="historydropmarker" class="autocomplete-history-dropmarker urlbar-history-dropmarker"/>
        `);

        let urlbarInputContainer = e.querySelector(".urlbar-input-container");
        if (!urlbarInputContainer) { // fallback for older versions of firefox
            urlbarInputContainer = e.querySelector("#urlbar-input-container");
        }

        urlbarInputContainer.appendChild(dropmarker);

        e.querySelector(".urlbar-history-dropmarker").addEventListener("mousedown", openURLView);
        
        function openURLView() {
            // Related Firefox code involving opening the URLbar Dropdown seems to use
            // Private Properties, so this will do for now.
            gURLBar._inputContainer.click();
            gURLBar.searchMode = {
                source: UrlbarUtils.RESULT_SOURCE.BOOKMARKS,
                entry: "shortcut",
            };
            gURLBar.search(gURLBar.value);
            gURLBar.select();
        }

        // im chopped

        let identityBox = gIdentityHandler._identityBox;
        urlbarInputContainer.insertBefore(identityBox, urlbarInputContainer.lastChild);

        // favicon

        let pageProxyDeck = window.MozXULElement.parseXULToFragment(`
            <deck id="page-proxy-deck">
                <html:img decoding="sync" id="page-proxy-favicon" />
            </deck>
        `);

        urlbarInputContainer.insertBefore(pageProxyDeck, urlbarInputContainer.firstChild);
    });

    function updateIcon()
    {
        try
        {
            let pageProxyIcon = document.querySelector("#page-proxy-favicon");
            let favicon = gBrowser.selectedTab.iconImage.src;

            pageProxyIcon.setAttribute("src", favicon);

            if (!favicon || favicon == null)
            {
                pageProxyIcon.removeAttribute("src");
            }
        }
        catch (e) {}
    }

    document.addEventListener("TabAttrModified", updateIcon, false);
    document.addEventListener("TabSelect", updateIcon, false);
    document.addEventListener("TabOpen", updateIcon, false);
    document.addEventListener("TabClose", updateIcon, false);
    document.addEventListener("load", updateIcon, false);
}