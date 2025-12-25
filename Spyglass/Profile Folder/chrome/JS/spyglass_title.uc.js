// ==UserScript==
// @name			Spyglass :: Title Text
// @description 	Changes the window title formats.
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript===

{
    let { BrandUtils } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");

    let root = document.documentElement;
    let fullName = BrandUtils.getBrandingKey("brandFullName");

    let titles = {
        "default": fullName,
        "private": `${fullName} (Private Browsing)`,
        "contentDefault": `CONTENTTITLE - ${fullName}`,
        "contentPrivate": `CONTENTTITLE - ${fullName} (Private Browsing)`
    };
    
    root.dataset.titleDefault = titles.default;
    root.dataset.titlePrivate = titles.private;
    root.dataset.contentTitleDefault = titles.contentDefault;
    root.dataset.contentTitlePrivate = titles.contentPrivate;
}