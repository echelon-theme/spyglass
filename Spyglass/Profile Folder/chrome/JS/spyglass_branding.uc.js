// ==UserScript==
// @name			Spyglass :: Branding
// @description 	Register brand FTLs.
// @author			aubymori
// @include			main
// @onlyonce
// ==/UserScript===

{
    function fsPathToFileUri(path, isDir = false)
    {
        let out = "file://";
        if (Services.appinfo.OS == "WINNT")
        {
            // file:// URIs have a leading slash that Windows file path doesn't
            // have normally
            out += "/";
        }
        // Add and de-Windowsify the path
        out += path.replaceAll("\\", "/");
        // Add leading slash if it isn't there
        if (isDir && out.slice(-1) != "/")
            out += "/";
        return out;
    }

    const FTL_FILES = [
        "branding/brand.ftl",
        "browser/aboutDialog.ftl"
    ];

    let isie6 = Services.prefs.getBoolPref("spyglass.appearance.ie6");
    let brand = isie6 ? "ie6" : "ie5";

    if (brand != "")
    {
        let branding = Services.dirsvc.get("UChrm", Ci.nsIFile);
        branding.append("branding");
        branding.append(brand);

        let ftls = branding.clone();
        ftls.append("ftls");
        let root = fsPathToFileUri(ftls.path, true);
        let paths = [];

        for (const filename of FTL_FILES)
        {
            let file = ftls.clone();
            for (const split of filename.split("/"))
                file.append(split);

            if (file.exists())
                paths.push(fsPathToFileUri(file.path));
        }

        if (paths.length > 0)
        {
            let locale = Services.locale.appLocalesAsBCP47;
            let source = new L10nFileSource(
                "namoroka",
                "app",
                locale,
                root,
                {
                    addResourceOptions: {
                        allowOverrides: true
                    }
                },
                paths
            );
            L10nRegistry.getInstance().registerSources([source]);
        }
    }
}