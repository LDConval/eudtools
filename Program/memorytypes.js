'use struct';

/*
 * I know it was a typo but it looks like I can use C structs now so let's try
 *⁪/

typedef struct _SomeJSStruct { // Struct for Unit Dimensions (RECT)
    let left;
    let up;
    let right;
    let unknown0x03;
} SomeJSStruct;

/* Ok, it doesn't work. */

function getActionFromMemoryListOption(memOffset, memLen, memType) {
    let ret = {
        activatedElems : [],
        doNotUpdate : false,
        offset : memOffset,
        len : memLen,
        next : memLen,
        objectInputHandlers : [],
        valueInputHandlers : [],
        activatedFunctions : [] // unitNode playerColors settings plugin flags
    };
	switch(memType) {
        case 0:
            ret.offset = 0;
            ret.len = 0;
            ret.next = 0;
        break;

        case 4: // custom button (deprecated)
            switch(memOffset) {
                case 0x590004:
                case 0x590008:
                    ret.next = 20;
                break;
            }
        break;
        
		case 5: // upgrades
            ret.activatedElems.push("#upg_area");
            ret.objectInputHandlers.push(subareaFunctions.upg);
		break;
        
		case 7: // requirements
            ret.activatedElems.push("#req_area");
            ret.activatedElems.push("#reqwrite_area");
		break;
        
		case 8: // unitnode
            ret.next = 336;
            ret.activatedElems.push("#unitnodehelper_area");
            ret.activatedFunctions.push("unitNode");
            ret.objectInputHandlers.push(subareaFunctions.unitnodehelper);
        break;

        case 9: // locations
        case 10: // buttons
            ret.next = 20;
        break;

        case 11: // for General/Utilities sections
            switch(memOffset) {
                case 0x6D1200:
                    ret.offset = memOffset;
                    ret.activatedElems.push("#icecc_area");
                break;
                case 0x5A4844:
                    ret.offset = 0;
                    ret.activatedElems.push("#etg_area");
                break;
                case 0x64650C:
                    ret.offset = 0;
                    ret.activatedElems.push("#textstack_area");
                break;
                case 0x581D76:
                    ret.offset = memOffset;
                    ret.activatedElems.push("#playercolor_area");
                    ret.activatedFunctions.push("playerColors");
                break;
                case 0x51A280:
                    ret.offset = 0;
                    ret.activatedElems.push("#trigdupl_area");
                break;
                case 0x519E50:
                    ret.offset = 0;
                    ret.activatedElems.push("#trigslice_area");
                break;
                case 0x51398C:
                    ret.offset = 0;
                    ret.activatedElems.push("#trigconv_area");
                break;
                case 0x6D1238:
                    ret.offset = memOffset;
                    ret.activatedElems.push("#stattbl_area");
                break;
                case 0x530A54:
                    ret.offset = 0;
                    ret.activatedElems.push("#toollinks_area");
                break;
            }
        break;

        case 12: // settings
            ret.offset = 0;
            ret.activatedFunctions.push("settings");
        break;

        case 13: // alliance
            ret.activatedElems.push("#alliance_area");
            ret.objectInputHandlers.push(subareaFunctions.alliance);
        break;

        case 14: // selection/hotkey group
            switch(memOffset) {
                case 0x6284E8:
                    ret.activatedElems.push("#selgroup_area");
                    ret.objectInputHandlers.push(subareaFunctions.selgroup);
                break;
                case 0x57FE60:
                    ret.activatedElems.push("#keygroup_area");
                    ret.objectInputHandlers.push(subareaFunctions.keygroup);
                break;
            }
        break;

        case 15: // unit dims
            ret.next = 8;
        break;

        case 16: // display text
            ret.next = 218;
        break;

        case 17: // plugins
            ret.activatedElems.push("#plugin_area");
            ret.activatedFunctions.push("plugin");
        break;

        case 18: // building dims + unit HP x1
            ret.next = 4;
        break;

        case 19: // flags
            ret.activatedElems.push("#flags_area");
            ret.activatedFunctions.push("flags");
        break;

        case 20: // unitnode + flags
            ret.next = 336;
            ret.activatedElems.push("#unitnodehelper_area");
            ret.activatedElems.push("#flags_area");
            ret.activatedFunctions.push("unitNode");
            ret.activatedFunctions.push("flags");
            ret.objectInputHandlers.push(subareaFunctions.unitnodehelper);
        break;

        case 21: // locations + flags
            ret.next = 20;
            ret.activatedElems.push("#flags_area");
            ret.activatedFunctions.push("flags");
        break;

        case 22: // player structure
            ret.next = 36;
        break;

        case 23: // tables
            ret.activatedElems.push("#tables_area");
            ret.objectInputHandlers.push(subareaFunctions.tables);
        break;

        case 24: // damage multiplier
            ret.activatedElems.push("#dmgmult_area");
            ret.objectInputHandlers.push(subareaFunctions.dmgmult);
        break;

        case 25: // scroll speed
            // ret.activatedElems.push("#dmgmult_area");
            // ret.objectInputHandlers.push(subareaFunctions.dmgmult);
        break;

        case 26: // force names
            ret.next = 30;
        break;

        case 28: // hp
        ret.activatedElems.push("#hp_area");
        break;

        case 29: // unitnode + hp
        ret.next = 336;
        ret.activatedElems.push("#unitnodehelper_area");
        ret.activatedElems.push("#hp_area");
        ret.activatedFunctions.push("unitNode");
        break;
    }
    return ret;
}