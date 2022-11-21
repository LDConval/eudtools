const TriggerStyleEnum = {
    SCMD : 0,
    TEP  : 2,
    EUD3 : 4
};

var Settings = {
    "triggerStyle" : TriggerStyleEnum.SCMD,
    "reverseMemoryToObject" : false,
    "hexOutputMemory" : 0,
    "hexOutputValue" : 0,
    "hexOutputMask" : 0,
    "language" : 0
};


(function(exports) {

function loadSettings(u) {
    Settings.triggerStyle = parseInt(u.ts) || TriggerStyleEnum.SCMD;
    Settings.hexOutputMemory = !!u.xm;
    Settings.hexOutputValue = !!u.xv;
    Settings.hexOutputMask = !!u.xk;
    Settings.reverseMemoryToObject = !!u.rm;
}

function saveSettings() {
    const u = JSON.stringify({
        ts: Settings.triggerStyle,
        xm: Settings.hexOutputMemory,
        xv: Settings.hexOutputValue,
        xk: Settings.hexOutputMask,
        rm: Settings.reverseMemoryToObject
    });
    try {
        // local storage can fail for various reasons: user disabled, max space, plugin block, etc etc
        localStorage.setItem("eudscr_settings", u);
        localStorage.setItem("eudscr_language", Settings.language);
    }
    catch(e) {

    }
}

function updateSettings() {
    const ts = [TriggerStyleEnum.SCMD, TriggerStyleEnum.TEP, TriggerStyleEnum.EUD3];
    if($Q("#settings_triggerstyle").selectedIndex != -1) {
        Settings.triggerStyle = ts[$Q("#settings_triggerstyle").selectedIndex];
    }

    if($Q("#settings_hexoutput_memory").selectedIndex != -1) {
        Settings.hexOutputMemory = !! ($Q("#settings_hexoutput_memory").selectedIndex == 1);
    }

    if($Q("#settings_hexoutput_value").selectedIndex != -1) {
        Settings.hexOutputValue = !! ($Q("#settings_hexoutput_value").selectedIndex == 1);
    }

    if($Q("#settings_hexoutput_mask").selectedIndex != -1) {
        Settings.hexOutputMask = !! ($Q("#settings_hexoutput_mask").selectedIndex == 1);
    }

    Settings.reverseMemoryToObject = !! ($Q("#settings_reverse_calc_object").checked);

    updateGenerateButtons();
    saveSettings();
}

function updateSettingsDisplay() {
    const tsSI = [0, 0, 1, 1, 2, 2];
    $Q("#settings_triggerstyle").selectedIndex = tsSI[Settings.triggerStyle];
    $Q("#settings_hexoutput_memory").selectedIndex = Settings.hexOutputMemory ? 1 : 0;
    $Q("#settings_hexoutput_value").selectedIndex = Settings.hexOutputValue ? 1 : 0;
    $Q("#settings_hexoutput_mask").selectedIndex = Settings.hexOutputMask ? 1 : 0;
    $Q("#settings_reverse_calc_object").checked = !! Settings.reverseMemoryToObject;
    $Q("#settings_translate").selectedIndex = Settings.language;
}

function showSettings() {
    $I("settings_area").classList.remove("popup_hidden");
    makePopup($I("settings_area"));
}

function toggleSettings() {
    if($I("settings_area").classList.contains("popup_hidden")) {
        $I("settings_area").classList.remove("popup_hidden");
        makePopup($I("settings_area"));
    }
    else {
        $I("settings_area").classList.add("popup_hidden");
    }
}

function loadDefaultSettings() {
    try {
        const u = localStorage.getItem("eudscr_settings");
        loadSettings(JSON.parse(u));
        updateSettingsDisplay();
    }
    catch(e) {

    }
}

function initSettings() {
    
    $Q("#settings_triggerstyle").addEventListener("change", evt => updateSettings());
    $Q("#settings_hexoutput_memory").addEventListener("change", evt => updateSettings());
    $Q("#settings_hexoutput_value").addEventListener("change", evt => updateSettings());
    $Q("#settings_hexoutput_mask").addEventListener("change", evt => updateSettings());
    $Q("#settings_reverse_calc_object").addEventListener("change", evt => updateSettings());
    
    $Q("#settings_triggerstyle").addEventListener("mousedown", evt => evt.stopPropagation());
    $Q("#settings_hexoutput_memory").addEventListener("mousedown", evt => evt.stopPropagation());
    $Q("#settings_hexoutput_value").addEventListener("mousedown", evt => evt.stopPropagation());
    $Q("#settings_hexoutput_mask").addEventListener("mousedown", evt => evt.stopPropagation());
    $Q("#settings_reverse_calc_object").addEventListener("mousedown", evt => evt.stopPropagation());

    $Q("#settings_toggle").addEventListener(clickEvent, evt => toggleSettings());
    
    try {
        const u = localStorage.getItem("eudscr_settings");
        loadSettings(JSON.parse(u));
        updateSettingsDisplay();
    }
    catch(e) {

    }
}

exports.initSettings = initSettings;
exports.showSettings = showSettings;
exports.loadDefaultSettings = loadDefaultSettings;
exports.updateSettingsDisplay = updateSettingsDisplay;

})(window);