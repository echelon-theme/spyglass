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
            type: "custom",
            removable: true,
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onBuild: function(aDocument) {
                let toolbarbutton = aDocument.createXULElement("toolbarbutton");
                let attributes = {
                    id: "mail-button",
                    class: "toolbarbutton-1 chromeclass-toolbar-additional",
                    overflows: "true",
                    label: LocaleUtils.str(widgetsBundle, "mail_button.label")
                }

                for (let attr in attributes) {
                    toolbarbutton.setAttribute(attr, attributes[attr]);
                }

                let toolbarbuttonfragment = aDocument.defaultView.MozXULElement.parseXULToFragment(`
                    <menupopup id="mail-button-menu-popup-new">
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_mail.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_new_message.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_send_link.label")}" />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_send_page.label")}" />
                        <menuseparator />
                        <menuitem label="${LocaleUtils.str(widgetsBundle, "mail_button_read_news.label")}" />
                    </menupopup>
                    <hbox class="toolbarbutton-icon-dropmarker">
                        <image class="toolbarbutton-icon" label="${LocaleUtils.str(widgetsBundle, "mail_button.label")}" />
                        <dropmarker type="menu" class="toolbarbutton-menu-dropmarker" label="${LocaleUtils.str(widgetsBundle, "mail_button.label")}" />
                    </hbox>
                    <label class="toolbarbutton-text" crop="end" flex="1" value="${LocaleUtils.str(widgetsBundle, "mail_button.label")}"/>
                `);

                let menupopup = toolbarbuttonfragment.querySelector("menupopup");
                toolbarbutton.appendChild(toolbarbuttonfragment);

                toolbarbutton.addEventListener("mousedown", (e) => {
                    toolbarbutton.setAttribute("open", "true");
                    menupopup.openPopup(toolbarbutton, "after_start", 0, 0, true);
                });

                menupopup.addEventListener("popuphiding", (e) => {
                    toolbarbutton.removeAttribute("open");
                });

                return toolbarbutton;
            }
        });
        
        this.createWidget({
            id: "go-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(urlbarBundle, "go_button.label"),
            tooltiptext: LocaleUtils.str(urlbarBundle, "go_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(event) {
                gURLBar.handleCommand(event);
            },

            onCreated: function(toolbarbutton) {
                /*
                *   Functionality that changes the tooltip to 'Go to "(url)"' on hover.
                */
                toolbarbutton.addEventListener("mouseenter", (e) => {
                    toolbarbutton.setAttribute("tooltiptext", LocaleUtils.str(urlbarBundle, "go_button_site.tooltiptext", gIdentityHandler._uri.spec));
                });
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