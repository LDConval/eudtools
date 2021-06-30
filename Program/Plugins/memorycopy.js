'use strict';

(function() {

    const tf = triggerFormat;

    const html = `
        <div class="labels" id="label_memorycopy_player">Player: </div>
        <input type="text" id="input_memorycopy_player" value="" />
        <div class="labels" id="label_memorycopy_conds">Conds: </div>
        <textarea id="textarea_memorycopy_conds"></textarea>
        <div class="labels" id="label_memorycopy_acts">Actions: </div>
        <textarea id="textarea_memorycopy_acts"></textarea>
        <hr id="hr_memorycopy_1" />
        <div class="labels" id="label_memorycopy_src">Source: </div>
        <input type="text" id="input_memorycopy_src" value="0x590000" />
        <div class="labels" id="label_memorycopy_dest">Dest: </div>
        <input type="text" id="input_memorycopy_dest" value="0x590000" />
        <div class="labels" id="label_memorycopy_minerals">Minerals: </div>
        <input type="checkbox" id="input_memorycopy_minerals" />
        <div class="divbutton" id="parse_memorycopy">Parse</div>
        <hr id="hr_memorycopy_2" />
        <div class="labels" id="label_memorycopy_name_src">PlayerID: </div>
        <input type="text" id="input_memorycopy_name_src" value="1" />
        <div class="labels" id="label_memorycopy_name_srcMem">Memory: </div>
        <input type="text" id="input_memorycopy_name_srcMem" value="0x6D0FDC" />
        <div class="labels" id="label_memorycopy_name_dest">Dest: </div>
        <input type="text" id="input_memorycopy_name_dest" value="0x6413E5" />
        <div class="labels" id="label_memorycopy_name_dummy">RepChar: </div>
        <input type="text" id="input_memorycopy_name_dummy" value="3" />
        <div class="labels" id="label_memorycopy_name_endcond">EndCond: </div>
        <input type="text" id="input_memorycopy_name_endcond" value="Set Switch(&quot;Switch140&quot;, Clear);" />
        <div class="divbutton" id="parse_memorycopy_name">CopyName</div>
    `;

    const css = `
        #label_memorycopy_player
        {
            top: 0px;
            left: 90px;
        }
        #label_memorycopy_conds
        {
            top: 26px;
            left: 93px;
        }
        #label_memorycopy_acts
        {
            top: 96px;
            left: 85px;
        }
        #input_memorycopy_player
        {
            position: absolute;
            top: 0px;
            left: 150px;
            width: 420px;
        }
        #textarea_memorycopy_conds
        {
            position: absolute;
            top: 26px;
            left: 150px;
            height: 60px;
            width: 420px;
        }
        #textarea_memorycopy_acts
        {
            position: absolute;
            top: 96px;
            left: 150px;
            height: 60px;
            width: 420px;
        }
        #hr_memorycopy_1
        {
            position: absolute;
            top: 165px;
            left: 150px;
            width: 420px;
        }
        #label_memorycopy_src
        {
            top: 190px;
            left: 90px;
        }
        #label_memorycopy_dest
        {
            top: 190px;
            left: 265px;
        }
        #label_memorycopy_minerals
        {
            top: 190px;
            left: 425px;
        }
        #input_memorycopy_src
        {
            position: absolute;
            top: 190px;
            left: 150px;
            width: 100px;
        }
        #input_memorycopy_dest
        {
            position: absolute;
            top: 190px;
            left: 310px;
            width: 100px;
        }
        #input_memorycopy_minerals
        {
            position: absolute;
            top: 190px;
            left: 495px;
        }
        #parse_memorycopy
        {
            position: absolute;
            top: 217px;
            left: 150px;
            padding: 8px 11px 10px 11px;
        }
        #hr_memorycopy_2
        {
            position: absolute;
            top: 262px;
            left: 150px;
            width: 420px;
        }
        #label_memorycopy_name_src
        {
            top: 285px;
            left: 80px;
        }
        #label_memorycopy_name_srcMem
        {
            top: 285px;
            left: 215px;
        }
        #label_memorycopy_name_dest
        {
            top: 285px;
            left: 400px;
        }
        #label_memorycopy_name_dummy
        {
            top: 311px;
            left: 80px;
        }
        #label_memorycopy_name_endcond
        {
            top: 311px;
            left: 210px;
        }
        #input_memorycopy_name_src
        {
            position: absolute;
            top: 285px;
            left: 150px;
            width: 50px;
        }
        #input_memorycopy_name_srcMem
        {
            position: absolute;
            top: 285px;
            left: 285px;
            width: 100px;
        }
        #input_memorycopy_name_dest
        {
            position: absolute;
            top: 285px;
            left: 445px;
            width: 100px;
        }
        #input_memorycopy_name_dummy
        {
            position: absolute;
            top: 311px;
            left: 150px;
            width: 50px;
        }
        #input_memorycopy_name_endcond
        {
            position: absolute;
            top: 311px;
            left: 285px;
            width: 260px;
        }
        #parse_memorycopy_name
        {
            position: absolute;
            top: 340px;
            left: 150px;
            padding: 8px 11px 10px 11px;
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