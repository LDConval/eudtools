'use strict';

function getHex(num) {
    if(num < 0) {
        num = (num & 0xFFFFFFFF) + 0x100000000;
    }
    return "0x" + num.toString(16).toUpperCase().padStart(6, "0");
}

function finiteOr0(num) {
	return isFinite(num) ? num : 0;
}

function hexStringToUint8Array(hexString) {
	let sanitizedHexString = hexString.replace(/[^0-9a-f]/gi, "");
	let bytes = [];
	for(let i=0; i<sanitizedHexString.length; i+=2) {
		bytes.push(parseInt(sanitizedHexString.substr(i, 2), 16));
	}
	return bytes;
}

function stringToUint8Array(str, encoding = "UTF-8") {
	var arr;
	if(typeof iconv != "undefined") { // load iconv-lite-browserify to turn iconv on
		let buf = iconv.encode(str, encoding);
		arr = [...buf];
	}
	else if(typeof TextEncoder != "undefined") {
		let encoder = new TextEncoder();
		let buf = encoder.encode(str);
		arr = Array.from(buf);
	}
	else {
        throw new Error("Cannot find a text encoder, please check import for iconv library");
	}
	arr.push(0); // null string terminator
	return arr;
}

function scmdString(str) {
	return str.replace(/<[0-9a-fA-F]+>/g, function(pat) {
		return String.fromCharCode(parseInt(pat.substring(1, pat.length-1), 16) );
	}).replace(/\\</g, "<").replace(/\\>/g, ">");
}

function scmdStringToUint8Array(scmdStr, encoding) {
	return stringToUint8Array(scmdString(scmdStr), encoding);
}

function convert3ByteArray(arr) {
	let out = [];
	arr.forEach(a => out = out.concat(dword2bytes(a).slice(0, 3)));
	return out;
}

function parseValueInput(valueInput) {
	const text = valueInput.toString().trim();

	if(text.length == 0) {
		return {
			value : 0,
			isStringValue : false
		};
	}
	else if((text.charAt(0) == "\"" && text.charAt(text.length-1) == "\"")
	|| (text.charAt(0) == "\u201c" && text.charAt(text.length-1) == "\u201d")) {
		// string
		const s = text.substring(1, valueInput.length - 1);
		return {
			value : scmdStringToUint8Array(s),
			isStringValue : true
		};
	}
	else if((text.charAt(0) == "\'" && text.charAt(text.length-1) == "\'")
	|| (text.charAt(0) == "\u2018" && text.charAt(text.length-1) == "\u2019")) {
		// hex string
		const s = text.substring(1, valueInput.length - 1);
		return {
			value : hexStringToUint8Array(s),
			isStringValue : true
		};
	}
	else if(text.indexOf(",") == -1) {
		const val = parseInt(text);
		if(isFinite(val)) {
			return {
				value : val,
				isStringValue : false
			};
		}
		else {
			return {
				error : true,
				value : null,
				isStringValue : false
			};
		}
	}
	else {
		// array
		return {
			value : text.split(",")
						.map(item => parseInt(item))
						.filter(item => isFinite(item)),
			isStringValue : false
		};
	}
}

function numberOrArraySimple(f, reduction = null) {
	if(reduction) {
		return function(v) {
			if(typeof v == 'number') {
				return f(v);
			}
			else {
				return v.map(f).reduce(reduction);
			}
		};
	}
	return function(v) {
		if(typeof v == 'number') {
			return f(v);
		}
		else {
			return v.map(f);
		}
	};
}

// compat
const hexCodeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function toHex(num,ord) {
	if(!isFinite(num)) {
		return toHex(0, ord);
	}
	ord = ord || 16;
	if(num < ord)
	{
		return hexCodeStr.charAt(num);
	}
	else
	{
		return toHex((num - (num % ord)) / ord) + toHex(num % ord);
	}
}

/**
 * Convert text to HTML based in its SCMD colors.
 * Does not support <12> and <13> alignment operations.
 * @param {string} text SCMD-formatted text.
 * @param {boolean} statCut If this flag is set, slices the text as if it was from stat_txt.tbl.
 * @returns {string} HTML string for the colored text.
 */
