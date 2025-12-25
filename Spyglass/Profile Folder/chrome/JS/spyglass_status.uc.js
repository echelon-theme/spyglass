// ==UserScript==
// @name			Spyglass :: Status Bar
// @description 	Restore separate Status Bar
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

var g_ReadMail;

{
	var { ctypes } = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs");
	var { Registry } = ChromeUtils.importESModule("chrome://modules/content/Registry.sys.mjs");
	var { PrefCalls, LocaleUtils, waitForElement, setAttributes } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

	let statusBundle = "chrome://spyglass/locale/properties/statusbar.properties";

	class MailClientUtils {
        runFile(filePath, commandLineArgs) {
            const HWND = ctypes.voidptr_t;
            const LPCWSTR = ctypes.jschar.ptr;
            const HINSTANCE = ctypes.voidptr_t;
            const UINT = ctypes.uint32_t;
            const SW = { SHOWNORMAL: 1 };

            const shell32 = ctypes.open("shell32.dll");

            const ShellExecuteW = shell32.declare(
                "ShellExecuteW",
                ctypes.winapi_abi,
                HINSTANCE,
                HWND, LPCWSTR, LPCWSTR, LPCWSTR, LPCWSTR, UINT
            );

            const filePathWide = ctypes.jschar.array()(filePath);
            const commandLineArgsWide = ctypes.jschar.array()(commandLineArgs);

            const hInstance = ShellExecuteW(
                null,
                "open",
                filePathWide,
                commandLineArgsWide,
                null,
                SW.SHOWNORMAL
            );

            if (hInstance <= 32) 
                console.error("Error starting "+ filePath +". "+ hInstance.toString())

            shell32.close();
        }

        get _defaultMailClient() {
            if (Services.appinfo.OS !== "WINNT")
                return
            
            return Registry.getRegKeyValue("HKLM", "SOFTWARE\\Clients\\Mail", "", "String");
        }

        get _defaultMailPath() {
            return Registry.getRegKeyValue("HKLM", `SOFTWARE\\Clients\\Mail\\${this._defaultMailClient}\\shell\\open\\command`, "", "String");
        }

        open() {
            let mailClientPath = this._defaultMailPath.match(/"([^"]*)"/)[1];
            let mailClientArgs = this._defaultMailPath.split(" ").pop();

            this.runFile(mailClientPath, mailClientArgs);
        }
    }

	g_ReadMail = new MailClientUtils;

	gIdentityHandler.refreshIdentityBlock = function refreshIdentityBlock() {
		if (!this._identityBox) {
			return;
		}

		
		this._refreshIdentityIcons();

		// If this condition is true, the URL bar will have an "invalid"
		// pageproxystate, so we should hide the permission icons.
		if (this._hasInvalidPageProxyState()) {
			gPermissionPanel.hidePermissionIcons();
		} else {
			gPermissionPanel.refreshPermissionIcons();
		}

		if (this._isURILoadedFromFile) {
			document.querySelector("#status-bar #statusbar-zone").setAttribute("zone", "local");
			document.querySelector("#status-bar #statusbar-zone .statusbarpanel-text").setAttribute("value", LocaleUtils.str(statusBundle, "statusbar_panel_zone_local.label"));
		}
		else {
			document.querySelector("#status-bar #statusbar-zone").setAttribute("zone", "internet");
			document.querySelector("#status-bar #statusbar-zone .statusbarpanel-text").setAttribute("value", LocaleUtils.str(statusBundle, "statusbar_panel_zone_internet.label"));
		}

		// Hide the shield icon if it is a chrome page.
		gProtectionsHandler._trackingProtectionIconContainer.classList.toggle(
			"chromeUI",
			this._isSecureInternalUI
		);
	}

	var SpyglassStatusBarManager = {
		get fragment() {
			return `
				<vbox id="browser-bottombox">
					<statusbar id="status-bar">
						<statusbarpanel id="statusbar-display" class="statusbarpanel-iconic" flex="1">
							<image class="statusbarpanel-icon" />
							<label class="statusbarpanel-text" value="${LocaleUtils.str(statusBundle, "statusbar_panel_display_done.label")}" />
						</statusbarpanel>
						<statusbarpanel id="offline-status" class="statusbarpanel-iconic" label="${LocaleUtils.str(statusBundle, "statusbar_panel_offlinestatus.label")}" onclick="BrowserOffline.toggleOfflineStatus();">
							<image class="statusbarpanel-icon" />
						</statusbarpanel>
						<statusbarpanel class="statusbarpanel-iconic">
							<image class="statusbarpanel-icon" />
						</statusbarpanel>
						<statusbarpanel class="statusbarpanel-iconic">
							<image class="statusbarpanel-icon" />
						</statusbarpanel>
						<statusbarpanel id="statusbar-zone" class="statusbarpanel-iconic">
							<image class="statusbarpanel-icon" />
							<label class="statusbarpanel-text" />
						</statusbarpanel>
					</statusbar>
					<box class="resizerpanel">
						<resizer />
					</box>
				</vbox>
			`;
		},

		get menuFragment() {
			return `
				<menuitem oncommand="SpyglassStatusBarManager.setStatusBarState(Boolean(this.getAttribute('checked')))" type="checkbox" />
			`;
		},

		init() {
			document.body.appendChild(MozXULElement.parseXULToFragment(this.fragment));

			Services.obs.addObserver(this, "network:offline-status-changed");
			this.setOfflineStatus(Services.io.offline);

			this.initStatusPanelVisibility();
		},

		observe(aSubject, aTopic) {
			if (aTopic != "network:offline-status-changed") {
				return;
			}

			this.setOfflineStatus(Services.io.offline);
		},

		setOfflineStatus(state) {
			let offlineStatus = document.querySelector("#status-bar #offline-status");

			if (state) {
				offlineStatus.setAttribute("tooltiptext", LocaleUtils.str(statusBundle, "statusbar_panel_offlinestatus_offline.tooltiptext"));
				offlineStatus.setAttribute("offline", "true");
				offlineStatus.setAttribute("checked", "true");
			}
			else {
				offlineStatus.removeAttribute("tooltiptext");
				offlineStatus.removeAttribute("offline");
				offlineStatus.removeAttribute("checked");
			}
		},

		initStatusPanelVisibility() {
			try
			{
				this._applyStatusBarEnabledPrefs();
			}
			catch (e)
			{
				if (e.name == "NS_ERROR_UNEXPECTED") // preference does not exist
				{
					try
					{
						PrefCalls.setPref("spyglass.status-bar.enabled", true)
					}
					catch (e) {}
				}
			}
			
			Services.prefs.addObserver("spyglass.status-bar.enabled", this._applyStatusBarEnabledPrefs.bind(this));
		},

		_moveStatusPanel() {
			if (document.querySelector(".browserStack #statuspanel")) {
				document.querySelector("#status-bar #statusbar-display").insertBefore(StatusPanel.panel, document.querySelector("#status-bar #statusbar-display .statusbarpanel-text"));
			}
		},

		_onPopupShowing() {
			let item = document.querySelectorAll("#menu_SpyglassStatusBar");
			if (item)
			{
				item.forEach(elem => {
					elem.label = LocaleUtils.str(statusBundle, "spyglass_statusbar.label");
					elem.accessKey = LocaleUtils.str(statusBundle, "spyglass_statusbar.accesskey");

					let pref = Services.prefs.getBoolPref("spyglass.status-bar.enabled");

					if (pref == true)
					{
						elem.setAttribute("checked", "true");
					}
					else
					{
						elem.removeAttribute("checked");
					}
				});
			}
		},

		setStatusBarState(state)
		{
			PrefCalls.setPref("spyglass.status-bar.enabled", state)
			this._hideStatusPanel(state);
		},

		_applyStatusBarEnabledPrefs() {
			let newState = Services.prefs.getBoolPref("spyglass.status-bar.enabled");
			this._hideStatusPanel(newState);
		},

		_hideStatusPanel(state) {
			let panel = document.querySelector("#browser-bottombox");

			if (state == true)
			{
				panel.removeAttribute("hidden");
			}
			else
			{
				panel.setAttribute("hidden", "true");
			}

			let menuitem = document.querySelectorAll("#menu_SpyglassStatusBar");

			if (menuitem) {
				menuitem.forEach(elem => {
					if (state == true)
					{
						elem.setAttribute("checked", "true");
					}
					else {
						elem.removeAttribute("checked");
					}
				});
			}
		}
	};

	document.addEventListener("DOMContentLoaded", SpyglassStatusBarManager.init(), false);

	waitForElement("#statuspanel").then(e => {
		SpyglassStatusBarManager._moveStatusPanel();
	});

	waitForElement("#menu_viewPopup").then((menu) => {
		let statusBarItem = window.MozXULElement.parseXULToFragment(SpyglassStatusBarManager.menuFragment).firstChild;
		statusBarItem.id = "menu_SpyglassStatusBar";
		menu.insertBefore(statusBarItem.cloneNode(), document.querySelector("#viewSidebarMenuMenu"));
		menu.addEventListener("popupshowing", SpyglassStatusBarManager._onPopupShowing);
	});

	waitForElement("#tabbrowser-tabpanels").then(e => {	
		let browserStackObserver = new MutationObserver(SpyglassStatusBarManager._moveStatusPanel);
		browserStackObserver.observe(e, { childList: true, subtree: true });
	});
}