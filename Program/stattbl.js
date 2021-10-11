function stattblParseCPT()
{
	$("trigger_output").value += stattblCPT(parseInt($("input_stattbl_player").value), $("inputarea_stattbl_cond").value);
}

function stattblParse()
{
	let result = stattblEdits(parseInt($("input_stattbl_offset").value),
											  parseInt($("input_stattbl_str1").value),
											  parseInt($("input_stattbl_str2").value),
											  $("input_stattbl_content1").value,
											  $("input_stattbl_content2").value);
	$("trigger_output").value += result.triggers;
	$("input_stattbl_offset").value = result.newOffset;
}

function stattblInit()
{
	if($("inputarea_stattbl_cond").value == "" && $("input_stattbl_content1").value == "" && $("input_stattbl_content2").value == "")
	{
		$("inputarea_stattbl_cond").value = "\tSwitch(\"Switch164\", Set);";
		$("input_stattbl_str1").value = "664";
		$("input_stattbl_str2").value = "665";
		$("input_stattbl_content1").value = "m<0><3>M<1>ove";
        $("input_stattbl_content2").value = "s<0><3>S<1>top";
        $("inputarea_stattbl_batch").value = `cpt=false
offset=27380
664=m<0><3>M<1>ove
665="""
s<0><3>S<1>top
"""
`;
	}
	$("parse_stattbl_cpt").onclick = stattblParseCPT;
	$("parse_stattbl").onclick = stattblParse;
    $("parse_stattbl_batch").onclick = stattblBatchParse;
	$("input_stattbl_str1").addEventListener("change", function() {
		let st = parseInt($("input_stattbl_str1").value);
		if(isNaN(st)) {
			return;
		}
		if(st % 1 == 0 && st % 2 != 0) {
			$("input_stattbl_str1").value = st - 1;
			$("input_stattbl_str2").value = st;
		}
		else if(st % 1 == 0 && st % 2 == 0) {
			$("input_stattbl_str2").value = st + 1;
		}
	});
	$("input_stattbl_str2").addEventListener("change", function() {
		let st = parseInt($("input_stattbl_str2").value);
		if(isNaN(st)) {
			return;
		}
		if(st % 1 == 0 && st % 2 == 0) {
			$("input_stattbl_str1").value = st;
			$("input_stattbl_str2").value = st + 1;
		}
		else if(st % 1 == 0 && st % 2 != 0) {
			$("input_stattbl_str1").value = st - 1;
		}
	});
	$("input_stattbl_offset").addEventListener("change", function() {
		let st = parseInt($("input_stattbl_offset").value);
		if(st % 1 == 0 && st % 4 != 0) {
			$("input_stattbl_offset").value = st - st % 4;
		}
	});
}

function stattblGetEncodingSelection() {
	let selected = $("select_stattbl_encoding").selectedIndex;
	if(selected == -1) {
		selected = 0;
	}
	return ["UTF-8", "EUC-KR", "ISO-8859-1"][selected];
}

function stattblCPT(player, cond, includeLastTrigger = true)
{
    // this part will be drastically different, so write individual functions instead of calcTrig()
    switch(getTriggerPattern(TriggerPatterns.NAME)) {
        case "tep":
        case "tepcond":
        return stattblCPTTEP(player, cond, includeLastTrigger);
        case "eud3":
        return stattblCPTEUD3(player, cond, includeLastTrigger);
        case "scmd":
        case "scmdcond":
        default:
        return stattblCPTSCMD(player, cond, includeLastTrigger);
    }
}

function stattblCPTTEP(player, cond, includeLastTrigger = true)
{
    // If newest version still doesn't support MASKED MEMORY I'd just output "NOPE".
    return `Trigger {
    players = {P${player}},
    conditions = {
${cond}
    },
    actions = {
        SetMemory(0x006509b0, SetTo, 4293515047);
    }
}
for i = 31, 2, -1 do
    Trigger {
        players = {P${player}},
        conditions = {
${cond}
            MemoryX(0x006d1238, AtLeast, 2 ^ i, 2 ^ i);
        },
        actions = {
            SetMemory(0x006509b0, Add, 2 ^ (i-2));
        }
    }
end
` + (!includeLastTrigger ? `` : `Trigger {
    players = {P${player}},
    conditions = {
${cond}
    },
    actions = {
        -- PUT YOUR STRING EDIT TRIGGERS HERE --
        SetMemory(0x006509b0, SetTo, ${player-1});
    }
}
`);
}

function stattblCPTEUD3(player, cond, includeLastTrigger = true)
{
	if(!includeLastTrigger) {
		return `setcurpl(EPD(dwread(0x6D1238)));\n`;
	}
    return `setcurpl(EPD(dwread(0x6D1238)));\n// PUT YOUR STRING EDIT TRIGGERS HERE\nsetcurpl(${player-1});\n`;
}

