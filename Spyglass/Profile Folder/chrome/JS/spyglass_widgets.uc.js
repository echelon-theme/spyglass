// ==UserScript==
// @name			Spyglass :: Widget Manager
// @description 	Manages the installation of custom CustomizableUI widgets.
// @author			ephemeralViolette
// @github          https://github.com/ephemeralViolette
// @include         main
// ==/UserScript==

{

let { LocaleUtils } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
let widgetsBundle = "chrome://spyglass/locale/properties/custom-widgets.properties";
let urlbarBundle = "chrome://spyglass/locale/properties/urlbar.properties";

class SpyglassWidgetManager
{
    static alreadyRan = false;

    static async queueCustomWidgetInstallation()
    {
        if (this.alreadyRan)
        {
            return;
        }

        await new Promise(resolve => {
            let delayedStartupObserver = (aSubject, aTopic, aData) => {
                Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                resolve();
            };
            Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
        });

        this.createWidget({
            id: "navigator-throbber",
            type: "button",
            removable: true,

            label: LocaleUtils.str(widgetsBundle, "navigator_throbber.label"),
            tooltiptext: LocaleUtils.str(widgetsBundle, "navigator_throbber.tooltiptext"),
            defaultArea: CustomizableUI.AREA_MENUBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    openTrustedLinkIn(getHelpLinkURL("firefox-help"), "tab");
                }
            },
            
            onCreated: function(toolbarbutton) {
                toolbarbutton.classList.remove("toolbarbutton-1"); 
                NavigatorThrobber.init();
                return toolbarbutton;
            },
        });

        this.createWidget({
            id: "history-panelmenu",
            type: "button",
            removable: true,

            label: LocaleUtils.str(widgetsBundle, "history_button.label"),
            tooltiptext: LocaleUtils.str(widgetsBundle, "history_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    let sidebarUIHistoryID = "viewHistorySidebar";

                    SidebarUI.toggle(sidebarUIHistoryID);

                    //TODO: CHECKED STATE
                }
            },
            
            onCreated: function(toolbarbutton) {
                return toolbarbutton;
            },
        });

        this.createWidget({
            id: "search-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(widgetsBundle, "search_button.label"),
            tooltiptext: LocaleUtils.str(widgetsBundle, "search_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(e) {
                return; // TODO
            },
            
            onCreated: function(toolbarbutton) {
                return toolbarbutton;
            },
        });

        this.createWidget({
            id: "favorites-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(widgetsBundle, "favorites_button.label"),
            tooltiptext: LocaleUtils.str(widgetsBundle, "favorites_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    let sidebarUIHistoryID = "viewBookmarksSidebar";

                    SidebarUI.toggle(sidebarUIHistoryID);

                    //TODO: CHECKED STATE
                }
            },
            
            onCreated: function(toolbarbutton) {
                return toolbarbutton;
            },
        });

        this.createWidget({
            id: "mail-button",
            label: LocaleUtils.str(widgetsBundle, "mail_button.label"),
            type: "button",
            removable: true,
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onCreated: function(toolbarbutton) {
                let mailMenupopupFragment = `
                    <menupopup id="mail-button-menu-popup">
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                        <menuseparator />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                    </menupopup>
                `;

                // Add menu attribute to make the toolbarbutton be able to open the menu
                toolbarbutton.setAttribute("type", "menu");

                toolbarbutton.appendChild(window.MozXULElement.parseXULToFragment(mailMenupopupFragment));

                return toolbarbutton;
            }
        });
        
        this.createWidget({
            id: "go-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(urlbarBundle, "go_button.label"),
            // TODO (travy-patty): Add "Go to "x"" functionality
            tooltiptext: LocaleUtils.str(urlbarBundle, "go_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(event) {
                gURLBar.handleCommand(event);
            },

            onCreated: function(toolbarbutton) {
                return toolbarbutton;
            }
        })

        this.alreadyRan = true;

        window.addEventListener(
            "customizationstarting",
            this.addSeparatorPalette
        );
    }

    static async addSeparatorPalette() {
        let visiblePalette = gCustomizeMode.visiblePalette;

        let separator = CustomizableUI.createSpecialWidget(
            "separator",
            document
        );

        visiblePalette.appendChild(gCustomizeMode.wrapToolbarItem(separator, "palette"), visiblePalette);
    }

    static async createWidget(def)
    {
        // I added this while I was chasing down a bug (kept just in case), but it
        // turns out that that bug was actually just Firefox itself and not anything
        // to do with Spyglass:
        while (!CustomizableUI.getWidget)
            await new Promise(r => requestAnimationFrame(r));

        if (!CustomizableUI.getWidget(def.id)?.hasOwnProperty("source"))
        {
            CustomizableUI.createWidget(def);
        }
    }
}

SpyglassWidgetManager.queueCustomWidgetInstallation();

}