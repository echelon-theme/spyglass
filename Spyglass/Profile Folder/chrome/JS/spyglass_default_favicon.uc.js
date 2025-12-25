// ==UserScript==
// @name			Spyglass :: Default Favicon
// @description 	Adds a class to bookmarks to identify those with a default favicon.
// @author			aubymori
// @github          https://github.com/aubymori
// @include			main
// ==/UserScript==

{
    /* SVG markup of the default favicon */
    let defaultFavicon = null;

    function onMutation(list)
    {
        for (const mut of list)
        {
            if (mut.type == "attributes"
            && mut.attributeName == "src"
            && (mut.target.nodeName == "image"
            || mut.target.nodeName == "img")
            && (mut.target.matches(".bookmark-item image")
            || mut.target.matches("img.urlbarView-favicon")))
            {
                try
                {
                    fetch(mut.target.getAttribute("src")).then(async (r) => {
                        mut.target.classList.add("default-favicon");

                        if (mut.target.nodeName == "image")
                        {
                            mut.target.removeAttribute("src");
                        }
                    });
                }
                catch (e)
                {
                    console.log(e);
                }
            }
        }
    }

    fetch("chrome://global/skin/icons/defaultFavicon.svg").then(async (r) => {
        defaultFavicon = await r.text();

        let observer = new MutationObserver(onMutation);
        observer.observe(
            document.documentElement,
            {
                attributes: true,
                childList: true,
                subtree: true
            }
        );
    });
}