function stattblCPTSCMD(player, cond, includeLastTrigger = true)
{
	var out = "";
	var separ = "\n\n//-----------------------------------------------------------------//\n\n";
	var trgHead = `Trigger("Player ${player}"){
Conditions:
${cond}

Actions:
	MemoryAddr(0x006509b0, Set To, 4293515047);
}
`; // 4293515047 == -(0x58a364)/4 DeathTableStart

	var trgMidS = `Trigger("Player ${player}"){
Conditions:
${cond}
	Masked MemoryAddr(0x006d1238, At least, VAL1, VAL1);

Actions:
	MemoryAddr(0x006509b0, Add, VAL2);
}`;
	var trgMid = Array(30).fill("").map((t,i) => trgMidS.replace(/VAL1/g, 2**(31-i)).replace(/VAL2/g, 2**(29-i))).join(separ);

	var trgTail = `Trigger("Player ${player}"){
Conditions:
${cond}

Actions:
	//--- PUT YOUR STRING EDIT TRIGGERS HERE ---//
	MemoryAddr(0x006509b0, Set To, ${player-1});
}`;

	return trgHead + separ + trgMid + separ + (includeLastTrigger ? trgTail + separ : "");
}

function parseColorCodes(str) {
	return str.replace(/<[0-9a-fA-F]+>/g, function(pat) {
		return String.fromCharCode(parseInt(pat.substring(1, pat.length-1), 16) );
	});
}

function stattblEdits(offset, sp1, sp2, content1, content2) {
	var triggerPattern_1 = getTriggerPattern(TriggerPatterns.MASKED);
	var triggerPattern_op = getTriggerPattern(TriggerPatterns.NORMAL_OP);
	var triggerPattern_cpt = getTriggerPattern(TriggerPatterns.CPT);
    var triggerOp_add = getTriggerPattern(TriggerPatterns.OP_ADD);
    var triggerOp_sub = getTriggerPattern(TriggerPatterns.OP_SUB);

	// SP = StringPointer I regret for having named it STR
	let cptSp = sp1 >>> 1;

	// parse color codes
	content1 = parseColorCodes(content1);
	content2 = parseColorCodes(content2);

	// offset Sp
	let cptContent = offset >>> 2;
	let cptContentNext = 0;

	var buffer1, buffer2;
	var uintarr1 = [], uintarr2 = [];
	if(typeof iconv != "undefined") { // load iconv-lite-browserify to turn iconv on
		let encoding = stattblGetEncodingSelection();
		buffer1 = iconv.encode(content1, encoding);
		buffer2 = iconv.encode(content2, encoding);
		uintarr1 = [...buffer1];
		uintarr2 = [...buffer2];
	}
	else {
		uintarr1 = content1.split("").map(s => s.charCodeAt(0) & 0xFF);
		uintarr2 = content2.split("").map(s => s.charCodeAt(0) & 0xFF);
	}

	// string end
	uintarr1.push(0);
	uintarr2.push(0);
	let uintarrAll = uintarr1.concat(uintarr2);
	while(uintarrAll.length % 4 != 0) {
		uintarrAll.push(0);
	}

	// too long
	if(uintarrAll.length + offset > 0xFFFF) {
		console.error("Cannot exceed string limit (65535)");
		return;
	}

	let uint32arr = [];
	while(uintarrAll.length > 3) {
		let a0 = uintarrAll.splice(0, 4);
		uint32arr.push(a0[0] + (a0[1] << 8) + (a0[2] << 16) + (a0[3] << 24));
	}
	cptContentNext = uint32arr.length - 1;

	// pointer for the second string
	let offset2 = offset + uintarr1.length;
	let offsetDw = offset + (offset2 << 16);

	// part 1
	let out = "";
	out += "\t" + calculateTriggerWithOp(triggerPattern_op, 0x006509b0, triggerOp_add, cptSp, 4);
	out += "\t" + calculateTrigger(triggerPattern_cpt, 0, offsetDw, 4);
	out += "\t" + calculateTriggerWithOp(triggerPattern_op, 0x006509b0, triggerOp_sub, cptSp, 4);

	// part 2
	out += "\t" + calculateTriggerWithOp(triggerPattern_op, 0x006509b0, triggerOp_add, cptContent, 4);
	out += uint32arr.map(val => "\t" + calculateTrigger(triggerPattern_cpt, 0, val, 4))
	                .join("\t" + calculateTriggerWithOp(triggerPattern_op, 0x006509b0, triggerOp_add, 1, 4));
	out += "\t" + calculateTriggerWithOp(triggerPattern_op, 0x006509b0, triggerOp_sub, cptContent + cptContentNext, 4);
	return {
		triggers: out,
		newOffset: offset + (1 + cptContentNext) * 4
	};
}

/*
 * Batch editing format:

   offset=28000
   cpt=true
   664=m<0><3>M<1>ove
   665="""
   Move requires:
     Move research
   """

 */

