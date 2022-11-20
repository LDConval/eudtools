/*
 * UI Functions for EUDTools Layout V2
 *
 * The old code is a bit clumped, everything being crammed inside one JS file.
 * I splitted up the code a little bit, but ultimately decided not to add a 
 * framework or things like that.
 * 
 * After 16 years of programming and even a real job, I still never got into
 * the idea of Good Practices(TM) and Design Patterns(TM).
 * 
 * Probably because the high disexpectation of my code be used by anyone else.
 * Even for the real job, which is the best part (lmao).
 *
 * @ Ar3sgice / LDConval 2022
 */

"use strict";

/*
 * Global memory data object
 * Exposed to global scale so users can do some console programming
 * obj, memory and value can be either number type or array type
 * value will never be string type even if manually entered
 */
var MemData = {
	offset : 0,
	len : 0,
	next : 0,
	obj : 0,
	memory : 0,
	value : 0,
	isStringValue : false
};

// input handlers to reverse calculate the object/value
var objectInputHandlers = [];
var valueInputHandlers = [];

let categorySelectDisabled = false;

/*
 * I still like to do this lol
 * No frameworks anyways so it is the best and only option
 */
function $Q(x) {
    return document.querySelector(x);
}

function $A(x) {
    return Array.from(document.querySelectorAll(x));
}

function $I(x) {
    return document.getElementById(x);
}

function $C(x) {
    return document.createElement(x);
}

// Compat
function $(x) {
    return document.getElementById(x);
}

/*
 * Generate memory category options.
 * categorylist is imported from the eudtools_data.js file.
 */
function initializeMemoryCategories(handler) {
	const divSelect = $I("category_container");
	for(let i = 0; i < categorylist.length; i++) {
		let opt = $C("div");
		opt.className = "div_option option_category text_mid";
		opt.optionID = i;
		opt.addEventListener("click", handler.bind(null, i, opt));
		opt.textContent = categorylist[i][2];
		divSelect.appendChild(opt);
	}
}

/*
 * Generate memory category options.
 * memorylist is imported from the eudtools_data.js file.
 */
function initializeMemorySelection(handler) {
	const divSelect = $I("select_container");
	for(let i = 0; i < memorylist.length; i++) {
		let opt = $C("div");
		opt.className = "div_option option_memory text_mid";
		opt.optionID = i;
		opt.addEventListener("click", handler.bind(null, i, opt));
		opt.innerHTML = memorylist[i][3];
		divSelect.appendChild(opt);
	}
}

/*
 * Highlighting & show/hide
 */

function removeHighlightForMemoryCategory() {
	$A("#category_container > div.div_option").forEach(elem => {
		elem.classList.remove("div_option_highlight");
	});
}

function removeHighlightForMemory() {
	$A("#select_container > div.div_option").forEach(elem => {
		elem.classList.remove("div_option_highlight");
	});
}

function highlightMemoryCategory(elem) {
	removeHighlightForMemoryCategory();
	elem.classList.add("div_option_highlight");
}

function highlightMemory(elem) {
	removeHighlightForMemory();
	elem.classList.add("div_option_highlight");
}

function filterMemoryOptions(begin, end) {
	$A("#select_container > div.div_option").forEach((elem, i) => {
		if(i >= begin && i < end) {
			elem.classList.remove("div_option_hidden");
		}
		else {
			elem.classList.add("div_option_hidden");
		}
	});
}

function memorySideCategory() {
    if($Q(".gr_memory_selection").classList.contains("gd_ms_right")) {
        $Q(".gr_memory_selection").classList.remove("gd_ms_right");
        $Q(".gr_memory_selection").classList.add("gd_ms_left");
    }
}

function memorySideMemory() {
    if($Q(".gr_memory_selection").classList.contains("gd_ms_left")) {
        $Q(".gr_memory_selection").classList.remove("gd_ms_left");
        $Q(".gr_memory_selection").classList.add("gd_ms_right");
    }
}

function showMemoryInfo() {
	$Q("#offset_info_area").classList.remove("subgrid_hidden");
}

function hideMemoryInfo() {
	$Q("#offset_info_area").classList.add("subgrid_hidden");
}

