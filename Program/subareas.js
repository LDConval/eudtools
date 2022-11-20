'use strict';

(function(exports) {

function updateCUnitOffset(offset) {
	$I("input_unitnodehelper_offset").value = offset - 0x59CCA8;
}

function upgToObject() {
	switch(MemData.offset) {
		case 0x58D088:
		case 0x58D2B0:
			MemData.obj = numberOrArrayOnText((player, upg) => (player - 1) * 46 + upg, false) (
				$I("input_upg_player").value, $I("input_upg_uid").value
			);
		break;
		case 0x58CE24:
		case 0x58CF44:
			MemData.obj = numberOrArrayOnText((player, upg) => (player - 1) * 24 + upg, false) (
				$I("input_upg_player").value, $I("input_upg_uid").value
			);
		break;
		case 0x58F278:
		case 0x58F32C:
			MemData.obj = numberOrArrayOnText((player, upg) => (player - 1) * 15 + upg - 46, false) (
				$I("input_upg_player").value, $I("input_upg_uid").value
			);
		break;
		case 0x58F050:
		case 0x58F140:
			MemData.obj = numberOrArrayOnText((player, upg) => (player - 1) * 15 + upg - 24, false) (
				$I("input_upg_player").value, $I("input_upg_uid").value
			);
		break;
	}
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function upgFromObject() {
	let total, bias;
	switch(MemData.offset) {
		case 0x58D088:
		case 0x58D2B0:
			total = 46;
			bias = 0;
		break;
		case 0x58CE24:
		case 0x58CF44:
			total = 24;
			bias = 0;
		break;
		case 0x58F278:
		case 0x58F32C:
			total = 15;
			bias = 46;
		break;
		case 0x58F050:
		case 0x58F140:
			total = 20;
			bias = 24;
		break;
		default:
			return;
	}
	if(typeof MemData.obj == "number" && MemData.obj < 12 * total) {
		let x = MemData.obj % total;
		$I("input_upg_player").value = 1 + (MemData.obj - x) / total;
		$I("input_upg_uid").value = bias + x;
	}
}

function selgroupToObject() {
	MemData.obj = numberOrArrayOnText((player, sel) => (player - 1) * 12 + sel - 1, false) (
		$I("input_selgroup_player").value, $I("input_selgroup_id").value
	);
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function selgroupFromObject() {
	if(typeof MemData.obj == "number" && MemData.obj < 120) {
		const uid = MemData.obj % 12;
		$I("input_selgroup_player").value = 1 + (MemData.obj - uid) / 12;
		$I("input_selgroup_id").value = 1 + uid;
	}
}

function selgroupToValue() {
	MemData.value = parseInt($I("input_selgroup_unit").value) * 336 + 0x59CCA8;
	updateMemoryValue(true);
}

function keygroupToObject() {
	MemData.obj = (parseInt($I("input_keygroup_player").value) - 1) * 216 + parseInt($I("input_keygroup_hotkey").value) * 12 + parseInt($I("input_keygroup_id").value) - 1;
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function keygroupFromObject() {
	if(typeof MemData.obj == "number" && MemData.obj < 216 * 12) {
		const v = MemData.obj % 216;
		const uid = v % 12;
		const kid = ((v - uid) / 12);
		$I("input_keygroup_player").value = 1 + (MemData.obj - v) / 216;
		$I("input_keygroup_hotkey").value = kid;
		$I("input_keygroup_id").value = 1 + uid;
	}
}

function keygroupUnitIndex() {
	$I("input_keygroup_index").value = (parseInt($I("input_keygroup_unit").value) == 0) ? 0 : 1700 - parseInt($I("input_keygroup_unit").value);
	MemData.value = 2049 + parseInt($I("input_keygroup_unit").value);
	updateMemoryValue(true);
}

function keygroupSCMDIndex() {
	$I("input_keygroup_unit").value = (parseInt($I("input_keygroup_index").value) == 0) ? 0 : 1700 - parseInt($I("input_keygroup_index").value);
	MemData.value = 2049 + parseInt($I("input_keygroup_unit").value);
	updateMemoryValue(true);
}

function unitnodehelperToObject() {
	MemData.obj = (parseInt($I("input_unitnodehelper").value) == 0) ? 0 : 1700 - parseInt($I("input_unitnodehelper").value);
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function unitnodehelperFromObject() {
	if(typeof MemData.obj == "number" && MemData.obj < 1700) {
		$I("input_unitnodehelper").value = MemData.obj == 0 ? 0 : 1700 - MemData.obj;
	}
}

function tablesToObject() {
	if(MemData.offset == 0x57F27C) {
		MemData.obj = (parseInt($I("input_tables_player").value) - 1) * 228 + parseInt($I("input_tables_unit").value);
	}
	else {
		MemData.obj = (parseInt($I("input_tables_unit").value)) * 12 + parseInt($I("input_tables_player").value) - 1;
	}
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function tablesFromObject() {
	if(MemData.offset == 0x57F27C) {
		if(typeof MemData.obj == "number" && MemData.obj < 228 * 12) {
			const u = MemData.obj % 228;
			$I("input_tables_player").value = (MemData.obj - u) / 228;
			$I("input_tables_unit").value = u;
		}
	}
	else {
		if(typeof MemData.obj == "number" && MemData.obj < 228 * 12) {
			const p = MemData.obj % 12;
			$I("input_tables_unit").value = (MemData.obj - u) / 12;
			$I("input_tables_unit").value = u;
		}
	}
}

function allianceToObject() {
	MemData.obj = numberOrArrayOnText((p1, p2) => (p1 - 1) * 12 + p2 - 1, false) (
		$I("input_alliance_from").value, $I("input_alliance_to").value
	);
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function allianceFromObject() {
	if(typeof MemData.obj == "number" && MemData.obj < 144) {
		const toId = MemData.obj % 12;
		$I("input_alliance_from").value = 1 + (MemData.obj - toId) / 12;
		$I("input_alliance_to").value = 1 + toId;
	}
}

function dmgmultToObject() {
	MemData.obj = numberOrArrayOnText((p1, p2) => p1 * 5 + p2, false) (
		$I("input_dmgmult_from").value, $I("input_dmgmult_to").value
	);
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function dmgmultFromObject() {
	if(typeof MemData.obj == "number" && MemData.obj < 100) {
		const toId = MemData.obj % 5;
		$I("input_dmgmult_from").value = (MemData.obj - toId) / 5;
		$I("input_dmgmult_to").value = toId;
	}
}

function hpToValue() {
	MemData.value = floatOrArrayOnText(p => Math.round(p * 256), false) (
		$I("input_hp").value
	);
	updateMemoryValue(true);
}

function reqUpdate() {
	let new_offset;
	switch(MemData.offset) {
		case 0x514178:
			new_offset = array_units[$I("input_req").value] || MemData.offset;
			if(array_units[$I("input_req").value] > 0) {
				$I("select_reqwrite_type").selectedIndex = 0;
				$I("input_reqwrite_uid").value = $I("input_req").value;
				$I("input_reqwrite_offset").value = (array_units[$I("input_req").value] - 0x514178) >>> 1;
			}
		break;
		case 0x5145C0:
			new_offset = array_upgrades[$I("input_req").value] || MemData.offset;
			if(array_upgrades[$I("input_req").value] > 0) {
				$I("select_reqwrite_type").selectedIndex = 1;
				$I("input_reqwrite_uid").value = $I("input_req").value;
				$I("input_reqwrite_offset").value = (array_upgrades[$I("input_req").value] - 0x5145C0) >>> 1;
			}
		break;
		case 0x514908:
			new_offset = array_upgtech[$I("input_req").value] || MemData.offset;
			if(array_upgtech[$I("input_req").value] > 0) {
				$I("select_reqwrite_type").selectedIndex = 2;
				$I("input_reqwrite_uid").value = $I("input_req").value;
				$I("input_reqwrite_offset").value = (array_upgtech[$I("input_req").value] - 0x514908) >>> 1;
			}
		break;
		case 0x514A48:
			new_offset = array_usetech[$I("input_req").value] || MemData.offset;
		if(array_usetech[$I("input_req").value] > 0) {
			$I("select_reqwrite_type").selectedIndex = 3;
			$I("input_reqwrite_uid").value = $I("input_req").value;
			$I("input_reqwrite_offset").value = (array_usetech[$I("input_req").value] - 0x514A48) >>> 1;
		}
		break;
		case 0x514CF8:
			new_offset = array_orders[$I("input_req").value] || MemData.offset;
			if(array_orders[$I("input_req").value] > 0) {
				$I("select_reqwrite_type").selectedIndex = 4;
				$I("input_reqwrite_uid").value = $I("input_req").value;
				$I("input_reqwrite_offset").value = (array_orders[$I("input_req").value] - 0x514CF8) >>> 1;
			}
		break;
	}
	MemData.obj = (new_offset - MemData.offset) >>> 1;
	updateMemoryObject(true);
	calculateAndUpdateMemory();
}

function stackTextUpdate() {
	var ts = $I("input_textstack_text").value;
	$I("input_textstack_unit").value = overlapText(ts, 0, 150, true);
	$I("input_textstack_disp").value = overlapText(ts, 1, 619, true);
	$I("input_textstack_objs").value = overlapText(ts, 1, 220, true);
	$I("input_textstack_desc").value = overlapText(ts, 1, 188, true);
}

function attachEvents() {
	$I("input_upg_player").addEventListener("input", evt => { upgToObject(); });
	$I("input_upg_uid").addEventListener("input", evt => { upgToObject(); });

	$I("input_selgroup_player").addEventListener("input", evt => { selgroupToObject(); });
	$I("input_selgroup_id").addEventListener("input", evt => { selgroupToObject(); });

	$I("input_selgroup_unit").addEventListener("input", evt => { selgroupToValue(); });

	$I("input_keygroup_player").addEventListener("input", evt => { keygroupToObject(); });
	$I("input_keygroup_hotkey").addEventListener("input", evt => { keygroupToObject(); });
	$I("input_keygroup_id").addEventListener("input", evt => { keygroupToObject(); });

	$I("input_keygroup_unit").addEventListener("input", evt => { keygroupUnitIndex(); });
	$I("input_keygroup_index").addEventListener("input", evt => { keygroupSCMDIndex(); });

	$I("input_unitnodehelper").addEventListener("input", evt => { unitnodehelperToObject(); });

	$I("input_tables_unit").addEventListener("input", evt => { tablesToObject(); });
	$I("input_tables_player").addEventListener("input", evt => { tablesToObject(); });

	$I("input_alliance_from").addEventListener("input", evt => { allianceToObject(); });
	$I("input_alliance_to").addEventListener("input", evt => { allianceToObject(); });

	$I("input_dmgmult_from").addEventListener("input", evt => { dmgmultToObject(); });
	$I("input_dmgmult_to").addEventListener("input", evt => { dmgmultToObject(); });

	$I("input_hp").addEventListener("input", evt => { hpToValue(); });

	$I("input_req").addEventListener("input", evt => { reqUpdate(); });
	$I("input_textstack_text").addEventListener("input", evt => { stackTextUpdate(); });

	$I("input_textstack_unit").addEventListener("focus", evt => { evt.target.select(); });
	$I("input_textstack_disp").addEventListener("focus", evt => { evt.target.select(); });
	$I("input_textstack_objs").addEventListener("focus", evt => { evt.target.select(); });
	$I("input_textstack_desc").addEventListener("focus", evt => { evt.target.select(); });
	
}

function subareaInit() {
	attachEvents();
}

exports.updateCUnitOffset = updateCUnitOffset;
exports.subareaInit = subareaInit;
exports.subareaFunctions = {
	upg : upgFromObject,
	selgroup : selgroupFromObject,
	keygroup : keygroupFromObject,
	unitnodehelper : unitnodehelperFromObject,
	tables : tablesFromObject,
	alliance : allianceFromObject,
	dmgmult : dmgmultFromObject,
};

})(window);