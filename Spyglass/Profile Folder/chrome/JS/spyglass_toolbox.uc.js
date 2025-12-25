// ==UserScript==
// @name			 Spyglass :: Toolbox
// @description 	 Layout for Spyglass
// @author			 Travis
// @include			 main
// ==/UserScript==

var g_spyglassToolbox;

{
    var { LocaleUtils, waitForElement, setAttributes } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let toolboxBundle = "chrome://spyglass/locale/properties/toolbox.properties";

    class ToolbarGrippyElement extends MozXULElement
    {
        connectedCallback() {
            if (this.delayConnectedCallback())
                return;

            this.render();
        }

        render() {
            this.addEventListener("command", this.grippyTriggered);
            this.addEventListener("click", this.grippyTriggered);
        }
    }
    customElements.define("toolbargrippy", ToolbarGrippyElement);

    class SpyglassToolboxLayout {
        get _navBarTarget() {
            return document.querySelector("#nav-bar #nav-bar-customization-target");
        }

        get _widestToolbarbuttonElem() {
            let navBar = this._navBarTarget;

            if (!navBar || !navBar.children.length)
                return;

            let widestToolbarButton = null;
            let maxWidth = 0;

            for (let toolbarbutton of navBar.children) {
                if (!gCustomizeMode._customizing && toolbarbutton.nodeName == "toolbarbutton" && toolbarbutton.id !== "unified-extensions-button") {
                    let toolbarbuttonWidth = toolbarbutton.clientWidth;

                    if (toolbarbuttonWidth > maxWidth) {
                        maxWidth = toolbarbuttonWidth;
                        widestToolbarButton = toolbarbutton;
                    }
                }
            }

            return widestToolbarButton;
        }

        async init() 
        {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });

            this._createAddressToolbar();
            this._createOtherToolbarLabels();

            let navigatorToolbox = gNavToolbox;
            let toolbars = navigatorToolbox.querySelectorAll("toolbar");

            toolbars.forEach(toolbar => {
                if (toolbar.id !== "TabsToolbar") {
                    let toolbargrippy = document.createXULElement("toolbargrippy");

                    if (toolbar.id !== "notifications-toolbar") {
                        toolbar.insertBefore(toolbargrippy, toolbar.firstChild);
                    }

                    navigatorToolbox.appendChild(toolbar);
                }
                else {
                    document.querySelector("#appcontent").insertBefore(toolbar, document.querySelector("#appcontent").firstChild);
                    toolbar.removeAttribute("flex");
                }
            });

            if (document.getElementById("titlebar")) {
                document.getElementById("titlebar").remove();
            }

            let lockToolbarsItem = window.MozXULElement.parseXULToFragment(`
                <menuitem type="checkbox" />
            `).firstChild;

            waitForElement("#toolbar-context-menu").then((menu) => {
                lockToolbarsItem.id = "toolbar-context-lock";
                menu.insertBefore(lockToolbarsItem.cloneNode(), document.querySelector(".viewCustomizeToolbar"));
                menu.addEventListener("popupshowing", this._onPopupShowing);
            });

            this._setEqualToolbarbuttonSizes();
            this.appendTabBarCloseButton();

            let observer = new MutationObserver(this._setEqualToolbarbuttonSizes.bind(this));
            observer.observe(this._navBarTarget, { childList: true });
        }

        _onPopupShowing()
        {
            let item = document.querySelectorAll("#toolbar-context-lock");
            if (item) {
                item.forEach(elem => {
                    elem.label = LocaleUtils.str(toolboxBundle, "lock_toolbars.label");
                    elem.accessKey = LocaleUtils.str(toolboxBundle, "lock_toolbars.accesskey");
                });
            }
        }

        appendTabBarCloseButton()
        {
            let tabsToolbar = document.querySelector("#TabsToolbar");

            let closeButton = window.MozXULElement.parseXULToFragment(`
                <hbox class="tabs-closebutton-box" align="center" pack="end">
                    <toolbarbutton class="tabs-closebutton close-icon" onclick="gBrowser.removeCurrentTab();">
                    </toolbarbutton>
                </hbox>
            `);

            tabsToolbar.querySelector("#TabsToolbar-customization-target").appendChild(closeButton);
        }

        _createAddressToolbar() {
            let navigatorToolbox = gNavToolbox;
            let toolbarElement = document.createXULElement("toolbar");

            let toolbarElementAttrs = {
                "id": "AddressToolbar",
                "class": "toolbar-primary chromeclass-toolbar browser-toolbar customization-target",
                "toolbarname": LocaleUtils.str(toolboxBundle, "toolbox_address_toolbar.label"),
                "accesskey": LocaleUtils.str(toolboxBundle, "toolbox_address_toolbar.accesskey"),
                "customizable": "true",
                "context": "toolbar-context-menu",
                "mode": "icons",
                "iconsize": "small",
                "toolboxid": "navigator-toolbox",
            }

            setAttributes.set(toolbarElement, toolbarElementAttrs);

            navigatorToolbox.insertBefore(toolbarElement, navigatorToolbox.querySelector("#PersonalToolbar"));

            CustomizableUI.registerArea(toolbarElementAttrs.id, {legacy: true});
            CustomizableUI.registerToolbarNode(toolbarElement);

            let toolbarElementLabel = document.createXULElement("label");
            
            let toolbarLabelAttrs = {
                "id": "address-toolbar-label",
                "class": "toolbar-primary-label",
                "value": toolbarElementAttrs.toolbarname,
                "accesskey": toolbarElementAttrs.accesskey,
                "removable": "false",
            }

            setAttributes.set(toolbarElementLabel, toolbarLabelAttrs);

            toolbarElement.insertBefore(toolbarElementLabel, toolbarElement.firstChild);

            /* Move the URLbar to created toolbar */
            document.getElementById("urlbar-container").setAttribute("removable", "true");
            CustomizableUI.addWidgetToArea("urlbar-container", "AddressToolbar");
            CustomizableUI.moveWidgetWithinArea("urlbar-container", "0");

            if (document.querySelector("#AddressToolbar #go-button")) {
                CustomizableUI.moveWidgetWithinArea("go-button", "0");
            }
        }

        _createOtherToolbarLabels() {
            let toolbarElement = document.querySelector("#PersonalToolbar");
            let toolbarElementLabel = document.createXULElement("label");
            
            let toolbarLabelAttrs = {
                "id": "address-toolbar-label",
                "class": "toolbar-primary-label",
                "value": LocaleUtils.str(toolboxBundle, "toolbox_link_toolbar.label"),
                "accesskey": LocaleUtils.str(toolboxBundle, "toolbox_link_toolbar.accesskey"),
                "removable": "false",
            }

            setAttributes.set(toolbarElementLabel, toolbarLabelAttrs);

            toolbarElement.insertBefore(toolbarElementLabel, toolbarElement.firstChild);
        }

        _setEqualToolbarbuttonSizes() {
            document.documentElement.style.removeProperty(`--nav-bar-toolbarbutton-width`);

            document.documentElement.style.setProperty(
                `--nav-bar-toolbarbutton-width`,
                `${this._widestToolbarbuttonElem.clientWidth}px`
            );
        }
    }

    g_spyglassToolbox = new SpyglassToolboxLayout;
    g_spyglassToolbox.init();
}