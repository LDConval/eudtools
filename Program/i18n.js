'use strict';

(function(exports, globalScope) {

let document = globalScope.document;
let availableTranslations = [{
    "key": "en",
    "text": "English"
}, {
    "key": "kr",
    "text": "\ud55c\uad6d\uc5b4"
}, {
    "key": "zh-CN",
    "text": "\u4e2d\u6587"
}];

function addScript(file, callback) {
    let scriptElem = document.createElement("script");
    scriptElem.type = "text/javascript";
    scriptElem.src = file;
    scriptElem.charset = "utf-8";
    if(callback) {
    	scriptElem.addEventListener("load", callback);
    }
    document.head.appendChild(scriptElem);
}

async function translatePage(lang) {
	switch(lang) {
		case "kr":
            await Promise.all([
                new Promise((res, rej) => addScript("Data/i18n/eudtools_data_kr.js", res)).then(translateDataList),
                new Promise((res, rej) => addScript("Data/i18n/elements_kr.js", res)).then(translateElements),
            ]);
            new Promise((res, rej) => addScript("Data/i18n/packedTextData_kr.js", res)).then(() => globalScope.populateLibrary());
		return;
		case "zh-CN":
            await Promise.all([
                new Promise((res, rej) => addScript("Data/i18n/eudtools_data_cn.js", res)).then(translateDataList),
                new Promise((res, rej) => addScript("Data/i18n/elements_cn.js", res)).then(translateElements),
            ]);
            new Promise((res, rej) => addScript("Data/i18n/packedTextData_cn.js", res)).then(() => globalScope.populateLibrary());
		return;
		case "en":
		default:
            new Promise((res, rej) => addScript("Data/packedTextData.js", res)).then(() => globalScope.populateLibrary());
		return;
	}
}

function translateElements(evt) {
	if(typeof globalScope.i18nElementsData == "undefined") {
		console.log("elements i18n loading unsuccessful");
		return;
	}
	globalScope.i18nElementsData.forEach(args => {
		let [selectors, textNodeID, text] = args;
		Array.from(document.querySelectorAll(selectors))
		     .map(a => Array.from(a.childNodes).filter(cn => cn.nodeType == document.TEXT_NODE))
		     .forEach(a => {
		     	if(a[textNodeID]) {
		     		a[textNodeID].textContent = text;
		     	}
		     });
	});
    translatePlugins();
    translateExtras();
}

function translateHelpText(evt) {
	if(typeof globalScope.packedTextData == "undefined") {
		console.log("help text i18n loading unsuccessful");
		return;
	}
}

function translateDataList(evt) {
	if(typeof globalScope.i18nDataList == "undefined" || !globalScope.i18nDataList.memorylist) {
		console.log("data list i18n loading unsuccessful");
		return;
	}
    let i18d = globalScope.i18nDataList;

	i18d.memorylist.forEach((k,i) => {
		if(globalScope.memorylist[i]) {
			globalScope.memorylist[i] = k;
		}
	})

    if(i18d.bf_list) {
        globalScope.bf_list = i18d.bf_list;
    }
    if(i18d.datalist) {
        globalScope.datalist = i18d.datalist;
    }
    if(i18d.flagNames) {
        globalScope.flagNames = i18d.flagNames;
    }

    globalScope.categorylist.forEach((c,i) => {
        if(c[2] && i18d.categories[i]) {
            c[2] = i18d.categories[i];
        }
    });
}

function translateAddSettingsElems() {
    document.querySelector("#settings_translate").innerHTML = "";

    availableTranslations.forEach((t,i) => {
        let d = document.createElement("option");
        d.textContent = t.text;
        d.selected = (i == 0);
        document.querySelector("#settings_translate").appendChild(d);
    });

    // since this component desyncs with others it must be loaded here separately
    $Q("#settings_translate").addEventListener("change", translateUpdate);
    $Q("#settings_translate").addEventListener("mousedown", evt => evt.stopPropagation());
}

function translatePlugins() {
    if(typeof globalScope.i18nPluginData == "undefined") {
        console.log("plugin i18n loading unsuccessful");
        return;
    }
    let pluginData = globalScope.i18nPluginData;
    addEventListener("load", function(evt) {
        globalScope.memorylist.forEach(m => {
            if(m[3] == "-----Plugins-----") {
                m[3] = pluginData.separator;
            }
        });
        globalScope.categorylist.forEach(m => {
            if(m[2] == "Plugins") {
                m[2] = pluginData.category;
            }
        });
        try {
            document.querySelector("#category_container .divoption:last-child").textContent = pluginData.category;
        }
        catch(e){}
    });
}

function translateExtras() {
    if(typeof globalScope.i18nExtraData == "undefined") {
        return;
    }
    let extraData = globalScope.i18nExtraData;
    addEventListener("load", function(evt) {
        if(document.querySelector("#inputarea_trigconv").value.toString().substr(0, 8) == "Convert ") {
            document.querySelector("#inputarea_trigconv").value = extraData.converterText;
        }
    });
}

function autoTranslate() {
    try {
        availableTranslations.forEach((t, i) => {
            if(t.key == navigator.language) {
                translatePage(t.key);
                document.querySelector("#settings_translate").selectedIndex = i;
            }
        });
    }
    catch(e){}
}

async function translateInit() {
    translateAddSettingsElems();
    let item;
    if(item = localStorage.getItem("eudscr_language")) {
        if(availableTranslations[item]) {
            await translatePage(availableTranslations[item].key);
            Settings.language = parseInt(item);
        }
    }
    else {
        autoTranslate();
    }
}

function translateUpdate(evt) {
    localStorage.setItem("eudscr_language", document.querySelector("#settings_translate").selectedIndex);
    globalScope.updateSettingsDisplay();
    // translatePage($("settings_translate").selectedIndex);
    location.reload();
}

exports.translateComponentLoaded = true;
exports.translateInit = translateInit;

})(window, window);