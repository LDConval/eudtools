
var currentHighlight = null;
var currentHighlight2 = null;
var currentHighlightBF = null;
var currentHighlightCategory = null;
var currentSelected = 0;
var isDataExpanded = false;
var DeathTableStart = 0x58A364;

var Settings = {
    "useMasked" : true,
    "triggerStyle" : 0,
    "hexOutputMemory" : 0,
    "hexOutputValue" : 0,
    "hexOutputMask" : 0
};

function calcMemory(offs,uid,len)
{
	len = len || 1;
	return offs + len * uid;
}
function calcMemoryDeaths(offs,uid,len)
{
	uid = uid || 0;
	len = len || 1;
	var mm = offs + len * uid;
	if(mm >= DeathTableStart)
	{
		mm -= DeathTableStart;
		var mt = mm % 4;
		mm >>= 2;
		var play = mm % 12;
		var unit = (mm - play) / 12;
		return [unit,play+1,(1<<(8*mt))];
	}
	else
	{
		return [0,0,0];
	}
}
function uint8ArrayTriggers(patternNormal, patternMask, offset, arr) {
	return uintArrayTriggers(patternNormal, patternMask, offset, arr, 8);
}
function uint16ArrayTriggers(patternNormal, patternMask, offset, arr) {
	return uintArrayTriggers(patternNormal, patternMask, offset, arr, 16);
}
function uint32ArrayTriggers(patternNormal, patternMask, offset, arr) {
	return uintArrayTriggers(patternNormal, patternMask, offset, arr, 32);
}
function int32ArrayTriggers(patternNormal, patternMask, offset, arr) {
	return uintArrayTriggers(patternNormal, patternMask, offset, arr, 32);
}
function uintArrayTriggers(patternNormal, patternMask, offset, arr, bitLength) {
	let out = "";
	let mask = 0;
	let value = 0;
	let byteShift = 0;
	let currentOffset = offset;
	var baseMask, step;

	const borderMasks16 = [0, 0xFFFFFF00, 0, 0xFF000000];
	const borderMasks32 = [0, 0xFFFFFF00, 0xFFFF0000, 0xFF000000];

	// uint8 or uint16 or (u)int32
	if(bitLength == 8) {
		baseMask = 0xFF;
		step = 1;
	}
	else if(bitLength == 16) {
		baseMask = 0xFFFF;
		step = 2;
		if(currentOffset % 2 != 0) {
			let prefixOffset = currentOffset - currentOffset % 4;
			let prefixValue = (currentOffset % 4 == 1) ? words2dword(...arr.splice(0, 2)) : arr.shift();
			out += calculateTrigger(patternMask, prefixOffset, prefixValue, 4, true, borderMasks16[currentOffset % 4]);
			currentOffset = currentOffset - currentOffset % 4 + 4;
		}
	}
	else {
		baseMask = 0xFFFFFFFF;
		step = 4;
		if(currentOffset % 4 != 0) {
			let prefixOffset = currentOffset - currentOffset % 4;
			let prefixValue = arr.shift();
			out += calculateTrigger(patternMask, prefixOffset, prefixValue, 4, true, borderMasks32[currentOffset % 4]);
			currentOffset = currentOffset - currentOffset % 4 + 4;
		}
	}
	// beginning
	let locatedOffset = currentOffset - currentOffset % 4;
	while((byteShift = currentOffset % 4) != 0 && arr.length > 0) {
		mask |= baseMask << (8 * byteShift);
		value |= arr.shift() << (8 * byteShift);
		currentOffset += step;
	}
	if(mask != 0) {
		out += calculateTrigger(patternMask, locatedOffset, value, 4, true, mask);
	}
	// middle
	if(bitLength == 8) {
		while(arr.length >= 4) {
			value = bytes2dword(...arr.splice(0, 4));
			out += calculateTrigger(patternNormal, currentOffset, value, 4, true);
			currentOffset += 4;
		}
	}
	else if(bitLength == 16) {
		while(arr.length >= 2) {
			value = words2dword(...arr.splice(0, 2));
			out += calculateTrigger(patternNormal, currentOffset, value, 4, true);
			currentOffset += 4;
		}
	}
	else {
		while(arr.length >= 1) {
			value = arr.shift();
			out += calculateTrigger(patternNormal, currentOffset, value, 4, true);
			currentOffset += 4;
		}
	}
	// end
	mask = 0;
	value = 0;
	byteShift = 0;
	locatedOffset = currentOffset;
	while(arr.length > 0) {
		mask |= baseMask << (8 * byteShift);
		value |= arr.shift() << (8 * byteShift);
		currentOffset += step;
		byteShift += step;
	}
	if(mask != 0) {
		out += calculateTrigger(patternMask, locatedOffset, value, 4, true, mask);
	}
	return out;
}
function hexStringTriggers(patternNormal, patternMask, offset, hexString) {
	return uint8ArrayTriggers(patternNormal, patternMask, offset, hexStringToUint8Array(hexString));
}
function hexStringToUint8Array(hexString) {
	let sanitizedHexString = hexString.replace(/[^0-9a-f]/gi, "");
	let bytes = [];
	for(let i=0; i<sanitizedHexString.length; i+=2) {
		bytes.push(parseInt(sanitizedHexString.substr(i, 2), 16));
	}
	return bytes;
}
function stringToUint8Array(str, encoding) {
	encoding = encoding || "UTF-8";
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
		arr = str.split("").map(c => c.charCodeAt(0));
	}
	arr.push(0); // null string terminator
	return arr;
}
function scmdStringToUint8Array(scmdStr, encoding) {
	return stringToUint8Array(scmdString(scmdStr), encoding);
}
function scmdString(str) {
	return str.replace(/<[0-9a-fA-F]+>/g, function(pat) {
		return String.fromCharCode(parseInt(pat.substring(1, pat.length-1), 16) );
	}).replace(/\\</g, "<").replace(/\\>/g, ">");
}
function convert3ByteArray(arr) {
	let out = [];
	arr.forEach(a => out = out.concat(dword2bytes(a).slice(0, 3)));
	return out;
}
function leftPad(str, n, pad) {
	return pad.repeat(Math.max(0, n-str.length)) + str;
}

