function slicerParse()
{
	$I("trigger_output").value += sliceTrigger($I("input_trigslice_player").value, $I("inputarea_trigslice_cond").value, $I("inputarea_trigslice_act").value);
}

function slicerInit()
{
	if($I("inputarea_trigslice_cond").value == "" && $I("inputarea_trigslice_act").value == "")
	{
		$I("inputarea_trigslice_act").value = "Actions";
		$I("inputarea_trigslice_cond").value = "Conditions";
	}
	$I("parse_trigslice").onclick = slicerParse;
}

function sliceTrigger(player, cond, actRaw) {
	var preserved = false;
	var preserveSpace = false;
	var comment = "";
	var commentLong = false;
	var out = "";
	var triggerStyle = Settings.triggerStyle;

	let act = actRaw.split(/\r?\n/).map(line => line.trim()).map(line => {
		if(line.toLowerCase().indexOf("preserve trigger") == 0) {
			preserved = true;
			preserveSpace = true;
			return "";
		}
		else if(line.toLowerCase().indexOf("preservetrigger") == 0) {
			preserved = true;
			preserveSpace = false;
			return "";
		}
		else if(/comment *\(\".*\" *\)/i.test(line)) {
			comment = line.match(/\(\"(.*)\" *\)/)[1];
			commentLong = false;
			return "";
		}
		else if(/comment *\(\".*\" *, *0 *, *0 *, *0 *, *0 *, *0\)/i.test(line)) {
			comment = line.match(/\(\"(.*)\" *, *0 *, *0 *, *0 *, *0 *, *0\)/);
			commentLong = true;
			return "";
		}
		return line;
	}).filter(line => line.length > 1);

	let actCount = 64 - (preserved ? 1 : 0) - (comment.length > 0 ? 1 : 0);

	if(triggerStyle == TriggerStyleEnum.TEP) {
		while(act.length) {
			out += "Trigger {\n";
			out += "\tplayers = {" + player + "},\n";
			out += "\tconditions = {\n";
			out += cond + "\n";
			out += "\t},\n";
			out += "\tactions = {\n";
			out += act.splice(0, actCount).map(line => "\t\t" + line).join("\n") + "\n";
			if(preserved && preserveSpace) {
				out += "\t\tPreserve Trigger();\n";
			}
			else if(preserved && !preserveSpace) {
				out += "\t\tPreserveTrigger();\n";
			}
			if(comment.length > 0 && commentLong) {
				out += "\t\tComment(\"" + comment + "\", 0, 0, 0, 0, 0);\n";
			}
			else if(comment.length > 0 && !commentLong) {
				out += "\t\tComment(\"" + comment + "\");\n";
			}
			out += "\t},\n";
			out += "}\n\n";
		}

	}
	else if(triggerStyle == TriggerStyleEnum.EUD3) {
		const condConnected = cond.split("\n").map(line => line.trim().replace(/;$/, "")).join("\n&& ");
		let indent = "";
		if(condConnected.length > 1 && condConnected != "Conditions") {
			out += "if(";
			out += cond + ") {\n";
			indent += "\t";
		}
		out += indent + "DoActions(\n";
		out += act.map(line => indent + "\t" + line.trim().replace(/;$/, ","))
				  .join("\n")
				  .replace(/,$/, "") + "\n";
		out += indent + ");\n";
	}
	else {
		const condIndented = cond.split("\n").map(line => "\t" + line.trim()).join("\n");
		while(act.length) {
			out += "Trigger(\"" + player + "\"){\n";
			out += "Conditions:\n";
			out += condIndented + "\n";
			out += "Actions:\n";
			out += act.splice(0, actCount).map(line => "\t" + line).join("\n") + "\n";
			if(preserved && preserveSpace) {
				out += "\tPreserve Trigger();\n";
			}
			else if(preserved && !preserveSpace) {
				out += "\tPreserveTrigger();\n";
			}
			if(comment.length > 0 && commentLong) {
				out += "\tComment(\"" + comment + "\", 0, 0, 0, 0, 0);\n";
			}
			else if(comment.length > 0 && !commentLong) {
				out += "\tComment(\"" + comment + "\");\n";
			}
			out += "}\n\n";
			out += "//-----------------------------------------------------------------//\n\n";
		}
	}
	return out;
}