function stattblParseSettingsString(str) {
	let lines = str.split(/\r?\n/);
	let out = {
		error: false,
		cpt: true,
		offset: 27380,
		stringIDs: [],
		strings: []
	};
	let inQuotation = false;
	let currentQuotation = "";
	for(let i=0; i<lines.length; i++) {
        let line = lines[i].trim();
        if(line.length == 0) {
            continue;
        }
		if(inQuotation) {
			if(line == "\"\"\"") {
				inQuotation = false;
				out.strings.push(currentQuotation);
			}
			else {
				if(currentQuotation.length > 0) {
					currentQuotation += "\n";
				}
				currentQuotation += line;
			}
		}
		else {
			let splitter = line.indexOf("=");
			if(splitter == -1) {
				out.error = true;
				out.errorMessage = `Bad string format: ${line}`;
				return out;
			}
			let id = line.slice(0, splitter);
			let content = line.slice(splitter+1);

			let idInt = parseInt(id);
			if(id.toLowerCase() == "cpt") {
				out.cpt = (content.trim() == "false" || content.trim() == "0") ? false : !!content;
			}
			else if(id.toLowerCase() == "offset") {
				out.offset = parseInt(content);
			}
			else if(isFinite(idInt)) {
				if(content == "\"\"\"") {
					inQuotation = true;
					currentQuotation = "";
					out.stringIDs.push(idInt);
				}
				else {
					out.strings.push(content);
					out.stringIDs.push(idInt);
				}
			}
		}
	}

	if(out.strings.length < out.stringIDs.length) {
		if(inQuotation && out.strings.length == out.stringIDs.length-1) {
			out.strings.append(currentQuotation);
		}
		else {
			out.error = true;
			out.errorMessage = "String Mismatch";
		}
	}

	return out;
}

function stattblPairStrings(ids, strs) {
	let outs = [];
	while(ids.length) {
		let id = ids.shift();
		let str = strs.shift();
		if(id % 2 == 0) {
			if(ids.indexOf(id + 1) == -1) {
				return {
					error: true,
					errorMessage: `Unpaired string: ${id}`
				};
			}
			else {
				let ptr2 = ids.indexOf(id + 1);
				outs.push({
					id: id,
					str: [str, strs[ptr2]]
				});
                ids.splice(ptr2, 1);
                strs.splice(ptr2, 1);
			}
		}
		else {
			if(ids.indexOf(id - 1) == -1) {
				return {
					error: true,
					errorMessage: `Unpaired string: ${id}`
				};
			}
			else {
				let ptr2 = ids.indexOf(id - 1);
				outs.push({
					id: id - 1,
					str: [strs[ptr2], str]
				});
                ids.splice(ptr2, 1);
                strs.splice(ptr2, 1);
			}
		}
	}
	outs = outs.sort((a,b) => a.id - b.id);
	return outs;
}

function stattblCPTForBatch(player, cond) {
	return stattblCPT(player, cond, false);
}

function stattblTailAction(player) {
    switch(getTriggerPattern(TriggerPatterns.NAME)) {
        case "tep":
        case "tepcond":
        return `SetMemory(0x006509b0, SetTo, ${player-1});\n`;
        case "eud3":
        return `setcurpl(${player-1});\n`;
        case "scmd":
        case "scmdcond":
        default:
        return `MemoryAddr(0x006509b0, Set To, ${player-1});\n`;
    }
}

function stattblSliceForBatch(actions, player, conds) {
	if(getTriggerPattern(TriggerPatterns.NAME) == "eud3") {
		return actions;
	}
	return sliceTrigger(player, conds, actions);
}

function stattblBatchEdit(settingsString, player, cond) {
	let settings = stattblParseSettingsString(settingsString);

	if(settings.error) {
		return {
			error: `Error: ${settings.errorMessage}\n`
		};
	}

	let pairedStrings = stattblPairStrings(settings.stringIDs, settings.strings);

	if(pairedStrings.error) {
		return {
			error: `Error: ${pairedStrings.errorMessage}\n`
		};
	}

	let out = settings.cpt ? stattblCPTForBatch(player, cond) : "";
	let triggers = "";
	let currentOffset = settings.offset;
	pairedStrings.forEach(s => {
		let id = s.id;
		let [str1, str2] = s.str;
		let result = stattblEdits(currentOffset, id, id+1, str1, str2);
		triggers += result.triggers;
		currentOffset = result.newOffset;
	});

	triggers += stattblTailAction(player);
	out += stattblSliceForBatch(triggers, `Player ${player}`, cond);

	return {
		triggers: out,
		newOffset: currentOffset
	};
}

function stattblBatchParse()
{
	let result = stattblBatchEdit($("inputarea_stattbl_batch").value,
								  parseInt($("input_stattbl_player").value),
								  $("inputarea_stattbl_cond").value);
	if(result.error) {
		$("trigger_output").value += result.error;
		return;
	}
	$("trigger_output").value += result.triggers;
	$("input_stattbl_offset").value = result.newOffset;
}