function hideExtraAreas() {
	$A(".gr_helpers > .subgrid").forEach(elem => {
		elem.classList.add("subgrid_hidden");
	})
	$A(".gr_supplementary > .subgrid").forEach(elem => {
		elem.classList.add("subgrid_hidden");
	})
}

function showExtraArea(elemSelector) {
	$Q(elemSelector).classList.remove("subgrid_hidden");
}

function updateGenerateButtons() {
	if(Settings.triggerStyle == TriggerStyleEnum.EUD3) {
		$Q(".gr_input_eud3gen_subgrid").classList.remove("gr_input_hidden");
		$Q("#link_generate_condition").classList.add("gr_input_hidden");
		$Q("#link_generate_action").classList.add("gr_input_hidden");
	}
	else {
		$Q(".gr_input_eud3gen_subgrid").classList.add("gr_input_hidden");
		$Q("#link_generate_condition").classList.remove("gr_input_hidden");
		$Q("#link_generate_action").classList.remove("gr_input_hidden");
	}

}

/*
 * Memory calculation
 */

function calcSingleMem(ofs, next, obj) {
	return ofs + next * obj;
}

function calculateMemory() {
	if(typeof MemData.obj == "number") {
		MemData.memory = MemData.offset + MemData.next * MemData.obj;
	}
	else {
		const ofs = MemData.offset;
		const next = MemData.next;
		MemData.memory = MemData.obj.map(o => calcSingleMem(ofs, next, o));
	}
}

function calculateObjectFromMemory() {
	if(typeof MemData.memory == "number") {
		MemData.obj = parseInt((MemData.memory - MemData.offset) / MemData.next);
	}
	else {
		MemData.obj = MemData.memory.map(m => parseInt((m - MemData.offset) / MemData.next));
	}
}

function calculateAndUpdateMemory() {
	calculateMemory();
	updateMemoryBaseFields();
}

/*
 * Data binding
 */

function setMemoryInfo(str) {
	$Q("#offset_info").textContent = str;
}

function setMemoryInfoFromMemory(mem) {
	if(mem in MemoryInfo) {
		setMemoryInfo(MemoryInfo[mem]);
	}
}

function getMemoryInfo() {
	return $Q("#offset_info").textContent;
}

function updateMemoryBaseFields(exclude) {
	// exclude parameter: don't update the inputting field
	if(exclude != "input_offset_x") {
		$Q("#input_offset_x").value = getHex(MemData.offset);
	}
	if(exclude != "input_offset_d") {
		$Q("#input_offset_d").value = MemData.offset.toString();
	}

	if(exclude != "input_length_data") {
		$Q("#input_length_data").value = MemData.len.toString();
	}
	if(exclude != "input_length_next") {
		$Q("#input_length_next").value = MemData.next.toString();
	}

	if(typeof MemData.memory == "number") {
		if(exclude != "input_memory_x") {
			$Q("#input_memory_x").value = getHex(MemData.memory);
		}
		if(exclude != "input_memory_d") {
			$Q("#input_memory_d").value = MemData.memory.toString();
		}

		if($Q("#input_memory_x").classList.contains("gd_i_input_z")) {
			$Q("#input_memory_x").classList.remove("gd_i_input_z");
			$Q("#input_memory_d").classList.remove("gd_i_input_h");
			$Q("#input_memory_x").classList.add("gd_i_input_x");
			$Q("#input_memory_d").classList.add("gd_i_input_d");
		}
	}
	else {
		if(exclude != "input_memory_x") {
			$Q("#input_memory_x").value = MemData.memory.map(getHex).join(", ");
		}

		if($Q("#input_memory_x").classList.contains("gd_i_input_x")) {
			$Q("#input_memory_x").classList.remove("gd_i_input_x");
			$Q("#input_memory_d").classList.remove("gd_i_input_d");
			$Q("#input_memory_x").classList.add("gd_i_input_z");
			$Q("#input_memory_d").classList.add("gd_i_input_h");
		}
	}
}

