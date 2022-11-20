'use strict';

(function(exports) {

function updateObjectList(dataList, callback) {
    // still fastest way to clear a container!
    const container = $Q("#object_container");
    container.innerHTML = "";

    for(let i = 0; i < dataList.items.length; i++) {
        const dataItem = $C("div");
        dataItem.classList.add("div_option");
        dataItem.classList.add("option_object");
        if(dataList.color) {
            dataItem.classList.add("text_mid_type2");
        }
        else {
            dataItem.classList.add("text_mid");
        }
        if(!dataList.keys) {
            dataItem.addEventListener("click", callback.bind(null, i));
            if(dataList.color) {
                dataItem.innerHTML = `[${i}] ${colorTextLite(dataList.items[i], dataList.isStatTbl)}`;
            }
            else {
                dataItem.textContent = `[${i}] ${dataList.items[i]}`;
            }
        }
        else {
            dataItem.addEventListener("click", callback.bind(null, dataList.keys[i]));
            if(dataList.color) {
                dataItem.innerHTML = `[${dataList.keys[i]}] ${colorTextLite(dataList.items[i], dataList.isStatTbl)}`;
            }
            else {
                dataItem.textContent = `[${dataList.keys[i]}] ${dataList.items[i]}`;
            }
        }
        container.appendChild(dataItem);
    }

    if(dataList.items.length >= 1) {
        container.classList.add("gr_object_selection_filled");
    }
}

function clearObjectList() {
    const container = $Q("#object_container");
    container.innerHTML = "";

    container.classList.remove("gr_object_selection_filled");
}
    
function evtSendToObject(val, evt) {
    if(evt.shiftKey) {
        if(MemData.obj === val) {
            return;
        }
        if(typeof MemData.obj == "number") {
            MemData.obj = [MemData.obj];
        }
        if(MemData.obj.indexOf(val) == -1) {
            MemData.obj.push(val);
        }
    }
    else if(evt.altKey) {
        if(MemData.obj === val) {
            MemData.obj = 0;
        }
        else if(typeof MemData.obj == "number") {
            return;
        }
        if(MemData.obj.indexOf(val) != -1) {
            MemData.obj.splice(MemData.obj.indexOf(val), 1);
            if(MemData.obj.length == 1) {
                MemData.obj = MemData.obj[0];
            }
        }
    }
    else {
        MemData.obj = val;
    }
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function evtSendToValue(val, evt) {
    bindInputValue();
    if(evt.shiftKey) {
        if(MemData.value === val || MemData.isStringValue) {
            return;
        }
        if(typeof MemData.value == "number") {
            MemData.value = [MemData.value];
        }
        if(MemData.value.indexOf(val) == -1) {
            MemData.value.push(val);
        }
    }
    else if(evt.altKey) {
        if(MemData.isStringValue) {
            return;
        }
        if(MemData.value === val) {
            MemData.value = 0;
        }
        else if(typeof MemData.value == "number") {
            return;
        }
        if(MemData.value.indexOf(val) != -1) {
            MemData.value.splice(MemData.value.indexOf(val), 1);
            if(MemData.value.length == 1) {
                MemData.value = MemData.value[0];
            }
        }
    }
    else {
        MemData.value = val;
    }
	updateMemoryValue(true);
}

function evtObjectCheck(evt) {
    const dt = getObjectTypeFromOffset(MemData.offset);

    // elegantly falls back if DataTypes fails to initialize.
    if(dt) {
        updateObjectList(dt, evtSendToObject);
    }
    else {
        clearObjectList();
    }
}

function evtValueCheck(evt) {
    const dt = getValueTypeFromOffset(MemData.offset);

    // elegantly falls back if DataTypes fails to initialize.
    if(dt) {
        updateObjectList(dt, evtSendToValue);
    }
    else {
        clearObjectList();
    }
}

function evtUpgrLevelCheck(evt) {
    let dt;
    switch(MemData.offset) {
        case 0x58D088:
        case 0x58D2B0:
        case 0x58D4D8:
        case 0x58D520:
        case 0x59D568:
            dt = getDataType("upgradesVanilla");
        break;
        case 0x58CE24:
        case 0x58CF44:
        case 0x58d064:
            dt = getDataType("techsVanilla");
        break;
        case 0x58F278:
        case 0x58F32C:
        case 0x58f3e0:
            dt = getDataType("upgradesBroodwar");
        break;
        case 0x58F050:
        case 0x58F140:
        case 0x58f230:
            dt = getDataType("techsBroodwar");
        break;
    }
    const elem = $Q("#input_upg_uid");
    updateObjectList(dt, val => {
        elem.value = val;
        // dispatch the input event, so it could update other things
        elem.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true
        }));
    });
}

function updateElemValue(elem, val, shiftKey = false, altKey = false) {
    if(evt.shiftKey) {
        const elemVals = elem.value.split(",").map(v => parseInt(v.trim()));
        if(elemVals.indexOf(val) == -1) {
            elemVals.push(val);
        }
        elem.value = elemVals.join(", ");
    }
    else if(evt.altKey) {
        const elemVals = elem.value.split(",").map(v => parseInt(v.trim()));
        if(elemVals.indexOf(val) != -1) {
            elemVals.splice(elemVals.indexOf(val), 1);
            if(elemVals.length == 0) {
                elemVals.push(0);
            }
        }
        elem.value = elemVals.join(", ");
    }
    else {
        elem.value = val;
    }
}

function evtReqCheck(evt) {
    let dt;
    switch(MemData.offset) {
        case 0x514178:
            dt = getDataType("units");
        break;
        case 0x514908:
        case 0x514A48:
            dt = getDataType("techs");
        break;
        case 0x5145C0:
            dt = getDataType("upgrades");
        break;
        case 0x514CF8:
            dt = getDataType("orders");
        break;
    }
    const elem = $Q("#input_req");
    updateObjectList(dt, val => {
        updateElemValue(elem, val, evt.shiftKey, evt.altKey);
        // dispatch the input event, so it could update other things
        elem.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true
        }));
    });
}

function evtSpecialBindCheck(checkType, evt) {
    const dt = getDataType(checkType);
    const elem = evt.target;
    updateObjectList(dt, val => {
        updateElemValue(elem, val, evt.shiftKey, evt.altKey);
        // dispatch the input event, so it could update other things
        elem.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true
        }));
    });
}

function initDataCheck() {
    $Q("#input_object").addEventListener("focus", evtObjectCheck);
    $Q("#input_value").addEventListener("focus", evtValueCheck);

    // special checks
    $Q("#input_upg_uid").addEventListener("focus", evtUpgrLevelCheck);
    $Q("#input_req").addEventListener("focus", evtReqCheck);
    $Q("#input_tables_unit").addEventListener("focus", evtSpecialBindCheck.bind(null, "units"));
    $Q("#input_dmgmult_from").addEventListener("focus", evtSpecialBindCheck.bind(null, "weaponsDamageType"));
    $Q("#input_dmgmult_to").addEventListener("focus", evtSpecialBindCheck.bind(null, "unitsSize"));
}

exports.initDataCheck = initDataCheck;
    
})(window);