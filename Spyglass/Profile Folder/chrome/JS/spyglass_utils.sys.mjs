// ==UserScript==
// @name			 Spyglass :: Utils
// @description 	 Common utilities for Spyglass scripts.
// @author			 ephemeralViolette
// @github           https://github.com/ephemeralViolette
// @include			 main
// @include          chrome://browser/content/browser.xhtml
// @include			 chrome://browser/content/aboutDialog.xhtml
// @loadOrder        1
// ==/UserScript==

export function renderElement(nodeName, attrMap = {}, childrenArr = [])
{
	let namespace = "html";
	let nodeNameParts = nodeName.split(":");
	let name = nodeName;
	
	if (nodeNameParts.length > 1)
	{
		namespace = nodeNameParts[0];
		name = nodeNameParts[1];
	}
	
	let element = null;
	switch (namespace)
	{
		case "html":
			element = this.document.createElement(name);
			break;
		case "xul":
			element = this.document.createXULElement(name);
			break;
		default:
			throw new Error(`Invalid element namespace for ${namespace}:${name}`);
	}
	
	for (var key in attrMap)
	{
		element.setAttribute(key, attrMap[key]);
	}
	
	for (var i = 0, j = childrenArr.length; i < j; i++)
	{
		element.appendChild(childrenArr[i]);
	}
	
	return element;
}

export async function waitForElement(query, parent = this.document, timeout = -1)
{
	let startTime = Date.now();
	
	while (parent.querySelector(query) == null)
	{
		if (timeout > -1 && Date.now > startTime + timeout)
		{
			return null;
		}
		await new Promise(r => this.requestAnimationFrame(r));
	}
	
	return parent.querySelector(query);
}

export class PrefCalls
{
	static getPrefBranch()
	{
		return Services.prefs.getBranch(null);
	}

	static getDefaultPrefBranch()
	{
		return Services.prefs.getDefaultBranch(null);
	}

	static setPref(prefName, value, defaultBranch)
	{
		try 
		{
			let prefBranch = defaultBranch ? this.getDefaultPrefBranch() : this.getPrefBranch();

			switch (typeof value)
			{
				case "string":
					prefBranch.setStringPref(prefName, value);
					break;
				case "number":
					prefBranch.setIntPref(prefName, value);
					break;
				case "boolean":
					prefBranch.setBoolPref(prefName, value);
					break;
				default:
					return;
			}
		} 
		catch (e) 
		{
			throw e;
		}
	}

	static defaultPref(prefName, value)
	{
		this.setPref(prefName, value, true);
	}

	static lockPref(prefName, value)
	{
		try 
		{
			let prefBranch = this.getPrefBranch();

			if (prefBranch.prefIsLocked(prefName))
				prefBranch.unlockPref(prefName);

			this.defaultPref(prefName, value);

			prefBranch.lockPref(prefName);
		} 
		catch (e) 
		{
			throw e;
		}
	}
	
	static unlockPref(prefName)
	{
		try 
		{
			let prefBranch = this.getPrefBranch();

			prefBranch.unlockPref(prefName);
		} 
		catch (e) 
		{
			throw e;
		}
	}

	
	static getPref(prefName) {
		try 
		{
			let prefBranch = this.getPrefBranch();

			switch (prefBranch.getPrefType(prefName)) 
			{
				case prefBranch.PREF_STRING:
					return prefBranch.getStringPref(prefName);
				case prefBranch.PREF_INT:
					return prefBranch.getIntPref(prefName);
				case prefBranch.PREF_BOOL:
					return prefBranch.getBoolPref(prefName);
				default:
					return null;
			}
		} 
		catch (e) 
		{
			throw e;
		}

		return;
	}

	static clearPref(prefName) {
		try
		{
			let prefBranch = this.getPrefBranch();
			prefBranch.clearUserPref(prefName);
		} catch (e) {};
	}
}

export class BrandUtils
{	
	static bundle = Services.strings.createBundle("chrome://branding/locale/brand.properties");

	static getBrandingKey(key)
	{
		return this.bundle.GetStringFromName(key);
	}
}

export class LocaleUtils
{
	static str(bundle, l10nId, ...extra)
    {
        try
        {
            if (arguments.length > 2)
            {
                return Services.strings.createBundle(bundle).formatStringFromName(l10nId, extra);
            }
            else
            {
                return Services.strings.createBundle(bundle).GetStringFromName(l10nId);
            }
        }
        catch (e)
        {
            return "<" + l10nId + ">";
        }
    }
}

export class setAttributes
{
	static set(element, attributes) {
		Object.keys(attributes).forEach(attr => {
			element.setAttribute(attr, attributes[attr]);
		});	
	}

	static remove(element, attributes) {
		Object.keys(attributes).forEach(attr => {
			element.removeAttribute(attr);
		});	
	}
}