function updateMemoryObject(noHandler = false) {
	if(typeof MemData.obj == "number") {
		$Q("#input_object").value = MemData.obj.toString();
	}
	else {
		$Q("#input_object").value = MemData.obj.join(", ");
	}
	if(!noHandler) {
		objectInputHandlers.forEach(handler => handler(MemData.offset, MemData.obj));
	}
}

function updateMemoryValue(noHandler = false) {
	if(typeof MemData.value == "number") {
		$Q("#input_value").value = MemData.value.toString();
	}
	else if(MemData.isStringValue) {
		const s = MemData.value.map(b => b.toString(16).padStart(2, "0"));
		$Q("#input_value").value = `'${s.join(" ")}'`;
	}
	else {
		$Q("#input_value").value = MemData.value.join(", ");
	}
	if(!noHandler) {
		valueInputHandlers.forEach(handler => handler(MemData.offset, MemData.value));
	}
}

function setMemoryBase(offset, len, next, skipUpdate = false) {
	MemData.offset = offset;
	MemData.len = len;
	MemData.next = next || len;

	if(!skipUpdate) {
		calculateMemory();
		updateMemoryBaseFields();
	}
}

function setMemoryFromList(k) {
	const [offset, len, type] = memorylist[k];

	hideExtraAreas();

	const memoryInfo = getActionFromMemoryListOption(offset, len, type);
	setMemoryBase(memoryInfo.offset, memoryInfo.len, memoryInfo.next, memoryInfo.doNotUpdate);

	memoryInfo.activatedElems.forEach(sel => {
		showExtraArea(sel);
	});

	memoryInfo.activatedFunctions.forEach(f => { // unitNode playerColors settings plugin flags
		switch(f) {
			case "unitNode":
				return updateCUnitOffset(offset);

			case "playerColors":
				return playerColorsCall();

			case "flags":
				return flagsCall(offset);

			case "settings":
				return showSettings();

			case "plugin":
				return pluginInvoke(offset);
		}
	});

	objectInputHandlers = memoryInfo.objectInputHandlers;
	valueInputHandlers = memoryInfo.valueInputHandlers;
}

function setInputObject(objVal) {
	MemData.obj = objVal;
	updateMemoryObject();
}

function setInputValue(val) {
	MemData.value = val;
	updateMemoryValue();
}

/*
 * Data binding from user input
 */

function bindAllPageElements() {
	let text = $I("input_offset_x").value || $I("input_offset_d").value;
	MemData.offset = parseInt(text) || 0;
	text = $I("input_length_data").value;
	MemData.len = parseInt(text) || 1;
	text = $I("input_length_next").value;
	let text_int = parseInt(text);
	MemData.next = isFinite(text_int) ? text_int : 1;
	text = $I("input_object").value;
	if(text.indexOf(",") == -1) {
		MemData.obj = parseInt(text);
	}
	else {
		MemData.obj = text.split(",")
						  .map(item => parseInt(item))
						  .filter(item => isFinite(item));
	}
	text = $I("input_memory_x").value || $I("input_memory_d").value;
	if(text.indexOf(",") == -1) {
		MemData.memory = parseInt(text);
	}
	else {
		MemData.memory = text.split(",")
						     .map(item => parseInt(item))
						     .filter(item => isFinite(item));
	}
	const valueParseResult = parseValueInput($I("input_value").value);
	if(valueParseResult.value !== null) {
		MemData.value = valueParseResult.value;
		MemData.isStringValue = valueParseResult.isStringValue;
	}
}

function bindInputOffsetHex() {
	const text = $I("input_offset_x").value;

	MemData.offset = parseInt(text) || 0;

	calculateMemory();
	updateMemoryBaseFields("input_offset_x");
}

function bindInputOffset() {
	const text = $I("input_offset_d").value;

	MemData.offset = parseInt(text) || 0;

	calculateMemory();
	updateMemoryBaseFields("input_offset_d");
}

function bindInputLen() {
	const text = $I("input_length_data").value;

	// length 0 will cause problems so we treat them as 1 as well
	MemData.len = parseInt(text) || 1;

	calculateMemory();
	updateMemoryBaseFields("input_length_data");
}

function bindInputNext() {
	const text = $I("input_length_next").value;
	const text_int = parseInt(text) || 1;
	MemData.next = isFinite(text_int) ? text_int : 1;

	calculateMemory();
	updateMemoryBaseFields("input_length_next");
}