function swapHighlight(newElem, oldElem) {
	if(oldElem)
	{
		oldElem.classList.remove("highlight");
	}
	newElem.classList.add("highlight");
}

function useCategory(k, evt)
{
	// select category
	evt = evt || window.event;
	var optDiv = evt.srcElement || evt.target;

	var handler = useOption;

	while(document.querySelector("#select_container>.select_memory")) {
		$("select_container").removeChild(document.querySelector("#select_container>.select_memory"));
	}
	var divSelect = document.createElement("div");
	divSelect.className = "divselect select_memory";
	for(var i=categorylist[k][0];i<categorylist[k][1];i++)
	{
		var opt = document.createElement("div");
		opt.className = "divoption option_memory";
		opt.optionID = i;
		opt.onclick = handler;
		if(memorylist[i][3].length == 0)
		{
			opt.style.height = "1em";
		}
		opt.innerHTML = memorylist[i][3];
		divSelect.appendChild(opt);
	}
	$("select_container").appendChild(divSelect);

	swapHighlight(optDiv, currentHighlightCategory);
	currentHighlightCategory = optDiv;
}
function hideExtraAreas() {
	$("upg_area").style.display = "none";
	$("selgroup_area").style.display = "none";
	$("keygroup_area").style.display = "none";
	$("unitnodehelper_area").style.display = "none";
	$("tables_area").style.display = "none";
	$("req_area").style.display = "none";
	$("buttonfunction_area").style.display = "none";
	$("icecc_area").style.display = "none";
	$("etg_area").style.display = "none";
	$("textstack_area").style.display = "none";
	$("trigdupl_area").style.display = "none";
	$("trigslice_area").style.display = "none";
	$("playercolor_area").style.display = "none";
	$("trigconv_area").style.display = "none";
	$("stattbl_area").style.display = "none";
	$("reqwrite_area").style.display = "none";
	$("flags_area").style.display = "none";
	$("toollinks_area").style.display = "none";
	$("plugin_area").style.display = "none";
	$("settings_floating").style.display="none";

	if(typeof allPlugins == "object") {
		for(let i in allPlugins) {
			if(allPlugins[i].area) {
				allPlugins[i].area.style.display = "none";
			}
		}
	}
}
function useOption(evt)
{
	evt = evt || window.event;
	var optDiv = evt.srcElement || evt.target;
	var optID = optDiv.optionID;
	currentSelected = optID;
	let memoryType = memorylist[optID][2];

	if(memoryType != 12) {
		hideExtraAreas();
	}

	switch(memoryType)
	{
		case 0:
		$("input_offset").value = 0;
		$("input_length").value = 0;
		$("input_memory").value = 0;
		break;
		case 1:
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		break;
		case 4: // function select involved
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		$("buttonfunction_area").style.display = "block";
		switch(memorylist[optID][0])
		{
			case 0x590004:
			createSelectAreaBF(useOptionBF,0);
			$("input_length").value = memorylist[optID][1] + "/20";
			break;
			case 0x590008:
			createSelectAreaBF(useOptionBF,1);
			$("input_length").value = memorylist[optID][1] + "/20";
			break;
			case 0x5193A4:
			createSelectAreaBF(useOptionBF,2);
			break;
			case 0x5193A8:
			createSelectAreaBF(useOptionBF,3);
			break;
		}
		break;
		case 5: // upgrades
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		$("upg_area").style.display = "block";
		break;
		case 6: // special ability flags (unused)
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		// $("saf_floating").style.display = "block";
		break;
		case 7: // requirements
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		$("input_req").value = 0;
		$("req_area").style.display = "block";
		$("reqwrite_area").style.display = "block";
		break;
		case 8: // unitnode
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/336";
		$("unitnodehelper_area").style.display = "block";
		break;
		case 9: // locations
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/20";
		break;
		case 10: // buttons
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/20";
		break;
		case 11: // for General/Utilities sections
		$("input_length").value = memorylist[optID][1];
		switch(memorylist[optID][0])
		{
			case 0x6D1200:
			$("input_offset").value = memorylist[optID][0];
			$("icecc_area").style.display = "block";
			break;
			case 0x5A4844:
			$("input_offset").value = 0;
			$("etg_area").style.display = "block";
			break;
			case 0x64650c:
			$("input_offset").value = memorylist[optID][0];
			$("textstack_area").style.display = "block";
			break;
			case 0x581D76:
			$("input_offset").value = memorylist[optID][0];
			playerColorsCall();
			break;
			case 0x51A280:
			$("input_offset").value = 0;
			$("trigdupl_area").style.display = "block";
			break;
			case 0x519E50:
			$("input_offset").value = 0;
			$("trigslice_area").style.display = "block";
			break;
			case 0x51398C:
			$("input_offset").value = 0;
			$("trigconv_area").style.display = "block";
			break;
			case 0x6D1238:
			$("input_offset").value = 0;
			$("stattbl_area").style.display = "block";
			break;
			case 0x530A54:
			$("input_offset").value = 0;
			$("toollinks_area").style.display = "block";
			break;
		}
		break;
		case 12: // settings
		$("settings_floating").style.display = "block";
		break;
		case 13: // player alliance self
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/13";
		break;
		case 14: // selection/hotkey group
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		switch(memorylist[optID][0]) {
			case 0x6284E8:
			$("selgroup_area").style.display = "block";
			break;
			case 0x57FE60:
			$("keygroup_area").style.display = "block";
			break;
		}
		break;
		case 15: // unit dims
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/8";
		break;
		case 16: // display text
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/218";
		break;
		case 17: // plugins
		if(typeof allPlugins == "object" && allPlugins[memorylist[optID][0]]) {
			$("plugin_area").style.display = "block";
			if(typeof allPlugins[memorylist[optID][0]].resetOffset != "undefined") {
				$("input_offset").value = allPlugins[memorylist[optID][0]].resetOffset;
			}
			else {
				$("input_offset").value = memorylist[optID][0];
			}
			$("input_length").value = memorylist[optID][1];
			if(allPlugins[memorylist[optID][0]].act) {
				allPlugins[memorylist[optID][0]].act();
			}
			if(allPlugins[memorylist[optID][0]].area) {
				allPlugins[memorylist[optID][0]].area.style.display = "block";
			}
		}
		break;
		case 18: // building dims + unit HP x1
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/4";
		break;
		case 19: // flags
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		$("flags_area").style.display = "block";
		flagsCall();
		break;
		case 20: // unitnode + flags
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/336";
		$("unitnodehelper_area").style.display = "block";
		$("flags_area").style.display = "block";
		flagsCall();
		break;
		case 21: // locations + flags
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/20";
		$("flags_area").style.display = "block";
		flagsCall();
		break;
		case 22: // player structure
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1] + "/36";
		break;
		case 23: // tables
		$("input_offset").value = memorylist[optID][0];
		$("input_length").value = memorylist[optID][1];
		$("tables_area").style.display = "block";
		break;
		default:
	}
	swapHighlight(optDiv, currentHighlight);
	currentHighlight = optDiv;
	updateMemory();
}
async function useOption2(evt) // for filelist
{
	evt = evt || window.event;
	var optDiv = evt.srcElement || evt.target;
	var optID = optDiv.optionID;
	if(datalist[optID][1] == "") // CLS / for incomplete stuff
	{
		$("data_output").value = "";
	}
    else if(typeof packedTextData != 'undefined') {
		var fr = packedTextData[datalist[optID][1]];
		$("data_output").value = fr;
		if(datalist[optID][2]) { // font size
			$("data_output").style.fontSize = datalist[optID][2];
		}
    }
	else
	{
		var fr = await fetch("Data\\" + datalist[optID][1]).then(res => res.text());
		$("data_output").value = fr;
		if(datalist[optID][2]) { // font size
			$("data_output").style.fontSize = datalist[optID][2];
		}
	}
	swapHighlight(optDiv, currentHighlight2);
	currentHighlight2 = optDiv;
}
function useOptionBF(evt) // for button functions
{
	evt = evt || window.event;
	var optDiv = evt.srcElement || evt.target;
	var optID = optDiv.optionID;
	var selID = optDiv.selectID;
	$("input_value").value = bf_list[selID][optID][0];
	swapHighlight(optDiv, currentHighlightBF);
	currentHighlightBF = optDiv;
}
function createCategoryArea(handler)
{
	var divSelect = document.createElement("div");
	divSelect.className = "divselect select_category";
	for(var i=0;i<categorylist.length;i++)
	{
		var opt = document.createElement("div");
		opt.className = "divoption option_category";
		opt.optionID = i;
		opt.onclick = handler.bind(null, i);
		if(categorylist[i][2].length == 0)
		{
			opt.style.height = "1em";
		}
		opt.textContent = categorylist[i][2];
		divSelect.appendChild(opt);
	}
	$("category_container").appendChild(divSelect);
}
function createSelectArea(handler)
{
	var divSelect = document.createElement("div");
	divSelect.className = "divselect select_memory";
	for(var i=0;i<memorylist.length;i++)
	{
		var opt = document.createElement("div");
		opt.className = "divoption option_memory";
		opt.optionID = i;
		opt.onclick = handler;
		if(memorylist[i][3].length == 0)
		{
			opt.style.height = "1em";
		}
		opt.innerHTML = memorylist[i][3];
		divSelect.appendChild(opt);
	}
	$("select_container").appendChild(divSelect);
}
function createSelectArea2(handler) // for filelist
{
	var divSelect = document.createElement("div");
	divSelect.className = "divselect select_data";
	for(var i=0;i<datalist.length;i++)
	{
		var opt = document.createElement("div");
		opt.className = "divoption option_data";
		opt.optionID = i;
		opt.onclick = handler;
		opt.innerHTML = datalist[i][0];
		divSelect.appendChild(opt);
	}
	$("select_container").appendChild(divSelect);
}
function createSelectAreaBF(handler,bf_type) // for button fuctions
{
	currentHighlightBF = null;
	while($("buttonfunction_select_container").hasChildNodes()) // delete original select element if exists.
	{
		$("buttonfunction_select_container").removeChild($("buttonfunction_select_container").firstChild);
	}
	var divSelect = document.createElement("div");
	divSelect.className = "divselect select_bf";
	for(var i=0;i<bf_list[bf_type].length;i++)
	{
		var opt = document.createElement("div");
		opt.className = (i%2)?"divoption option_bf1":"divoption option_bf2"
		opt.selectID = bf_type;
		opt.optionID = i;
		opt.onclick = handler;
		opt.innerHTML = bf_list[bf_type][i][1];
		divSelect.appendChild(opt);
	}
	$("buttonfunction_select_container").appendChild(divSelect);
}
function shimDataTexts() {
	if(true) {
		// location.protocol.toString().indexOf("file") != -1
		// always preload text to reduce data transfers
		addScript("Data/packedTextData.js");
	}
}
function updateMemory()
{
	var inpLength = 0;
	if($("input_length").value.indexOf("/") == -1) {
		inpLength = parseInt($("input_length").value);
	}
	else {
		let splitInpLength = $("input_length").value.split("/");
		inpLength = parseInt(splitInpLength[splitInpLength.length-1]);
	}
	var memval = calcMemory(parseInt($("input_offset").value),parseInt($("input_object").value),inpLength);
	$("input_memory").value = memval;
	$("input_hex").value = toHex(memval);
}
function delayUpdate()
{
	setTimeout(updateMemory,25);
}
function selectMe(evt)
{
	evt = evt || window.event;
	var optDiv = evt.srcElement || evt.target;
	optDiv.select();
}
var hexCodeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function toHex(num,ord)
{
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
function settingsUpdate() {
	var useMasked = !$("settings_useaddsub").checked;
	if(useMasked) {
		$("label_origvalue").style.display = "none";
		$("input_origvalue").style.display = "none";
	}
	else {
		$("label_origvalue").style.display = "block";
		$("input_origvalue").style.display = "block";
	}
	Settings.useMasked = useMasked;
    var selectedIndex;
	selectedIndex = $("settings_triggerstyle").selectedIndex;
	Settings.triggerStyle = (selectedIndex == -1) ? 0 : selectedIndex;
	selectedIndex = $("settings_hexoutput_memory").selectedIndex;
	Settings.hexOutputMemory = (selectedIndex == -1) ? 0 : selectedIndex;
	selectedIndex = $("settings_hexoutput_value").selectedIndex;
	Settings.hexOutputValue = (selectedIndex == -1) ? 0 : selectedIndex;
	selectedIndex = $("settings_hexoutput_mask").selectedIndex;
	Settings.hexOutputMask = (selectedIndex == -1) ? 0 : selectedIndex;
	if(getTranslateComponentStatus()) {
		selectedIndex = $("settings_translate").selectedIndex;
		Settings.translate = (selectedIndex == -1) ? 0 : selectedIndex;
	}
	saveSettings();
}
function saveSettings() {
	try {
		localStorage.setItem("eudscr_usemasked", $("settings_useaddsub").checked ? "0" : "1");
		localStorage.setItem("eudscr_triggerstyle", $("settings_triggerstyle").selectedIndex);
		localStorage.setItem("eudscr_hexoutput_memory", $("settings_hexoutput_memory").selectedIndex);
		localStorage.setItem("eudscr_hexoutput_value", $("settings_hexoutput_value").selectedIndex);
		localStorage.setItem("eudscr_hexoutput_mask", $("settings_hexoutput_mask").selectedIndex);
		if(getTranslateComponentStatus()) {
			localStorage.setItem("eudscr_translate", $("settings_translate").selectedIndex);
		}
	}
	catch(e){}
}
function loadSettings() {
	try {
		var item;
		if(item = localStorage.getItem("eudscr_usemasked")) {
			$("settings_useaddsub").checked = !(item == "1");
		}
		if(item = localStorage.getItem("eudscr_triggerstyle")) {
			$("settings_triggerstyle").selectedIndex = parseInt(item, 10);
		}
		if(item = localStorage.getItem("eudscr_hexoutput_memory")) {
			$("settings_hexoutput_memory").selectedIndex = parseInt(item, 10);
		}
		if(item = localStorage.getItem("eudscr_hexoutput_value")) {
			$("settings_hexoutput_value").selectedIndex = parseInt(item, 10);
		}
		if(item = localStorage.getItem("eudscr_hexoutput_mask")) {
			$("settings_hexoutput_mask").selectedIndex = parseInt(item, 10);
		}
		if(item = localStorage.getItem("eudscr_translate")) {
			$("settings_translate").selectedIndex = parseInt(item, 10);
		}
	}
	catch(e){}

	settingsUpdate();
}
function upgUpdate()
{
	switch(memorylist[currentSelected][0])
	{
		case 0x58D088:
		case 0x58D2B0:
		$("input_object").value = (parseInt($("input_upg_player").value) - 1) * 46 + parseInt($("input_upg_uid").value);
		if($("input_upg_uid").value == 60)
		{
			// find memory
		}
		break;
		case 0x58CE24:
		case 0x58CF44:
		$("input_object").value = (parseInt($("input_upg_player").value) - 1) * 24 + parseInt($("input_upg_uid").value);
		break;
		case 0x58F278:
		case 0x58F32C:
		$("input_object").value = (parseInt($("input_upg_player").value) - 1) * 15 + parseInt($("input_upg_uid").value) - 46;
		break;
		case 0x58F050:
		case 0x58F140:
		$("input_object").value = (parseInt($("input_upg_player").value) - 1) * 20 + parseInt($("input_upg_uid").value) - 24;
		break;
	}
	updateMemory();
}
function selgroupUpdate() {
	$("input_object").value = (parseInt($("input_selgroup_player").value) - 1) * 12 + parseInt($("input_selgroup_id").value) - 1;
	updateMemory();
}
function selgroupUpdate2() {
	$("input_value").value = parseInt($("input_selgroup_unit").value) * 336 + 0x59CCA8;
}
function keygroupUpdate() {
	$("input_object").value = (parseInt($("input_keygroup_player").value) - 1) * 216 + parseInt($("input_keygroup_hotkey").value) * 12 + parseInt($("input_keygroup_id").value) - 1;
	updateMemory();
}
function keygroupUpdate2() {
	$("input_keygroup_index").value = (parseInt($("input_keygroup_unit").value) == 0) ? 0 : 1700 - parseInt($("input_keygroup_unit").value);
	$("input_value").value = 2049 + parseInt($("input_keygroup_unit").value);
}
function keygroupUpdate3() {
	$("input_keygroup_unit").value = (parseInt($("input_keygroup_index").value) == 0) ? 0 : 1700 - parseInt($("input_keygroup_index").value);
	$("input_value").value = 2049 + parseInt($("input_keygroup_unit").value);
}
function unitnodehelperUpdate() {
	$("input_object").value = (parseInt($("input_unitnodehelper").value) == 0) ? 0 : 1700 - parseInt($("input_unitnodehelper").value);
	updateMemory();
}
function tablesUpdate() {
	$("input_object").value = (parseInt($("input_tables_unit").value)) * 12 + parseInt($("input_tables_player").value) - 1;
	updateMemory();
}
function reqUpdate()
{
	switch(memorylist[currentSelected][0])
	{
		case 0x514178:
		$("input_offset").value = array_units[$("input_req").value];
		if(array_units[$("input_req").value] > 0) {
			$("select_reqwrite_type").selectedIndex = 0;
			$("input_reqwrite_uid").value = $("input_req").value;
			$("input_reqwrite_offset").value = (array_units[$("input_req").value] - 0x514178) >>> 1;
		}
		break;
		case 0x5145C0:
		$("input_offset").value = array_upgrades[$("input_req").value];
		if(array_upgrades[$("input_req").value] > 0) {
			$("select_reqwrite_type").selectedIndex = 1;
			$("input_reqwrite_uid").value = $("input_req").value;
			$("input_reqwrite_offset").value = (array_upgrades[$("input_req").value] - 0x5145C0) >>> 1;
		}
		break;
		case 0x514908:
		$("input_offset").value = array_upgtech[$("input_req").value];
		if(array_upgtech[$("input_req").value] > 0) {
			$("select_reqwrite_type").selectedIndex = 2;
			$("input_reqwrite_uid").value = $("input_req").value;
			$("input_reqwrite_offset").value = (array_upgtech[$("input_req").value] - 0x514908) >>> 1;
		}
		break;
		case 0x514A48:
		$("input_offset").value = array_usetech[$("input_req").value];
		if(array_usetech[$("input_req").value] > 0) {
			$("select_reqwrite_type").selectedIndex = 3;
			$("input_reqwrite_uid").value = $("input_req").value;
			$("input_reqwrite_offset").value = (array_usetech[$("input_req").value] - 0x514A48) >>> 1;
		}
		break;
		case 0x514CF8:
		$("input_offset").value = array_orders[$("input_req").value];
		if(array_orders[$("input_req").value] > 0) {
			$("select_reqwrite_type").selectedIndex = 4;
			$("input_reqwrite_uid").value = $("input_req").value;
			$("input_reqwrite_offset").value = (array_orders[$("input_req").value] - 0x514CF8) >>> 1;
		}
		break;
	}
	$("input_object").value = 0;
	updateMemory();
}
function stackTextUpdate()
{
	var ts = $("input_textstack_text").value;
	$("input_textstack_unit").value = overlapText(ts, 0, 150, true);
	$("input_textstack_disp").value = overlapText(ts, 1, 619, true);
	$("input_textstack_objs").value = overlapText(ts, 1, 220, true);
	$("input_textstack_desc").value = overlapText(ts, 1, 188, true);
}
function expandDataOutput()
{
	$("data_output").className = "expanded";
	$("expand_data_output").className = "divbutton expanded";
	$("expand_data_output").innerHTML = "^";
	$("expand_data_output").onclick = retractDataOutput;
	isDataExpanded = true;
}
function retractDataOutput()
{
	$("data_output").className = "";
	$("expand_data_output").className = "divbutton";
	$("expand_data_output").innerHTML = "v";
	$("expand_data_output").onclick = expandDataOutput;
	isDataExpanded = false;
}
function toParseIceCC()
{
	$("trigger_output").value += parseIceCC($("inputarea_icecc").value, $("input_icecc_trigbase").value + "\n");
}
function hexToTrigger()
{
	var triggerPattern_masked = getTriggerPattern(TriggerPatterns.MASKED);
	var triggerPattern_normal = getTriggerPattern(TriggerPatterns.NORMAL);
	$("trigger_output").value += hexStringTriggers($("input_etg_base").value, $("input_etg_base").value, parseInt($("input_etg_ofs").value), $("inputarea_etg").value.toString());
}
function triggerFormat(trg) {
	let lines = trg.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
	return lines.map(line => {
		if(line.indexOf("Trigger") == 0) {
			return "\n" + line;
		}
		else if(line.indexOf("}") == 0) {
			return line + "\n";
		}
		else if(line.indexOf("Conditions") == 0 || line.indexOf("Actions") == 0) {
			return line;
		}
		else if(line.indexOf("/") == 0) {
			return line;
		}
		else {
			return "\t" + line;
		}
	}).join("\n").replace(/\n{3,}/g, "\n\n");
}
function getDefaultMask(length) {
    switch(length) {
        case 0:
        return 0;
        case 1:
        return 0xFF;
        case 2:
        return 0xFFFF;
        case 3:
        return 0xFFFFFF;
        case 4:
        default:
        return 0xFFFFFFFF;
    }
}
function formatDwordHex(val) {
    if(val < 0) {
        val += 0x100000000;
    }
    return "0x" + val.toString(16).padStart(8, "0");
}
function formatMemory(memory) {
    if(Settings.hexOutputMemory) {
        return formatDwordHex(memory);
    }
    return memory;
}
function formatValue(value) {
    if(Settings.hexOutputValue) {
        return formatDwordHex(value);
    }
    return value;
}
function formatMask(mask) {
    if(Settings.hexOutputMask) {
        return formatDwordHex(mask);
    }
    return mask;
}
function calcTrigOp(pattern, memory, opString, value, length, useMasked, origValueOrMask) {
    // shorthand
    return calculateTriggerWithOp(pattern, memory, opString, value, length, useMasked, origValueOrMask);
}
function calcTrig(pattern, memory, value, length, useMasked, origValueOrMask) {
    // shorthand
    return calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask);
}
function calculateTriggerWithOp(pattern, memory, opString, value, length, useMasked, origValueOrMask) {
    // Put opString at parameter 2 because it's natural in SCMD TrigEdit & not optional like length etc.
    return calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask).replace(/\^4/g, opString);
}
function calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask) {
	let out = "";
	let s_value = value;
	length = length || 4;
	useMasked = (typeof useMasked != 'undefined') ? useMasked : Settings.useMasked;
	let s_origvalue = origValueOrMask || 0;
    let isMaskSet = (typeof origValueOrMask != 'undefined');
    let s_mask = isMaskSet ? origValueOrMask : getDefaultMask(length);

    if(!useMasked) {
    	s_value -= s_origvalue;
    }

	let byteOrder = 0;
	if(memory % 4 != 0 && length < 4) {
		byteOrder = memory % 4;
		let multiplier = 1 << (byteOrder * 8);
		memory -= byteOrder;
		s_value *= multiplier;
	}

	s_value %= 0x100000000;
	if(s_value > 0x7FFFFFFF) {
		s_value -= 0x100000000;
	}
	else if(s_value < -0x80000000) {
		s_value += 0x100000000;
	}

	switch(length)
	{
		case 1:
		case 2:
		case 3:
		if(useMasked) {
			let bitMask = s_mask << (8 * byteOrder);
            out += pattern.replace(/\^1/g, formatMemory(memory))
                          .replace(/\^2/g, formatValue(s_value))
                          .replace(/\^3/g, formatMask(bitMask));
			break;
		}
		out += pattern.replace(/\^1/g, formatMemory(memory))
                      .replace(/\^2/g, formatValue(s_value));
		break;
		case 4:
		default:
        if(useMasked && isMaskSet) {
            let bitMask = s_mask;
            out += pattern.replace(/\^1/g, formatMemory(memory))
                          .replace(/\^2/g, formatValue(s_value))
                          .replace(/\^3/g, formatMask(bitMask));
        }
        else if(useMasked) {
            out += pattern.replace(/\^1/g, formatMemory(memory))
                          .replace(/\^2/g, formatValue(s_value));
        }
        else {
            out += pattern.replace(/\^1/g, formatMemory(memory))
                          .replace(/\^2/g, formatValue(s_value));
        }
		break;
		case -1:
		break;
	}
	out += "\n";
	return out;
}
function pressEnterToGenerate(evt) {
	if(evt && evt.key == "Enter") {
		toTriggerEvent();
	}
}
function toTriggerEvent() {
	if($("input_object").value.toString().indexOf(",") != -1) {
		let resetText = $("input_object").value;
		let resetOrigvalue = $("input_origvalue").value;
		let objects = $("input_object").value.toString().trim().split(/, */);
		let origvalues = null;
		if($("input_origvalue").value.toString().indexOf(",") != -1) {
			origvalues = $("input_origvalue").value.toString().trim().split(/, */);
		}
		objects.forEach((item, i) => {
			$("input_object").value = item;
			if(origvalues) {
				$("input_origvalue").value = origvalues[i % origvalues.length];
			}
			updateMemory();
			toTrigger();
		});
		$("input_object").value = resetText;
		$("input_origvalue").value = resetOrigvalue;
	}
	else {
		toTrigger();
	}
}

