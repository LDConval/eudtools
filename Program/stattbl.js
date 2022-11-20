'use strict';

(function(exports) {

const StatTblPtr = 0x19184660;

function stattblParse()
{
	let result = stattblEdits(parseInt($I("input_stattbl_offset").value),
											  parseInt($I("input_stattbl_str").value),
											  $I("input_stattbl_content").value);
	$I("trigger_output").value += result.triggers;
	$I("input_stattbl_offset").value = result.newOffset;
}

function stattblInit()
{
	if($I("inputarea_stattbl_batch").value == "")
	{
		$I("input_stattbl_str").value = "664";
		$I("input_stattbl_content").value = "m<0><3>M<1>ove";
        $I("inputarea_stattbl_batch").value = `offset=27380
comment=StatText
664=m<0><3>M<1>ove
665="""
s<0><3>S<1>top
"""
`;
	}
	$I("parse_stattbl").onclick = stattblParse;
    $I("parse_stattbl_batch").onclick = stattblBatchParse;
}

function stattblGetEncodingSelection() {
	let selected = $I("select_stattbl_encoding").selectedIndex;
	if(selected == -1) {
		selected = 0;
	}
	return ["UTF-8", "EUC-KR", "ISO-8859-1"][selected];
}

function parseColorCodes(str) {
	return str.replace(/<[0-9a-fA-F]+>/g, function(pat) {
		return String.fromCharCode(parseInt(pat.substring(1, pat.length-1), 16) );
	});
}

function stattblEdits(offset, sp, content, output = true) {
	// parse color codes
	content = parseColorCodes(content);

	var buffer;
	var uintarr = [];
	if(typeof iconv != "undefined") { // load iconv-lite-browserify to turn iconv on
		let encoding = stattblGetEncodingSelection();

		if(encoding.toLowerCase() == "utf8" || encoding.toLowerCase() == "utf-8") {
			if(content.indexOf("\u2009") == -1) {
				content += "\u2009";
			}
		}

		buffer = iconv.encode(content, encoding);
		uintarr = [...buffer];
	}
	else {
		uintarr = content.split("").map(s => s.charCodeAt(0) & 0xFF);
	}

	// string end
	uintarr.push(0);
	let uintarrAll = uintarr;
	
	const indexOffset = StatTblPtr + 2 * sp;
	let currentOffset = StatTblPtr + offset;

	// too long
	if(uintarrAll.length + offset > 0xFFFF) {
		console.error("Cannot exceed string limit (65535)");
		return;
	}

	// set memory
	updateEUDEngineSettings("act");
	EUDEngine.set(indexOffset, offset, 2);

	for(let i = 0; i < uintarrAll.length; i++) {
		EUDEngine.set(currentOffset, uintarrAll[i], 1);
		currentOffset++;
	}

	return {
		triggers: output ? EUDEngine.output() : null,
		newOffset: currentOffset - StatTblPtr
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
		strings: [],
		comment: "",
		player: 8,
		cond: ""
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
			else if(id.toLowerCase() == "comment") {
				out.comment = content;
			}
			else if(id.toLowerCase() == "player") {
				out.player = parseInt(content);
			}
			else if(id.toLowerCase() == "cond") {
				out.cond = content;
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
		outs.push({
			id: id,
			str: str
		});
	}
	outs = outs.sort((a,b) => a.id - b.id);
	return outs;
}

function stattblCPTForBatch(player, cond, comment = "") {
	return stattblCPT(player, cond, false, comment);
}

function stattblSliceForBatch(actions, player, conds) {
	if(Settings.TriggerStyle >= TriggerStyleEnum.EUD3) {
		return sliceTrigger(0, "", actions);
	}
	return sliceTrigger(player, conds, actions);
}

function stattblBatchEdit(settingsString) {
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

	let out = "";
	let triggers = "";
	let currentOffset = settings.offset;
	pairedStrings.forEach(s => {
		let id = s.id;
		let str = s.str;
		let result = stattblEdits(currentOffset, id, str, false);
		currentOffset = result.newOffset;
	});

	triggers = EUDEngine.output();
	out += stattblSliceForBatch(triggers, settings.player, settings.cond);

	return {
		triggers: out,
		newOffset: currentOffset
	};
}

function stattblBatchParse()
{
	let result = stattblBatchEdit($I("inputarea_stattbl_batch").value);
	if(result.error) {
		$I("trigger_output").value += result.error;
		return;
	}
	$I("trigger_output").value += result.triggers;
	$I("input_stattbl_offset").value = result.newOffset;
}

exports.stattblInit = stattblInit;

})(window);