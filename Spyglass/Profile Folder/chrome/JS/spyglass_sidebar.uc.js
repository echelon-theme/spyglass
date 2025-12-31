// ==UserScript==
// @name			Spyglass :: Sidebar
// @description 	shit for sidebar
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// @include         chrome://browser/content/places/bookmarksSidebar.xhtml
// @include         chrome://browser/content/places/historySidebar.xhtml
// ==/UserScript==

var g_spyglassSidebar;

{
    var { LocaleUtils, waitForElement, setAttributes } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let sidebarBundle = "chrome://spyglass/locale/properties/sidebar.properties";

    const BOOKMARKS_SIDEBAR_URL = "chrome://browser/content/places/bookmarksSidebar.xhtml";
    const HISTORY_SIDEBAR_URL = "chrome://browser/content/places/historySidebar.xhtml";

    class SpyglassSidebarLayout {
        get _isContextBookmarksSidebar() {
            return document.URL == BOOKMARKS_SIDEBAR_URL;
        }

        get _isContextHistorySidebar() {
            return document.URL == HISTORY_SIDEBAR_URL;
        }

        get _isContextBrowser() {
            return document.URL.endsWith("browser.xhtml");
        }
        
        get _mediaSidebarParams() {
            return {
                id: "spyglass-media",
                title: LocaleUtils.str(sidebarBundle, "media_panel.label"),
                url: "chrome://userchrome/content/windows/aboutDialog/aboutDialog.xhtml",
                menuId: "menu_mediaSidebar",
                buttonId: "sidebar-switcher-media"
            }
        }

        async init() {
            if (this._isContextBookmarksSidebar) {
                this._createBookmarksLayout();
            }

            if (this._isContextHistorySidebar) {
                this._createHistoryLayout();
            }

            if (this._isContextBrowser) {
                await new Promise(resolve => {
                    let delayedStartupObserver = (aSubject, aTopic, aData) => {
                        Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                        resolve();
                    };
                    Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                });

                this._createMenuItem(this._mediaSidebarParams);
            }
        }

        _createHistoryLayout() {
            let historyToolbarFragment = `
                <hbox id="bookmarks-history-toolbar" class="sidebar-panel-options" align="center">
                    <toolbarbutton id="view-button" class="toolbarbutton-1" label="${LocaleUtils.str(sidebarBundle, "history_panel_view_button.label")}" type="menu">
                        <menupopup>
                            <menuitem id="bydayandsite" data-l10n-id="places-by-day-and-site" type="radio" oncommand="this.parentNode.parentNode.setAttribute('selectedsort', 'dayandsite'); GroupBy('dayandsite');"/>
                            <menuitem id="bysite" data-l10n-id="places-by-site" type="radio" oncommand="this.parentNode.parentNode.setAttribute('selectedsort', 'site'); GroupBy('site');"/>
                            <menuitem id="byday" data-l10n-id="places-by-date" type="radio" oncommand="this.parentNode.parentNode.setAttribute('selectedsort', 'day'); GroupBy('day');"/>
                            <menuitem id="byvisited" data-l10n-id="places-by-most-visited" type="radio" oncommand="this.parentNode.parentNode.setAttribute('selectedsort', 'visited'); GroupBy('visited');"/>
                            <menuitem id="bylastvisited" data-l10n-id="places-by-last-visited" type="radio" oncommand="this.parentNode.parentNode.setAttribute('selectedsort', 'lastvisited'); GroupBy('lastvisited');"/>
                        </menupopup>
                    </toolbarbutton>
                    <toolbarbutton id="search-button" class="toolbarbutton-1" label="${LocaleUtils.str(sidebarBundle, "history_panel_search_button.label")}" />
                </hbox>
            `;

            let historySearchLabelElem = document.createXULElement("label");

            let historySearchLabelElemAttrs = {
                "id": "history-search-bar-label",
                "value": LocaleUtils.str(sidebarBundle, "history_panel_search_panel.label"),
                "accesskey": LocaleUtils.str(sidebarBundle, "history_panel_search_panel.accesskey"),
            }

            setAttributes.set(historySearchLabelElem, historySearchLabelElemAttrs);
            document.querySelector("#sidebar-search-container").insertBefore(historySearchLabelElem, document.querySelector("#sidebar-search-container").firstChild);

            let historySearchButtonsFragment = `
                <hbox class="search-box-button-container">
                    <button id="search-now" label="${LocaleUtils.str(sidebarBundle, "history_panel_search_panel_search.label")}" default="true" disabled="true" />
                    <button id="stop-search-button" label="${LocaleUtils.str(sidebarBundle, "history_panel_search_panel_stop.label")}" disabled="true" />
                </hbox>
            `;

            document.querySelector("#sidebar-search-container").appendChild(MozXULElement.parseXULToFragment(historySearchButtonsFragment));

            document.documentElement.insertBefore(MozXULElement.parseXULToFragment(historyToolbarFragment), document.documentElement.firstChild);

            document.querySelector("#search-box").removeAttribute("placeholder");
        }

        _createBookmarksLayout() {
            let bookmarksToolbarFragment = `
                <hbox id="bookmarks-spyglass-toolbar" class="sidebar-panel-options" align="center">
                    <toolbarbutton id="add-button" class="toolbarbutton-1" label="${LocaleUtils.str(sidebarBundle, "bookmarks_panel_add_button.label")}" oncommand="parent.PlacesCommandHook.bookmarkPage();" />
                    <toolbarbutton id="organize-button" class="toolbarbutton-1" label="${LocaleUtils.str(sidebarBundle, "bookmarks_panel_organize_button.label")}" oncommand="parent.PlacesCommandHook.showPlacesOrganizer('UnfiledBookmarks');" />
                </hbox>
            `;

            document.documentElement.insertBefore(MozXULElement.parseXULToFragment(bookmarksToolbarFragment), document.documentElement.firstChild);
        }

        _createMenuItem(menu) {
            let keyId = `ext-key-id-${menu.id}`;

            SidebarUI.sidebars.set(menu.id, {
                title: menu.title,
                url: menu.url,
                menuId: menu.menuId,
                buttonId: menu.buttonId,
            });

            // @TODO: TRAVY-PATTY USE SETATTRIBUTES

            /*
            *   Insert a menuitem for View -> Show Sidebars.
            */
            let menuitem = document.createXULElement("menuitem");
            menuitem.setAttribute("id", menu.menuId);
            menuitem.setAttribute("type", "checkbox");
            menuitem.setAttribute("label", menu.title);
            menuitem.setAttribute("oncommand", `SidebarUI.toggle("${menu.id}");`);
            menuitem.setAttribute("class", "menuitem-iconic");
            menuitem.setAttribute("key", menu.id);

            document.getElementById("viewSidebarMenu").appendChild(menuitem);
                    
            /*
            *   Insert a toolbarbutton for the sidebar dropdown selector.
            */
            let toolbarbutton = document.createXULElement("toolbarbutton");
            toolbarbutton.setAttribute("id", menu.buttonId);
            toolbarbutton.setAttribute("label", menu.title);
            toolbarbutton.setAttribute("oncommand", `SidebarUI.show("${menu.id}");`);
            toolbarbutton.setAttribute("class", "subviewbutton");
            toolbarbutton.setAttribute("key", keyId);

            document.getElementById("viewSidebarMenu").appendChild(menuitem);
            let separator = document.getElementById("sidebar-extensions-separator");
            separator.parentNode.insertBefore(toolbarbutton, separator);
            SidebarUI.updateShortcut({ button: toolbarbutton });
    
            return menuitem;
        }
    }

    g_spyglassSidebar = new SpyglassSidebarLayout;

    document.addEventListener("DOMContentLoaded", g_spyglassSidebar.init(), false);
}