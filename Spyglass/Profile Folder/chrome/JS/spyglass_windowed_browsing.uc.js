// ==UserScript==
// @name			 Spyglass :: Windowed Browsing
// @description      Remove the top selling point of Firefox in 2004
// @author			 travy-patty
// @github           https://github.com/travy-patty
// @include			 main
// ==/UserScript==

var g_WindowedBrowsing;

{
    var { PrefCalls } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");

    const SPYGLASS_TABS_DISABLED_PREF = "spyglass.tabs.disabled";
    const BROWSER_OPEN_NEWWINDOW_PREF = "browser.link.open_newwindow";
    const BROWSER_OPEN_TAB_ON_MIDDLE_PREF = "browser.tabs.opentabfor.middleclick";
    const MIDDLECLICK_OPEN_NEW_WINDOW_PREF = "middlemouse.openNewWindow";

    class WindowedBrowsing
    {
        get cmd_newNavigatorTab() {
            let cmd_newNavigatorTab = document.getElementById("cmd_newNavigatorTab");

            Object.defineProperty(this, "cmd_newNavigatorTab", {
                value: cmd_newNavigatorTab,
                writable: false
            });

            return cmd_newNavigatorTab;
        }
    
        get cmd_newNavigatorTabNoEvent() {
            let cmd_newNavigatorTabNoEvent = document.getElementById("cmd_newNavigatorTabNoEvent");

            Object.defineProperty(this, "cmd_newNavigatorTabNoEvent", {
                value: cmd_newNavigatorTabNoEvent,
                writable: false
            });
            
            return cmd_newNavigatorTabNoEvent;
        }

        get cmd_newNavigatorTab_original_command() {
            return "BrowserOpenTab({ event });";
        }

        get cmd_newNavigatorTabNoEvent_original_command() {
            return "BrowserOpenTab();";
        }
        
        _disable() {
            PrefCalls.lockPref(BROWSER_OPEN_NEWWINDOW_PREF, 2);
            PrefCalls.lockPref(BROWSER_OPEN_TAB_ON_MIDDLE_PREF, false);
            PrefCalls.lockPref(MIDDLECLICK_OPEN_NEW_WINDOW_PREF, true);

            this.cmd_newNavigatorTab.setAttribute("oncommand", "OpenBrowserWindow()");
            this.cmd_newNavigatorTabNoEvent.setAttribute("oncommand", "OpenBrowserWindow()");

            /*
            * Remove all tabs except current because... fuck you? LOL!
            */
            gBrowser.removeAllTabsBut(gBrowser.selectedTab, {skipWarnAboutClosingTabs: true});
        }

        _enable() {            
            if (PrefCalls.getPref(BROWSER_OPEN_NEWWINDOW_PREF) == 2) {
                PrefCalls.setPref(BROWSER_OPEN_NEWWINDOW_PREF, 3, false);
            }
            
            if (!PrefCalls.getPref(BROWSER_OPEN_TAB_ON_MIDDLE_PREF)) {
                PrefCalls.setPref(BROWSER_OPEN_TAB_ON_MIDDLE_PREF, true);
            }

            if (PrefCalls.getPref(MIDDLECLICK_OPEN_NEW_WINDOW_PREF)) {
                PrefCalls.setPref(MIDDLECLICK_OPEN_NEW_WINDOW_PREF, false);
            }

            PrefCalls.unlockPref(BROWSER_OPEN_NEWWINDOW_PREF);
            PrefCalls.unlockPref(BROWSER_OPEN_TAB_ON_MIDDLE_PREF);
            PrefCalls.unlockPref(MIDDLECLICK_OPEN_NEW_WINDOW_PREF);

            this.cmd_newNavigatorTab.setAttribute("oncommand", this.cmd_newNavigatorTab_original_command);
            this.cmd_newNavigatorTabNoEvent.setAttribute("oncommand", this.cmd_newNavigatorTabNoEvent_original_command);
        }

        init() {
            Services.prefs.addObserver(SPYGLASS_TABS_DISABLED_PREF, this.toggle.bind(this));

            this.toggle();
        }

        toggle() {
            let openTrustedLinkInWhere = PrefCalls.getPref(SPYGLASS_TABS_DISABLED_PREF) ? "window" : "tab";

            if (PrefCalls.getPref(SPYGLASS_TABS_DISABLED_PREF)) {
                this._disable();
            }
            else {
                this._enable();
            }

            /*
            *   Override some functions involving tabs
            */
            window.openNewUserContextTab = function openNewUserContextTab(event) {
                openTrustedLinkIn(BROWSER_NEW_TAB_URL, openTrustedLinkInWhere, {
                    userContextId: parseInt(event.target.getAttribute("data-usercontextid")),
                });
            }
        }
    }

    g_WindowedBrowsing = new WindowedBrowsing;

    UC_API.Windows.waitWindowLoading(window).then(win => {
        try {
            g_WindowedBrowsing.init();
        } 
        catch (e) {
            throw e;
        }
    });
}