function colorTextLite(text, statCut) {
	const colorArray = ['','','#B8B8E8','#DCDC3C','#FFFFFF','#847474','#C81818', '#10FC18','#F40404','','','','','','#0C49CC','#2CB494',
	'#87409C','#F88E14','','','','#703014','#CCE0D0','#FCFC38','#088008','#FCFC7C', '' ,'#EBC4B0', '#4067D4','#74A47C','#9090B8','#00E4FC'];
	if(statCut) {
		if(text.substring(1, 3) == "<0" && text.charAt(4) == ">") {
			text = text.substring(5);
		}
		else if(text.substring(1, 2) == "<" && text.charAt(3) == ">") {
			text = text.substring(4);
		}
		else if(text.substring(4, 6) == "<0" && text.charAt(7) == ">") {
			// for "<27><00>" (ESC)
			text = text.substring(8);
		}
		else if(text.charCodeAt(1) < 0x0A) {
			text = text.substring(2);
		}
	}
	let overspans = 0;
	const replaced = text.replace(/<([0-9a-fA-F]{1,4})>/g, function(rep, arg) {
		const hex = parseInt(arg, 16);
		if(hex >= 0x20) {
			return String.fromCodePoint(hex);
		}
		switch(hex) {
			case 0x01:
				if(overspans > 0) {
					overspans -= 1;
					return "</span>";
				}
				return "";
			case 0x02:
			case 0x03:
			case 0x04:
			case 0x05:
			case 0x06:
			case 0x07:
			case 0x08:
			case 0x0E:
			case 0x0F:
			case 0x10:
			case 0x11:
			case 0x14:
			case 0x15:
			case 0x16:
			case 0x17:
			case 0x18:
			case 0x19:
			case 0x1A:
			case 0x1B:
			case 0x1C:
			case 0x1D:
			case 0x1E:
			case 0x1F:
				overspans++;
				return `<span style="color:${colorArray[hex]};">`;
			case 0x09:
				return "\\t";
			case 0x0A:
				return "\\n"; // generate a slash-n in object list, not linebreak it
			case 0x0D:
				return ""; //

			default:
				return "\\x" + arg.toLowerCase();
		}
	})
	return replaced + "</span>".repeat(overspans);
}

/**
 * numberOrArray: Convert a function that accepts number argument(s)
 * to a function that accepts number or Array arguments.
 * @param {function} f A function that accepts multiple number arguments.
 * @param {boolean} returnArray If set, always returns array.
 * @returns {function} A function that accepts number or array for every
 * argument. Returns Number if all arguments for f are numbers && not returnArray,
 * flattened 1-D array otherwise.
 */
function numberOrArray(f, returnArray = false) {
	const _f = function(...v) {
		const ret = [];
		for(let i = 0; i < v.length; i++) {
			if(typeof v[i] !== "number") {
				const a = v[i].map(k => _f(...v.slice(0, i), k, ...v.slice(i + 1)));
				return (returnArray || v.slice(i + 1).some(t => typeof t !== "number"))
					 ? a.reduce((t, a) => t.concat(a), []) // flatten the array if >1 array args
					 : a;
			}
		}
		return returnArray ? [f(...v)] : f(...v);
	};
	return _f;
}

/**
 * parseIntOrArray: parse Int or Array depending on whether the input has a comma
 * @param {string} text Text that represents either a number or an array.
 * @returns {number | Array} Depending on whether the text has a comma, a number or an array.
 */
function parseIntOrArray(text) {
	if(text.indexOf(",") == -1) {
		return parseInt(text);
	}
	else {
		return text.split(",")
				   .map(item => parseInt(item))
				   .filter(item => isFinite(item));
	}
}

function parseFloatOrArray(text) {
	if(text.indexOf(",") == -1) {
		return parseFloat(text);
	}
	else {
		return text.split(",")
				   .map(item => parseFloat(item))
				   .filter(item => isFinite(item));
	}
}

function numberOrArrayOnText(f, returnArray = false) {
	return function(...v) {
		return numberOrArray(f, returnArray)(...v.map(parseIntOrArray));
	};
}

function floatOrArrayOnText(f, returnArray = false) {
	return function(...v) {
		return numberOrArray(f, returnArray)(...v.map(parseFloatOrArray));
	};
}