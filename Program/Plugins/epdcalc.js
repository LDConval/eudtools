'use strict';

(function() {

    const html = `
        <div class="labels" id="label_epdcalc_memory">Memory: </div>
        <input type="text" id="input_epdcalc_memory" value="0" />
        <div class="labels" id="label_epdcalc_value">Value: </div>
        <input type="text" id="input_epdcalc_value" value="0" />
        <div class="labels" id="label_epdcalc_length">Length: </div>
        <input type="text" id="input_epdcalc_length" value="4" />
        <hr id="hr_epdcalc" />
        <div class="labels" id="label_epdcalc_player">EPD PlayerID: </div>
        <input type="text" id="input_epdcalc_player" value="0" />
        <div class="labels" id="label_epdcalc_multiplier">Multiplier: </div>
        <input type="text" id="input_epdcalc_multiplier" value="0" />
        <div class="divbutton" id="button_epdcalc_setcp">Set CP</div>
        <div class="divbutton" id="button_epdcalc_setvalue">Set Value from CP</div>
    `;

    const css = `
        #label_epdcalc_memory
        {
            top: 0px;
            left: 82px;
        }
        #label_epdcalc_value
        {
            top: 30px;
            left: 99px;
        }
        #label_epdcalc_length
        {
            top: 30px;
            left: 315px;
        }
        #label_epdcalc_player
        {
            top: 70px;
            left: 47px;
        }
        #label_epdcalc_multiplier
        {
            top: 100px;
            left: 69px;
        }
        #hr_epdcalc
        {
            position: absolute;
            top: 52px;
            left: 150px;
            width: 420px;
        }
        #input_epdcalc_memory
        {
            position: absolute;
            top: 0px;
            left: 150px;
            width: 150px;
        }
        #input_epdcalc_value
        {
            position: absolute;
            top: 30px;
            left: 150px;
            width: 150px;
        }
        #input_epdcalc_length
        {
            position: absolute;
            top: 30px;
            left: 375px;
            width: 50px;
        }
        #input_epdcalc_player
        {
            position: absolute;
            top: 70px;
            left: 150px;
            width: 150px;
        }
        #input_epdcalc_multiplier
        {
            position: absolute;
            top: 100px;
            left: 150px;
            width: 150px;
        }
        #button_epdcalc_setcp
        {
            position: absolute;
            top: 130px;
            left: 150px;
            padding: 8px 11px 10px 11px;
        }
        #button_epdcalc_setvalue
        {
            position: absolute;
            top: 130px;
            left: 245px;
            padding: 8px 11px 10px 11px;
        }
    `;

    function updateEPD() {
        let memory = parseInt($("input_epdcalc_memory").value);
        let value = parseInt($("input_epdcalc_value").value);

        const deathTableStart = 0x58A364;
        let epd = (memory - memory%4 - deathTableStart) >>> 2;
        let multiplier = 1 << (8 * (memory%4));

        $("input_epdcalc_player").value = epd;
        $("input_epdcalc_multiplier").value = multiplier;
    }

    function updateMem() {
        let epd = parseInt($("input_epdcalc_player").value);
        let multiplier = parseInt($("input_epdcalc_multiplier").value);

        let multiplierBytes = multiplier >= 0x1000000 ? 3 : (multiplier >= 0x10000 ? 2 : (multiplier >= 0x100 ? 1 : 0))

        const deathTableStart = 0x58A364;
        let memory = deathTableStart + 4 * epd + multiplierBytes;

        $("input_epdcalc_memory").value = memory;
    }

    function setCP() {
        const triggerPattern_normal = getTriggerPattern(TriggerPatterns.NORMAL);
        let epd = parseInt($("input_epdcalc_player").value);
        $("trigger_output").value += calculateTrigger(triggerPattern_normal, 0x6509B0, epd, 4, true);
    }
    function setValue() {
        let epd = parseInt($("input_epdcalc_memory").value);
        let val = parseInt($("input_epdcalc_value").value);
        let multiplier = parseInt($("input_epdcalc_multiplier").value);
        let len = parseInt($("input_epdcalc_length").value);
        const triggerPattern_masked = getTriggerPattern(TriggerPatterns.MASKED);
        const triggerPattern_cpt = getTriggerPattern(TriggerPatterns.CPT);

        if(len != 4 && len != 0) {
            let mask = (len == 2 ? 0xFFFF : (len == 3 ? 0xFFFFFF : 0xFF))
            $("trigger_output").value += calculateTrigger(triggerPattern_masked, 0x58A398, val * multiplier, 4, true, mask * multiplier);
        }
        else {
            $("trigger_output").value += calculateTrigger(triggerPattern_cpt, 0, val * multiplier, 4, true);
        }
    }

    function init() {
        $("button_epdcalc_setcp").addEventListener("click", setCP);
        $("button_epdcalc_setvalue").addEventListener("click", setValue);
        $("input_epdcalc_memory").addEventListener("keyup", evt => setTimeout(updateEPD, 50));
        $("input_epdcalc_player").addEventListener("keyup", evt => setTimeout(updateMem, 50));
        $("input_epdcalc_multiplier").addEventListener("keyup", evt => setTimeout(updateMem, 50));
    }

    const plugin = new Plugin(0x58a060, 4, "EPD CP Calculator", {
        name : "epdcalc",
        offset : 0,
        html : html,
        css : css,
        defaultDisplay : false,
        init : init,
        act : function() { }
    });
    registerPlugin(plugin);

})();