function generateEUDTrigger(memory, len, valueInput, useMasked, origValueInput) {
	var triggerPattern_1 = getTriggerPattern(TriggerPatterns.ADD);
	var triggerPattern_masked = getTriggerPattern(TriggerPatterns.MASKED);
	var triggerPattern_4 = getTriggerPattern(TriggerPatterns.NORMAL);
	var triggerPattern_err = getTriggerPattern(TriggerPatterns.ERROR);
	var out = "";
	var origValue = useMasked ? undefined : parseInt(origValueInput);
	var arrayContent, origArrayContent, s_length;

	s_length = len;

	if(isNaN(parseInt(valueInput))) // invalid value
	{
		if((valueInput.charAt(0) == "\"" && valueInput.charAt(valueInput.length-1) == "\"")
			|| (valueInput.charAt(0) == "\u201c" && valueInput.charAt(valueInput.length-1) == "\u201d")) // input string
		{
			let s = valueInput.substr(1, valueInput.length - 2);
			arrayContent = scmdStringToUint8Array(s);
			s_length = 1;
			if(!useMasked) {
				if(origValueInput.charAt(0) == "\"" || origValueInput.charAt(0) == "\u201c") {
					let ov = origValueInput.substr(1, origValueInput.length - 2);
					origArrayContent = scmdStringToUint8Array(ov);
				}
			}
		}
		else if((valueInput.charAt(0) == "'" && valueInput.charAt(valueInput.length-1) == "'")
			|| (valueInput.charAt(0) == "\u2018" && valueInput.charAt(valueInput.length-1) == "\u2019")) // hex string
		{
			let s = valueInput.substr(1, valueInput.length - 2);
			arrayContent = hexStringToUint8Array(s);
			s_length = 1;
			if(!useMasked) {
				if(origValueInput.charAt(0) == "'" || origValueInput.charAt(0) == "\u2018") {
					let ov = origValueInput.substr(1, origValueInput.length - 2);
					origArrayContent = hexStringToUint8Array(ov);
				}
			}
		}
		else
		{
			return triggerPattern_err.replace(/\^1/g,"Invalid value!") + "\n";
		}
	}

	if(valueInput.indexOf(",") != -1) { // array
		arrayContent = valueInput.split(/, */).map(s => parseInt(s));
		if(!useMasked) {
			if(origValueInput.indexOf(",") != -1) {
				origArrayContent = origValueInput.split(/, */).map(s => parseInt(s));
			}
		}
	}

	if(arrayContent) { // array from 3 extra types
		let tpn = triggerPattern_4;
		let tpm = triggerPattern_masked;
		if(!useMasked) {
			tpn = triggerPattern_1;
			tpm = triggerPattern_1;
			if(origArrayContent) {
				arrayContent = arrayContent.map((v, i) => v - origArrayContent[i % origArrayContent.length]);
			}
			else {
				arrayContent = arrayContent.map((v, i) => v - origValue);
			}
		}
		switch(s_length) {
			case 0:
			case 1:
			return uint8ArrayTriggers(tpn, tpm, memory, arrayContent);
			case 2:
			return uint16ArrayTriggers(tpn, tpm, memory, arrayContent);
			case 3:
			return uint8ArrayTriggers(tpn, tpm, memory, convert3ByteArray(arrayContent));
			case 4:
			default:
			return int32ArrayTriggers(tpn, tpm, memory, arrayContent);
		}
	}

	if(s_length <= 3) {
		var pattern = useMasked ? triggerPattern_masked : triggerPattern_1;
	}
	else {
		var pattern = triggerPattern_4;
	}

	out += calculateTrigger(pattern, memory, parseInt(valueInput), s_length, useMasked, origValue);
	return out;
}
function EUD(memory, rawLength, item, value) {
	var m_length, s_length;
	if(typeof rawLength == "string") {
		if(rawLength.indexOf("/") == -1) {
			m_length = parseInt(rawLength);
			s_length = parseInt(rawLength);
		}
		else {
			m_length = parseInt(rawLength.split("/")[1]);
			s_length = parseInt(rawLength.split("/")[0]);
		}
	}
	else {
		m_length = rawLength;
		s_length = rawLength;
	}
	return generateEUDTrigger(memory + item * m_length, s_length, value, true).trim();
}
function toTrigger()
{
	var triggerPattern_1 = getTriggerPattern(TriggerPatterns.ADD);
	var triggerPattern_masked = getTriggerPattern(TriggerPatterns.MASKED);
	var triggerPattern_4 = getTriggerPattern(TriggerPatterns.NORMAL);
	var triggerPattern_err = getTriggerPattern(TriggerPatterns.ERROR);
	var out = "";
	var memory = parseInt($("input_memory").value);
	var s_offset = parseInt($("input_offset").value);
	var rawLength = $("input_length").value;
	if(rawLength.indexOf("/") == -1) {
		var s_length = parseInt($("input_length").value);
	}
	else {
		var s_length = parseInt($("input_length").value.split("/")[0]);
	}
	var s_value = $("input_value").value.toString();
	var s_origvalue = $("input_origvalue").value.toString();
	var useMasked = Settings.useMasked;

	$("trigger_output").value += generateEUDTrigger(memory, s_length, s_value, useMasked, s_origvalue);
	return;
}

