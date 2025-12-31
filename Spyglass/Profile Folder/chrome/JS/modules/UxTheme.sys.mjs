export class UxTheme
{
    /* 
    *   UXTheme Constants Dump
    */
    static TMT = {
        BORDERCOLOR: 3801,
        FILLCOLOR: 3802,
        TEXTCOLOR: 3803,
        EDGELIGHTCOLOR: 3804,
        EDGEHIGHLIGHTCOLOR: 3805,
        EDGESHADOWCOLOR: 3806,
        EDGEDKSHADOWCOLOR: 3807,
        EDGEFILLCOLOR: 3808,
        TRANSPARENTCOLOR: 3809,
        GRADIENTCOLOR1: 3810,
        GRADIENTCOLOR2: 3811,
        GRADIENTCOLOR3: 3812,
        GRADIENTCOLOR4: 3813,
        GRADIENTCOLOR5: 3814,
        SHADOWCOLOR: 3815,
        GLOWCOLOR: 3816,
        TEXTBORDERCOLOR: 3817,
        TEXTSHADOWCOLOR: 3818,
        GLYPHTEXTCOLOR: 819,
        GLYPHTRANSPARENTCOLOR: 3820,
        FILLCOLORHINT: 3821
    };

    static REBAR = {
        PART: {
            BACKGROUND: 0,
            BAND: 1,
            CHEVRON: 2,
            CHEVRONVERT: 3
        },
        STATE: {
            NORMAL: 1,
            HOT: 2, 
            PRESSED: 3
        }
    };

    static BUTTON = {
        PART: {
            PUSHBUTTON: 1,
            RADIOBUTTON: 2,
            CHECKBOX: 3,
            GROUPBOX: 4
        },
        STATE: {
            NORMAL: 1,
            HOT: 2,
            PRESSED: 3,
            DISABLED: 4,
            DEFAULTED: 5
        }
    };

    static MENU = {
        PART: {
            MENUITEM: 1,
            MENUDROPDOWN: 2,
            MENUBARITEM: 3,
            MENUBARDROPDOWN: 4,
            CHEVRON: 5,
            SEPARATOR: 6,
            BARBACKGROUND: 7,
            BARITEM: 8,
            POPUPBACKGROUND: 9
        },
        STATE: {
            NORMAL: 1,
            HOT: 2,
            DISABLED: 3,
            DISABLEDHOT: 4
        }
    };

    static TOOLBAR = {
        PART: {
            BUTTON: 1,
            DROPDOWNBUTTON: 2,
            SPLITBUTTON: 3,
            SPLITBUTTONDROPDOWN: 4,
            SEPARATOR: 5,
            SEPARATORVERT: 6
        },
        STATE: {
            NORMAL: 1,
            HOT: 2,
            PRESSED: 3,
            DISABLED: 4,
            CHECKED: 5,
            HOTCHECKED: 6
        }
    };

    static SYS_COLOR = {
        SCROLLBAR: 0,
        BACKGROUND: 1,
        ACTIVECAPTION: 2,
        INACTIVECAPTION: 3,
        MENU: 4,
        WINDOW: 5,
        WINDOWFRAME: 6,
        MENUTEXT: 7,
        WINDOWTEXT: 8,
        CAPTIONTEXT: 9,
        ACTIVEBORDER: 10,
        INACTIVEBORDER: 11,
        APPWORKSPACE: 12,
        HIGHLIGHT: 13,
        HIGHLIGHTTEXT: 14,
        BTNFACE: 15,
        BTNSHADOW: 16,
        GRAYTEXT: 17,
        BTNTEXT: 18,
        INACTIVECAPTIONTEXT: 19,
        BTNHIGHLIGHT: 20
    };

    static colorrefToRgb(colorref) {
        let r = colorref & 0xFF;
        let g = (colorref >> 8) & 0xFF;
        let b = (colorref >> 16) & 0xFF;

        return `rgb(${r}, ${g}, ${b})`;
    }

    static GetSysColor(sysColorId) {
        if (Services.appinfo.OS !== "WINNT")
            return

        var { ctypes } = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs");
        let user32 = ctypes.open("user32.dll");

        let GetSysColor = user32.declare(
            "GetSysColor",
            ctypes.winapi_abi,
            ctypes.uint32_t,
            ctypes.int
        );

        let sysColorIdValue = GetSysColor(sysColorId);

        user32.close();

        return this.colorrefToRgb(sysColorIdValue);
    }

    static GetThemeColor(className, partId, stateId, propId, sysColorId, hwnd) {
        if (Services.appinfo.OS !== "WINNT")
            return
        
        var { ctypes } = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs");

        try 
        {
            let uxtheme = ctypes.open("uxtheme.dll");

            let OpenThemeData = uxtheme.declare(
                "OpenThemeData",
                ctypes.winapi_abi,
                ctypes.voidptr_t,
                ctypes.voidptr_t,
                ctypes.jschar.ptr
            );

            let GetThemeColor = uxtheme.declare(
                "GetThemeColor",
                ctypes.winapi_abi,
                ctypes.int,
                ctypes.voidptr_t,
                ctypes.int,
                ctypes.int,
                ctypes.int,
                ctypes.uint32_t.ptr
            );

            let CloseThemeData = uxtheme.declare(
                "CloseThemeData",
                ctypes.winapi_abi,
                ctypes.int,
                ctypes.voidptr_t
            );

            let hTheme = OpenThemeData(hwnd || null, className);

            if (!hTheme.isNull()) 
            {
                let color = ctypes.uint32_t();

                let hr = GetThemeColor(
                    hTheme,
                    partId,
                    stateId,
                    propId,
                    color.address()
                );

                CloseThemeData(hTheme);
                uxtheme.close();

                if (hr === 0) {
                    return this.colorrefToRgb(color.value);
                }
            } 
            else 
            {
                uxtheme.close();
            }
        } 
        catch (e) 
        {
            throw e;
        }

        /*
        *   Fallback to Classic Theme colors
        */
        return this.GetSysColor(sysColorId);
    }
}