function bindInputObject() {
	const text = $I("input_object").value;

	if(text.indexOf(",") == -1) {
		MemData.obj = finiteOr0(parseInt(text));
	}
	else {
		MemData.obj = text.split(",")
						  .map(item => parseInt(item))
						  .filter(item => isFinite(item));
	}

	objectInputHandlers.forEach(handler => handler(MemData.offset, MemData.obj));
	calculateMemory();
	updateMemoryBaseFields();
}

function bindInputMemoryHex() {
	const text = $I("input_memory_x").value;

	if(text.indexOf(",") == -1) {
		MemData.memory = finiteOr0(parseInt(text));
	}
	else {
		MemData.memory = text.split(",")
						     .map(item => parseInt(item))
						     .filter(item => isFinite(item));
	}

	if(Settings.reverseMemoryToObject) {
		calculateObjectFromMemory();
		updateMemoryObject();
		updateMemoryBaseFields("input_memory_x");
	}
}

function bindInputMemory() {
	const text = $I("input_memory_d").value;

	if(text.indexOf(",") == -1) {
		MemData.memory = finiteOr0(parseInt(text));
	}
	else {
		MemData.memory = text.split(",")
						     .map(item => parseInt(item))
						     .filter(item => isFinite(item));
	}

	if(Settings.reverseMemoryToObject) {
		calculateObjectFromMemory();
		updateMemoryObject();
		updateMemoryBaseFields("input_memory_d");
	}
}

function bindInputValue() {
	const parseResult = parseValueInput($I("input_value").value);

	if(parseResult.value !== null) {
		MemData.value = parseResult.value;
		MemData.isStringValue = parseResult.isStringValue;
	}
}

/*
 * EUD Engine Settings
 */

function updateEUDEngineSettings(triggerSubtype = "act") {
	// subtypes: cond, act, read
	let pattern = EUDEngine.defaultPattern;
	switch(Settings.triggerStyle) {
		case TriggerStyleEnum.SCMD:
		case 1:
			if(triggerSubtype == "cond") {
				pattern = TriggerPatterns.ScmdTrgCond;
			}
			else {
				pattern = TriggerPatterns.ScmdTrgAct;
			}
			break;
		case TriggerStyleEnum.TEP:
		case 3:
			if(triggerSubtype == "cond") {
				pattern = TriggerPatterns.TepTrgCond;
			}
			else {
				pattern = TriggerPatterns.TepTrgAct;
			}
			break;
		case TriggerStyleEnum.EUD3:
			if(triggerSubtype == "cond") {
				pattern = TriggerPatterns.EpsTrgCond;
			}
			else if(triggerSubtype == "read") {
				pattern = TriggerPatterns.EpsTrgRead;
			}
			else {
				pattern = TriggerPatterns.EpsTrgAct;
			}
			break;
	}
	pattern.encodeMem = Settings.hexOutputMemory ?
		TriggerPatterns.encHex : TriggerPatterns.encNum;
	pattern.encodeVal = Settings.hexOutputValue ?
		TriggerPatterns.encHex : TriggerPatterns.encNum;
	pattern.encodeMask = Settings.hexOutputMask ?
		TriggerPatterns.encHex : TriggerPatterns.encNum;

	EUDEngine.setDefaultPattern(pattern);
}

/*
 * Output
 */

function output(str) {
	$Q("#trigger_output").value += str;
}

function generateTriggers(memory, value, len) {
	// memory: NumberOrArray
	// value: NumberOrArray
	if(typeof memory == "number") {
		if(typeof value == "number") {
			EUDEngine.set(memory, value, len);
			return EUDEngine.output();
		}
		else {
			// continuously set memory. this is not based on next, since
			// this mode can be (is usually) used for string input or size input.
			let currentMemory = memory;
			for(let i = 0; i < value.length; i++) {
				EUDEngine.set(currentMemory, value[i], len);
				currentMemory += len;
			}
			return EUDEngine.output();
		}
	}
	else {
		if(typeof value == "number") {
			for(let i = 0; i < memory.length; i++) {
				EUDEngine.set(memory[i], value, len);
			}
			return EUDEngine.output();
		}
		else {
			if(memory.length != value.length) {
				if(len * value.length <= 4) {
					for(let i = 0; i < memory.length; i++) {
						for(let j = 0; j < value.length; j++) {
							EUDEngine.set(memory[i] + len * j, value[j], len);
						}
					}
					return EUDEngine.output();
				}
				else {
					return EUDEngine.error("Memory and Value lengths do not match");
				}
			}
			for(let i = 0; i < value.length; i++) {
				EUDEngine.set(memory[i], value[i], len);
			}
			return EUDEngine.output();
		}
	}
}