function attachEventCallbacks() {
	$("input_object").onkeydown = delayUpdate;
	$("input_object").onpaste = delayUpdate;
	$("input_memory").onclick = selectMe;
	$("input_hex").onclick = selectMe;
	$("input_value").onkeydown = pressEnterToGenerate;
	$("make_memory").onclick = updateMemory;
	$("make_trigger").onclick = toTriggerEvent;
	$("expand_data_output").onclick = expandDataOutput;
	$("parse_icecc").onclick = toParseIceCC;
	$("parse_etg").onclick = hexToTrigger;
	$("settings_useaddsub").onchange = settingsUpdate;
	$("settings_triggerstyle").onchange = settingsUpdate;
	$("settings_hexoutput_memory").onchange = settingsUpdate;
	$("settings_hexoutput_value").onchange = settingsUpdate;
	$("settings_hexoutput_mask").onchange = settingsUpdate;
	$("input_upg_player").onkeydown = function(){setTimeout(upgUpdate,25);};
	$("input_upg_uid").onkeydown = function(){setTimeout(upgUpdate,25);};
	$("input_selgroup_player").onkeydown = function(){setTimeout(selgroupUpdate,25);};
	$("input_selgroup_id").onkeydown = function(){setTimeout(selgroupUpdate,25);};
	$("input_selgroup_unit").onkeydown = function(){setTimeout(selgroupUpdate2,25);};
	$("input_keygroup_player").onkeydown = function(){setTimeout(keygroupUpdate,25);};
	$("input_keygroup_id").onkeydown = function(){setTimeout(keygroupUpdate,25);};
	$("input_keygroup_hotkey").onkeydown = function(){setTimeout(keygroupUpdate,25);};
	$("input_keygroup_unit").onkeydown = function(){setTimeout(keygroupUpdate2,25);};
	$("input_keygroup_index").onkeydown = function(){setTimeout(keygroupUpdate3,25);};
	$("input_unitnodehelper").onkeydown = function(){setTimeout(unitnodehelperUpdate,25);};
	$("input_tables_unit").onkeydown = function(){setTimeout(tablesUpdate,25);};
	$("input_tables_player").onkeydown = function(){setTimeout(tablesUpdate,25);};
	$("input_req").onkeydown = function(){setTimeout(reqUpdate,25);};
	$("input_textstack_text").onkeydown = function(){setTimeout(stackTextUpdate,25);};
	$("input_textstack_text").onpaste = function(){setTimeout(stackTextUpdate,25);};
	$("input_textstack_unit").onclick = selectMe;
	$("input_textstack_disp").onclick = selectMe;
	$("input_textstack_objs").onclick = selectMe;
	$("input_textstack_desc").onclick = selectMe;
}

function getTranslateComponentStatus() {
	return typeof translateComponentLoaded != 'undefined' && translateComponentLoaded;
}
function hideTranslateElemsIfUnused() {
	if(!getTranslateComponentStatus()) {
		$("settings_hide_translate_if_unused").style.display = "none";
	}
}

function dataTextInit() {
	if(getTranslateComponentStatus()) {

	}
	else {
		shimDataTexts();
	}
}

/* Note to anyone who is curious or bored enough to look at this code:
 * In this program, $(x) is a shorthand for document.getElementById(x). It's not jQuery.
 */

function init()
{
	if(getTranslateComponentStatus()) {
		translateInit();
	}
	else {
		hideTranslateElemsIfUnused();
	}

	createCategoryArea(useCategory);
	createSelectArea(useOption);
	createSelectArea2(useOption2);

	attachEventCallbacks();

	duplicatorInit();
	slicerInit();
	converterInit();
	stattblInit();
	reqwriterInit();
	playerColorsInit();
	flagsInit();

	pluginLoaderInit();

	dataTextInit();

	loadSettings();
	$("settings_close").onclick = function(){document.getElementById('settings_floating').style.display='none';return false;};
	setTimeout(function(){$("data_output").value = "";},25);
}