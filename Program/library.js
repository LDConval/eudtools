'use strict';

(function(exports) {

function addLibraryOption(elem, output, k, v) {
    let opt = $C("div");
    opt.className = "div_option library_option text_mid";
    opt.addEventListener("click", evt => {
        output.value = v;
    });
    opt.textContent = k.replace(".txt", "");
    elem.appendChild(opt);
}

function populateLibrary() {
    if(typeof packedTextData != "object") {
        return;
    }
	const container = $Q("#library_container");
	const textarea = $Q("#library_output");

    const fileList = packedTextData;
    fileList.forEach(file => {
        addLibraryOption(container, textarea, file.name, file.content);
    });

    const dataTypes = ["unitsExt", "weapons", "flingy", "sprites", "images", "upgrades", "techs", "orders", "iscript", "portraits", "icons", "sound"];
    dataTypes.forEach(dt => {
        const dtype = getDataType(dt);
        if(!dtype) {
            return;
        }
        let result;
        if(dtype.keys) {
            result = dtype.items.map((k, i) => `${dtype.keys[i]}, ${k}`).join("\n");
        }
        else {
            result = dtype.items.map((k, i) => `${i}, ${k}`).join("\n");
        }
        addLibraryOption(container, textarea, `DataTypes.${dt}`, result);
    });
}

function showLibrary() {
    $I("library_area").classList.remove("popup_hidden");
    makePopup($I("library_area"));
}

function toggleLibrary() {
    if($I("library_area").classList.contains("popup_hidden")) {
        $I("library_area").classList.remove("popup_hidden");
        makePopup($I("library_area"));
    }
    else {
        $I("library_area").classList.add("popup_hidden");
    }
}

function initLibrary() {
    $Q("#library_toggle").addEventListener("click", evt => toggleLibrary());

    $Q("#library_output").addEventListener("mousedown", evt => evt.stopPropagation());
    $Q("#library_output").addEventListener("mouseup", evt => evt.stopPropagation());
}

exports.initLibrary = initLibrary;
exports.populateLibrary = populateLibrary;
exports.showLibrary = showLibrary;

})(window);