// ==UserScript==
// @name			Spyglass :: System Metrics
// @description 	Get System Metrics/Theme Values (Colors, Fonts, Sizes, etc.)
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

var g_spyglassSysMetrics;

{
    var { UxTheme } = ChromeUtils.importESModule("chrome://modules/content/UxTheme.sys.mjs");

    class SpyglassMetricsManager
    {
        get _rebarTextColor() {
            return UxTheme.GetThemeColor(
                "Rebar",
                UxTheme.REBAR.PART.BAND,
                UxTheme.REBAR.STATE.NORMAL,
                UxTheme.TMT.TEXTCOLOR,
                UxTheme.SYS_COLOR.BTNTEXT
            );
        }

        get _rebarBandColor() {
            return UxTheme.GetThemeColor(
                "Rebar",
                UxTheme.REBAR.PART.BAND,
                UxTheme.REBAR.STATE.NORMAL,
                UxTheme.TMT.EDGESHADOWCOLOR,
                UxTheme.SYS_COLOR.BTNSHADOW
            );
        }

        init() {
            Services.obs.addObserver(this, "internal-look-and-feel-changed");

            this.setColors();
        }    

        setColors() {
            document.documentElement.style.removeProperty(`--rebar-text-color`);
            document.documentElement.style.removeProperty(`--rebar-band-color`);

            document.documentElement.style.setProperty(
                `--rebar-text-color`,
                this._rebarTextColor
            );

            document.documentElement.style.setProperty(
                `--rebar-band-color`,
                this._rebarBandColor
            );
        }

        
		observe(aSubject, aTopic, aData) {
			if (aTopic != "internal-look-and-feel-changed") {
				return;
			}

			this.setColors();
		}
    }

    g_spyglassSysMetrics = new SpyglassMetricsManager;
    g_spyglassSysMetrics.init();
}