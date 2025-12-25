// ==UserScript==
// @name			Spyglass :: Throbber
// @description 	Throbber Behavior
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

var NavigatorThrobber = {
    get busy() {
        return gBrowser.selectedTab.hasAttribute("busy");
    },

    init() {
        document.addEventListener("TabAttrModified", this._update, false);
        document.addEventListener("TabSelect", this._update, false);
        document.addEventListener("TabOpen", this._update, false);
        document.addEventListener("TabClose", this._update, false);
        document.addEventListener("load", this._update, false);

        return document;
    },

    _update() {
        let busy = gBrowser.selectedTab.hasAttribute("busy");
        let throbber = document.querySelector("#navigator-throbber");

        if (busy) 
        {
            throbber.setAttribute("busy", "true");
            throbber.querySelector(".toolbarbutton-icon").setAttribute("busy", "true");
        }
        else {
            throbber.removeAttribute("busy");
            throbber.querySelector(".toolbarbutton-icon").removeAttribute("busy");
        }
    },
}