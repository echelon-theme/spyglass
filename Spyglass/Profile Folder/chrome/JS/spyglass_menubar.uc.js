// ==UserScript==
// @name           Spyglass :: Menu Bar
// @description    poop
// @author	       travy-patty
// @github         https://github.com/aubymori
// @github         https://github.com/travy-patty
// ==/UserScript==

var g_WindowMenu;

{
    var { LocaleUtils, waitForElement } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://spyglass/locale/properties/menus.properties";

    waitForElement("#bookmarksMenu").then((menu) => {
        menu.setAttribute("label", LocaleUtils.str(menusBundle, "bookmarks_menu.label"));
        menu.setAttribute("accesskey", LocaleUtils.str(menusBundle, "bookmarks_menu.accesskey"));
        menu.removeAttribute("data-l10n-id");
    });
}