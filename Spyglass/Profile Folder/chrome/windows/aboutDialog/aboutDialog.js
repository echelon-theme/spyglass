var g_SpyglassAboutDialog;

{
    let { PrefManager } = ChromeUtils.importESModule("chrome://modules/content/PrefManager.sys.mjs"); 
    let { LocaleUtils, PrefCalls } = ChromeUtils.importESModule("chrome://userscripts/content/spyglass_utils.sys.mjs");
    let g_prefManager = new PrefManager(
        document.documentElement,
        [
            "spyglass.appearance.xp",
            "spyglass.appearance.ie6"
        ]
    );

    const SPYGLASS_IE6_PREF = "spyglass.appearance.ie6";
    const ABOUT_DIALOG_BUNDLE = "chrome://spyglass/locale/properties/aboutDialog.properties";

    class SpyglassAboutDialog {
        get _dialog() {
            return document.getElementById("aboutDialog");
        }

        get _isIE6pref() {
            return PrefCalls.getPref(SPYGLASS_IE6_PREF);
        }

        get _aboutDialogInfo() {
            return {
				0: {
					"id": "version",
                    "value": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.version.label")} 5.00.3700.1000`,
                    "valueie6": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.version.label")} 6.00.2800.1106`,
				},
				1: {
					"id": "cipher-strength",
                    "value": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.cipher-strength.label")} 128-bit`,
                    "valueie6": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.cipher-strength.label")} 128-bit`,
				},
				2: {
					"id": "product-id",
                    "value": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.product-id.label")} 51873-335-6925231-09739`,
                    "valueie6": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.product-id.label")}55736-357-9817782-04064`,
				},
				3: {
					"id": "update-versions",
                    "value": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.update-versions.label")};SP4;`,
                    "valueie6": `${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.update-versions.label")}; SP1;`,
				},
			};
        }

        get _fragment() {
            return `
                <box class="about-dialog-logo-container">
                    <image class="about-dialog-logo" />
                </box>
                <vbox class="about-dialog-info-container">
                    <vbox class="about-dialog-info-section">
                        <hbox id="version" class="about-dialog-info">
                            <label />
                        </hbox>
                        <hbox id="cipher-strength" class="about-dialog-info" isie6="${this._isIE6pref}">
                            <label />
                            <hbox class="update-info" hidden="${this._isIE6pref}">
                                <label value=" ( " />
                                <label class="update-info-link" is="text-link" href="">${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "info.cipher-strength.update-link.label")}</label>
                                <label value=" )" />
                            </hbox>
                        </hbox>
                        <hbox id="product-id" class="about-dialog-info">
                            <label />
                        </hbox>
                        <hbox id="update-versions" class="about-dialog-info">
                            <label />
                        </hbox>
                    </vbox>
                    <html:textarea readonly="true">Based on NCSA Mosaic. NCSA Mosaic(TM); was 
developed at the National Center for Supercomputing
Applications at the University of Illinois at Urbana-
Champaign. 
Distributed under a licensing agreement with Spyglass, 
Inc. 
Contains security software licensed from RSA Data 
Security Inc. 
Portions of this software are based in part on the work 
of the Independent JPEG Group. 
Contains SOCKS client software licensed from 
Hummingbird Communications Ltd. 
Contains ASN.1 software licensed from Open Systems 
Solutions, Inc. Multimedia software components, including Indeo(R); 
video, Indeo(R) audio, and Web Design Effects are 
provided by Intel Corp. 
Unix version contains software licensed from Mainsoft 
Corporation. Copyright (c) 1998-1999 Mainsoft 
Corporation. All rights reserved. Mainsoft is a trademark 
of Mainsoft Corporation. 
Warning: This computer program is protected by 
copyright law and international treaties. Unauthorized 
reproduction or distribution of this program, or any 
portion of it, may result in severe civil and criminal 
penalties, and will be prosecuted to the maximum extent 
possible under the law.</html:textarea>
                </vbox>
                <hbox class="about-dialog-footer-container">
                    <box class="windows-flag-container">
                        <image class="windows-flag" />
                    </box>
                    <vbox class="footer-links-container" flex="1">
                        <label class="copyright-link" is="text-link" href="">${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, this._isIE6pref ? "copyright.2001" : "copyright.1999")}</label>
                    </vbox>
                    <hbox class="footer-button-container">
                        <button id="ok-button" label="${LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "button.ok")}" />
                    </hbox>
                </hbox>
            `
        }

        constructor() {
            window.addEventListener("keydown", (e) => {
                if (e.key == "Escape") {
                    window.close();
                }
            });

            window.addEventListener("DOMContentLoaded", (e) => {
                this.init();
            });
        }

        init() {
            this._dialog.setAttribute("title", LocaleUtils.str(ABOUT_DIALOG_BUNDLE, "window.title"));

            this._buildWindowFragment();

            document.documentElement.addEventListener(
                "spyglass-appearance-change",
                this._buildWindowFragment
            )
        }

        _buildWindowFragment() {
            let fragment = this._fragment;

            this._dialog.querySelector(".about-dialog-container").innerHTML = "";
            this._dialog.querySelector(".about-dialog-container").appendChild(MozXULElement.parseXULToFragment(fragment));

            for (const dialogInfo of Object.keys(this._aboutDialogInfo)) {
                let dialogInfoElem = document.querySelector(`#${this._aboutDialogInfo[dialogInfo].id} > label`);
                let dialogInfoValue = this._isIE6pref ? this._aboutDialogInfo[dialogInfo].valueie6 : this._aboutDialogInfo[dialogInfo].value;

                dialogInfoElem.setAttribute("value", dialogInfoValue);
			};

            this._dialog.querySelector("#ok-button").addEventListener("click", (e) => {
                window.close();
            });
        }
    }

    g_SpyglassAboutDialog = new SpyglassAboutDialog;
}