// ==UserScript==
// @name			 Spyglass :: About Dialog
// @description 	 Replaces normal About Firefox dialog with a custom one
// @author			 Travis
// @include			 main
// ==/UserScript==

window.openAboutDialog = function openAboutDialog()
{
    window.openDialog(
        "chrome://userchrome/content/windows/aboutDialog/aboutDialog.xhtml",
        "About Internet Explorer",
        "chrome,centerscreen,resizeable=no,dependent"
    ); 
}