function generateTriggersFromMemData() {
	const len = MemData.isStringValue ? 1 : MemData.len;
	return generateTriggers(MemData.memory, MemData.value, len);
}

// Compat
function generateEUDTrigger(memory, len, valueInput, useMasked, origValueInput) {
	const {value, isStringValue} = parseValueInput(valueInput);
	len = isStringValue ? 1 : len;

	if(!useMasked) {
		const origValue = parseValueInput(origValueInput);
		if(typeof origValue == "number") {
			if(typeof value == "number") {
				value -= origValue;
			}
			else {
				value = value.map(v => v - origValue);
			}
		}
		else {
			if(typeof value == "number") {
				const _val = origValue.map(v => value - v);
				value = _val;
			}
			else {
				if(value.length != origValue.length) {
					return EUDEngine.error("OriginalValue and Value lengths do not match");
				}
				value = value.map((v, i) => v - origValue[i]);
			}
		}
		EUDEngine.setModifier("add");
		return generateTriggers(memory, value, len);
	}

	return generateTriggers(memory, value, len);
}

// Compat
function calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask) {
	updateEUDEngineSettings("act");

	if(!useMasked && typeof origValueOrMask == "number") {
		value -= origValueOrMask;
	}

	if(useMasked && typeof origValueOrMask == "number" && origValueOrMask !== 0) {
		EUDEngine.setWithMask(memory, value, length, origValueOrMask);
	}
	else {
		EUDEngine.set(memory, value, length);
	}

	return EUDEngine.output();
}

function calculateTriggerWithOp(pattern, memory, opString, value, length, useMasked, origValueOrMask) {
    // Put opString at parameter 2 because it's natural in SCMD TrigEdit & not optional like length etc.
    return calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask).replace(/\^4/g, opString);
}

function calcTrig(pattern, memory, value, length, useMasked, origValueOrMask) {
    // shorthand
    return calculateTrigger(pattern, memory, value, length, useMasked, origValueOrMask);
}

function calcTrigOp(pattern, memory, opString, value, length, useMasked, origValueOrMask) {
    // shorthand
    return calculateTriggerWithOp(pattern, memory, opString, value, length, useMasked, origValueOrMask);
}

// For Trigger Duplicator
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

/*
 * Event handlers
 */

function delayedEvent(evtFunction) {
	return function(evt) {
		setTimeout(evtFunction.bind(null, evt), 25);
	};
}

function evtMouseOverMemoryCategory(evt) {
	if(!categorySelectDisabled) {
		memorySideCategory();
	}
}
function evtMouseOutMemoryCategory(evt) {
	memorySideMemory();
}

function evtSelectMemoryCategory(k, elem, evt) {
    highlightMemoryCategory(elem);
	removeHighlightForMemory();
	filterMemoryOptions(categorylist[k][0], categorylist[k][1]);
	memorySideMemory();

	if(!categorySelectDisabled) {
		categorySelectDisabled = true;
		setTimeout(() => {
			categorySelectDisabled = false;
		}, 500);
	}
}

function evtSelectMemory(k, elem, evt) {
    highlightMemory(elem);
	setMemoryFromList(k);

	evt.stopPropagation();
	evt.preventDefault();
}

function evtMouseOverOffsetInfo(evt) {
	if(getMemoryInfo() != "") {
		showMemoryInfo();
	}
}

function evtMouseOutOffsetInfo(evt) {
	hideMemoryInfo();
}

function evtUpdateMemory(evt) {
	calculateAndUpdateMemory();
}

