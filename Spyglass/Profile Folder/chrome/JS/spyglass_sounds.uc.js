// ==UserScript==
// @name			Spyglass :: Complete Navigation
// @description 	Plays sounds on certain browser events (Complete Navigation and such)
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

var g_spyglassSoundManager;

{
    var { ctypes } = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs");
    var { Registry } = ChromeUtils.importESModule("chrome://modules/content/Registry.sys.mjs");

    class SpyglassSoundManager {
        get _navigatingSoundPath() {
            return Registry.getRegKeyValue("HKCU", "AppEvents\\Schemes\\Apps\\Explorer\\Navigating\\.Current", "", "String");
        }

        async init() {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });
            
            gBrowser.addTabsProgressListener({
                onStateChange(browser, webProgress, request, flags) {
                    if (
                        flags & Ci.nsIWebProgressListener.STATE_START &&
                        flags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT &&
                        webProgress.isTopLevel
                    ) {
                        g_spyglassSoundManager.playSound(g_spyglassSoundManager._navigatingSoundPath);
                    }
                }
            });
        }

        playSound(path) {
            const SND_FILENAME = 0x00020000;
            const SND_NODEFAULT = 0x0002;
            const SND_ASYNC = 0x0001;

            let winmm = ctypes.open("winmm.dll");

            let PlaySoundW = winmm.declare(
                "PlaySoundW",
                    ctypes.winapi_abi,
                    ctypes.bool,
                    ctypes.jschar.ptr,
                    ctypes.voidptr_t,
                    ctypes.uint32_t
            );

            let pathArray = ctypes.jschar.array()(path);

            PlaySoundW(pathArray, null, SND_ASYNC | SND_FILENAME | SND_NODEFAULT);

            winmm.close();
        }
    }

    g_spyglassSoundManager = new SpyglassSoundManager;
    g_spyglassSoundManager.init(); 
}