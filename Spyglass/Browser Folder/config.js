// skip 1st line
try
{  
    let {
        classes: Cc,
        interfaces: Ci,
        manager: Cm,
        utils: Cu
    } = Components;
    
    let cmanifest = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("UChrm", Ci.nsIFile);
    cmanifest.append("utils");
    cmanifest.append("chrome.manifest");
    
    if (cmanifest.exists())
    {
        Cm.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(cmanifest);
        ChromeUtils.importESModule('chrome://userchromejs/content/boot.sys.mjs');
    }

    // @TODO: DO SOMETHING
    // Branding part 1: Registration of content
    // let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	// let mozilla = prefs.getBoolPref("nettspend.appearance.mozilla");
    // let branding = mozilla ? "mozilla" : "default";
    // if (branding != "")
    // {
    //     let brandingManifest = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("UChrm", Ci.nsIFile);
    //     brandingManifest.append("branding");
    //     brandingManifest.append(branding);
    //     brandingManifest.append("chrome.manifest");
    //     if (brandingManifest.exists())
    //     {
    //         Cm.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(brandingManifest);
    //     }
    // }
} catch(ex) {};

// Enable CSS
defaultPref("toolkit.legacyUserProfileCustomizations.stylesheets", true);