function evtInputObject(evt) {
	setTimeout(bindInputObject, 25);
}

function evtGenerateCondition(evt) {
	// only parse the input text when necessary
	bindInputValue();

	updateEUDEngineSettings("cond");
	if(evt.shiftKey) {
		EUDEngine.setModifier("add");
	}
	else if(evt.altKey) {
		EUDEngine.setModifier("sub");
	}
	const triggers = generateTriggersFromMemData();
	output(triggers);
}

function evtGenerateAction(evt) {
	// only parse the input text when necessary
	bindInputValue();

	updateEUDEngineSettings("act");
	if(evt.shiftKey) {
		EUDEngine.setModifier("add");
	}
	else if(evt.altKey) {
		EUDEngine.setModifier("sub");
	}
	const triggers = generateTriggersFromMemData();
	output(triggers);
}

function evtGenerateRead(evt) {
	// only parse the input text when necessary
	bindInputValue();

	updateEUDEngineSettings("read");
	const triggers = generateTriggersFromMemData();
	output(triggers);
}

function evtPressEnterToGenerate(evt) {
	if(evt && evt.key == "Enter") {
		evtGenerateAction(evt);
		evt.preventDefault();
	}
}

function evtSelectSelf(evt) {
	const optDiv = evt.target;
	optDiv.select();
}

/*
 * Special events
 */

function evtParseIceCC(evt)
{
	output(parseIceCC($("inputarea_icecc").value, $("input_icecc_trigbase").value + "\n"));
}

function attachPageEvents() {
	// Hover events
    $Q("#category_container").addEventListener("mouseover", evtMouseOverMemoryCategory);
    $Q("#category_container").addEventListener("mouseout", evtMouseOutMemoryCategory);

    $Q("#hover_offset_help").addEventListener("mouseover", evtMouseOverOffsetInfo);
    $Q("#hover_offset_help").addEventListener("mouseout", evtMouseOutOffsetInfo);

	// Text events
    $Q("#input_object").addEventListener("keydown", evtInputObject);
    $Q("#input_object").addEventListener("paste", evtInputObject);

    $Q("#input_offset_d").addEventListener("input", evt => { bindInputOffset(); });
    $Q("#input_offset_x").addEventListener("input", evt => { bindInputOffsetHex(); });

    $Q("#input_length_data").addEventListener("input", evt => { bindInputLen(); });
    $Q("#input_length_next").addEventListener("input", evt => { bindInputNext(); });

    $Q("#input_memory_d").addEventListener("input", evt => { bindInputMemory(); });
    $Q("#input_memory_x").addEventListener("input", evt => { bindInputMemoryHex(); });

    $Q("#input_memory_d").addEventListener("focus", evtSelectSelf);
    $Q("#input_memory_x").addEventListener("focus", evtSelectSelf);

	// Click events
	$Q("#link_calc_update_memory").addEventListener("click", evtUpdateMemory);
	
	$Q("#link_generate_condition").addEventListener("click", evtGenerateCondition);
	$Q("#link_generate_action").addEventListener("click", evtGenerateAction);

	$Q("#link_generate_read_eud3").addEventListener("click", evtGenerateRead);
	$Q("#link_generate_condition_eud3").addEventListener("click", evtGenerateCondition);
	$Q("#link_generate_action_eud3").addEventListener("click", evtGenerateAction);

	// Special events
	
	$Q("#parse_icecc").addEventListener("click", evtParseIceCC);
}


/*
 * Main function
 */

async function init() {
	if(typeof translateComponentLoaded == "boolean" && translateComponentLoaded) {
		await translateInit();
	}

	pluginLoaderInit();

    initializeMemoryCategories(evtSelectMemoryCategory);
    initializeMemorySelection(evtSelectMemory);

	subareaInit();

	// init individual functions
	duplicatorInit();
	slicerInit();
	converterInit();

	playerColorsInit();
	reqwriterInit();
	flagsInit();
	stattblInit();

	initSettings();
	initLibrary();
	initDataTypes();
	initDataCheck();

	initSpacePlatform();

	updateGenerateButtons();

	bindAllPageElements();
    attachPageEvents();
}