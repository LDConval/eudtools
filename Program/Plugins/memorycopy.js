'use strict';

(function() {

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

    const tf = triggerFormat;

    const html = `
        <div class="labels text_mid gd_s_labels gd_s_row_1" id="label_memorycopy_player">Player: </div>
        <input class="gd_s_input_x gd_s_row_1" type="text" id="input_memorycopy_player" value="" />
        <div class="labels text_mid gd_s_labels gd_s_row_2" id="label_memorycopy_conds">Conds: </div>
        <textarea class="gd_s_input_x gd_s_row_2" id="textarea_memorycopy_conds"></textarea>
        <div class="labels text_mid gd_s_labels gd_s_row_4" id="label_memorycopy_acts">Actions: </div>
        <textarea class="gd_s_input_x gd_s_row_4" id="textarea_memorycopy_acts"></textarea>
        <div class="labels text_mid gd_s_labels gd_s_row_6" class="labels" id="label_memorycopy_src">Source: </div>
        <input class="labels text_mid gd_s_labels gd_s_row_6" type="text" id="input_memorycopy_src" value="0x590000" />
        <div class="labels text_mid gd_s_labels gd_s_row_6" class="labels" id="label_memorycopy_dest">Dest: </div>
        <input class="labels text_mid gd_s_labels gd_s_row_6" type="text" id="input_memorycopy_dest" value="0x590000" />
        <div class="labels text_mid gd_s_labels gd_s_row_6" class="labels" id="label_memorycopy_minerals">Minerals: </div>
        <input class="gd_s_row_6" type="checkbox" id="input_memorycopy_minerals" />
        <div class="clickables text_mid gd_s_buttons memorycopy_buttons gd_s_row_7" type="checkbox" id="parse_memorycopy">Parse</div>
        <div class="labels text_mid gd_s_labels memorycopy_row_8" id="label_memorycopy_name_src">PlayerID: </div>
        <input class="labels text_mid gd_s_labels memorycopy_row_8" type="text" id="input_memorycopy_name_src" value="1" />
        <div class="labels text_mid memorycopy_row_8" id="label_memorycopy_name_srcMem">Memory: </div>
        <input class="labels text_mid gd_s_labels memorycopy_row_8" type="text" id="input_memorycopy_name_srcMem" value="0x6D0FDC" />
        <div class="labels text_mid memorycopy_row_8" id="label_memorycopy_name_dest">Dest: </div>
        <input class="labels text_mid gd_s_labels memorycopy_row_8" type="text" id="input_memorycopy_name_dest" value="0x6413E5" />
        <div class="labels text_mid gd_s_labels memorycopy_row_9" id="label_memorycopy_name_dummy">RepChar: </div>
        <input class="labels text_mid gd_s_labels memorycopy_row_9" type="text" id="input_memorycopy_name_dummy" value="3" />
        <div class="labels text_mid memorycopy_row_9" id="label_memorycopy_name_endcond">EndCond: </div>
        <input class="labels text_mid gd_s_labels memorycopy_row_9" type="text" id="input_memorycopy_name_endcond" value="Set Switch(&quot;Switch140&quot;, Clear);" />
        <div class="clickables text_mid gd_s_buttons memorycopy_buttons memorycopy_row_10" id="parse_memorycopy_name">CopyName</div>
    `;

    const css = `
        #plugin_memorycopy_area {
            grid-template-columns: 6em minmax(3em, 1fr) minmax(5em, 1fr) minmax(3em, 1fr) minmax(5em, 1fr) minmax(3em, 1fr) 3em 5px;
            grid-template-rows: 5px 2em 2em 2em 2em 2em 2em 2em 2em 2em 1fr 5px;
        }
        #input_memorycopy_player, #textarea_memorycopy_conds, #textarea_memorycopy_acts {
            grid-column: 2 / 7;
        }
        .memorycopy_buttons {
            grid-column: 2 / 4;
        }
        #textarea_memorycopy_conds{
            grid-row: 3 / 5;
        }
        #textarea_memorycopy_acts{
            grid-row: 5 / 7;
        }
        #input_memorycopy_src, #input_memorycopy_name_src, #input_memorycopy_name_dummy {
            grid-column: 2 / 3;
        }
        #label_memorycopy_dest, #label_memorycopy_name_srcMem, #label_memorycopy_name_endcond {
            grid-column: 3 / 4;
        }
        #input_memorycopy_dest, #input_memorycopy_name_srcMem {
            grid-column: 4 / 5;
        }
        #label_memorycopy_minerals, #label_memorycopy_name_dest {
            grid-column: 5 / 6;
        }
        #input_memorycopy_minerals, #input_memorycopy_name_dest {
            grid-column: 6 / 7;
        }
        #input_memorycopy_name_endcond {
            grid-column: 4 / 7;
        }
        .memorycopy_row_8 {
            grid-row: 9;
        }
        .memorycopy_row_9 {
            grid-row: 10;
        }
        .memorycopy_row_10 {
            grid-row: 11;
        }
    `;

    async function parse() {
        let player = $("input_memorycopy_player").value;
        let conds = $("textarea_memorycopy_conds").value;
        let acts = $("textarea_memorycopy_acts").value;
        let src = parseInt($("input_memorycopy_src").value);
        let dest = parseInt($("input_memorycopy_dest").value);
        let minerals = !!$("input_memorycopy_minerals").checked;
        let out = (minerals ? tf(`
            Trigger("${player}"){
            Conditions:
                ${conds}

            Actions:
                MemoryAddr(${dest}, Set To, 0);
                Set Resources("Player 1", Set To, 0, ore);
                ${acts}
            }

            //-----------------------------------------------------------------//
        `) : tf(`
            Trigger("${player}"){
            Conditions:
                ${conds}

            Actions:
                MemoryAddr(${dest}, Set To, 0);
                ${acts}
            }

            //-----------------------------------------------------------------//
        `)) + duplicateTrigger(tf(`
            Trigger("${player}"){
            Conditions:
                Masked MemoryAddr(${src}, At least, [^], [^]);
                ${conds}

            Actions:
                Masked MemoryAddr(${dest}, Set To, [^], [^]);`
            + (minerals ? `
                Set Resources("Player 1", Add, [^], ore);` : "") + `
                ${acts}
            }

            //-----------------------------------------------------------------//
        `), 32, "");
        $("trigger_output").value += out;
    }

    function parseName() {
        let player = $("input_memorycopy_player").value;
        let conds = $("textarea_memorycopy_conds").value;
        let acts = $("textarea_memorycopy_acts").value;
        let srcBase = parseInt($("input_memorycopy_name_srcMem").value);
        let destBase = parseInt($("input_memorycopy_name_dest").value);
        let src = srcBase;
        let dest = destBase;
        let replacementVal = parseInt($("input_memorycopy_name_dummy").value);
        if(!isFinite(replacementVal)) {
            replacementVal = $("input_memorycopy_name_dummy").value.charCodeAt(0);
        }
        let endCond = $("input_memorycopy_name_endcond").value;
        let out = "";
        for(let i=0; i<24; i++) {
            out += tf(`
                Trigger("${player}"){
                Conditions:
                ${conds}

                Actions:
                    Masked MemoryAddr(${dest - dest%4}, Set To, 0, ${255 << ((dest%4) * 8)});
                ${acts}
                }

                //-----------------------------------------------------------------//
            `);
            out += tf(`
                Trigger("${player}"){
                Conditions:
                ${conds}
                    Masked MemoryAddr(${src - src%4}, Exactly, 0, ${255 << ((src%4) * 8)});

                Actions:
                    Masked MemoryAddr(${dest - dest%4}, Set To, ${replacementVal << ((dest%4) * 8)}, ${255 << ((dest%4) * 8)});
                    ${endCond}
                ${acts}
                }

                //-----------------------------------------------------------------//
            `);
            for(let b=7; b>=0; b--) {
                out += tf(`
                    Trigger("${player}"){
                    Conditions:
                    ${conds}
                        Masked MemoryAddr(${src - src%4}, At least, ${1 << (b + (src%4) * 8)}, ${1 << (b + (src%4) * 8)});

                    Actions:
                        Masked MemoryAddr(${dest - dest%4}, Set To, ${1 << (b + (dest%4) * 8)}, ${1 << (b + (dest%4) * 8)});
                    ${acts}
                    }

                    //-----------------------------------------------------------------//
                `);
            }
            src++;
            dest++;
        }
        out += tf(`
            Trigger("${player}"){
            Conditions:
            ${conds}

            Actions:
                ${endCond}
            }

            //-----------------------------------------------------------------//
        `);
        $("trigger_output").value += out;
    }

    function nameMemUpd() {
        $("input_memorycopy_name_srcMem").value = 0x6D0FDC + 36 * (parseInt($("input_memorycopy_name_src").value) - 1);
    }

    function init() {
        $("parse_memorycopy").addEventListener("click", parse);
        $("parse_memorycopy_name").addEventListener("click", parseName);
        $("input_memorycopy_name_src").addEventListener("keyup", evt => setTimeout(nameMemUpd, 50));
        if($("input_memorycopy_player").value == "") {
            $("input_memorycopy_player").value = "Player 1";
            $("textarea_memorycopy_conds").value = "    Switch(\"Switch140\", Set);";
        }
    }

    const plugin = new Plugin(0x6f8084, 4, "Memory Copy", {
        name : "memorycopy",
        offset : 0,
        html : html,
        css : css,
        defaultDisplay : false,
        init : init,
        act : function() { }
    });
    registerPlugin(plugin);

})();