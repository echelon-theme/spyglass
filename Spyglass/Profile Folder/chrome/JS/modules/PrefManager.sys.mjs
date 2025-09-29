export class PrefManager
{
	root = null;
	prefs = [];

	_prefToAttr(pref)
	{
		return pref.replace(/\./g, "-").toLowerCase();
	}

	_updatePref(pref)
	{
		switch (Services.prefs.getPrefType(pref))
		{
			case Services.prefs.PREF_BOOL:
				Services.prefs.getBoolPref(pref, false)
				? this.root.setAttribute(this._prefToAttr(pref), "true")
				: this.root.removeAttribute(this._prefToAttr(pref));
				break;
			case Services.prefs.PREF_INT:
				this.root.setAttribute(
					this._prefToAttr(pref),
					String(Services.prefs.getIntPref(pref, 0))
				);
				break;
			case Services.prefs.PREF_STRING:
				this.root.setAttribute(
					this._prefToAttr(pref),
					Services.prefs.getStringPref(pref, "")
				);
				break;
		}
	}

	observe(subject, topic, data)
	{
		if (topic == "nsPref:changed" && this.prefs && this.prefs.includes(data))
		{
			this._updatePref(data);
		}
	}
	
	constructor(root, prefs)
	{
		this.root = root;
		if (!root)
		{
			throw new Error("Root not specified");
		}

		this.prefs = prefs;
		if (!prefs || !Array.isArray(prefs) || prefs.length <= 0)
		{
			throw new Error("Prefs not specified or is not array");
		}

		for (const pref of this.prefs)
		{
			this._updatePref(pref);
		}

		/* observe must be manually bound when passing or else its this is incorrect */
		Services.prefs.addObserver(null, this.observe.bind(this));
	}
}