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
        _navBarObserver = null;
        _resizePending = false;
        _freezeToolbarSizing = false;

        get _navBarTarget() {
            return document.querySelector("#nav-bar #nav-bar-customization-target");
        }

        get _widestToolbarbuttonElem() {
            let navBar = this._navBarTarget;
            if (!navBar)
                return null;

            let widest = null;
            let maxWidth = 0;

            for (let el of navBar.children) {
                if (
                    el.nodeName === "toolbarbutton" &&
                    !el.hidden &&
                    !el.classList.contains("toolbarbutton-overflow-button") &&
                    el.id !== "unified-extensions-button" &&
                    el.getAttribute("type") !== "menu"
                ) {
                    el.style.removeProperty("width");

                    let width = el.getBoundingClientRect().width;

                    if (width > maxWidth) {
                        maxWidth = width;
                        widest = el;
                    }
                }
            }

            return widest;
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
            this.initNavBarSizing();
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

        initNavBarSizing() {
            let navBar = this._navBarTarget;
            if (!navBar)
                return;

            this._navBarObserver?.disconnect();

            this._navBarObserver = new MutationObserver(() => {
                this._scheduleSizeUpdate();
            });

            this._navBarObserver.observe(navBar, {
                childList: true
            });

            window.addEventListener("customizationstarting", () => {
                this._freezeToolbarSizing = true;
            });

            window.addEventListener("customizationending", () => {
                this._freezeToolbarSizing = false;
                this._scheduleSizeUpdate();
            });

            window.addEventListener("resize", () => {
                this._scheduleSizeUpdate();
            });

            this._scheduleSizeUpdate();
        }

        _scheduleSizeUpdate() {
            if (this._freezeToolbarSizing || this._resizePending)
                return;

            this._resizePending = true;

            requestAnimationFrame(() => {
                this._resizePending = false;
                this._setEqualToolbarbuttonSizes();
            });
        }

        _setEqualToolbarbuttonSizes() {
            if (this._freezeToolbarSizing)
                return;

            let root = document.documentElement.style;

            root.removeProperty("--nav-bar-toolbarbutton-width");

            let widest = this._widestToolbarbuttonElem;
            if (!widest)
                return;

            let width = widest.getBoundingClientRect().width;

            root.setProperty(
                "--nav-bar-toolbarbutton-width",
                `${width}px`
            );
        }
    }

    g_spyglassToolbox = new SpyglassToolboxLayout;
    g_spyglassToolbox.init();
}