'use strict';

(function() {

    const html = `
        <div class="labels" id="label_startlocconverter_source">Source UnitID: </div>
        <input type="text" id="input_startlocconverter_source" value="17" />
        <div class="labels" id="label_startlocconverter_target">Target UnitID: </div>
        <input type="text" id="input_startlocconverter_target" value="214" />
        <div class="labels" id="label_startlocconverter_file">CHKFile: </div>
        <input type="file" id="input_startlocconverter_file" value="0" />
        <div class="divbutton" id="parse_startlocconverter">Parse</div>
        <a id="downloader_startlocconverter"></a>
    `;

    const css = `
        #label_startlocconverter_source
        {
            top: 0px;
            left: 40px;
        }
        #label_startlocconverter_target
        {
            top: 26px;
            left: 42px;
        }
        #label_startlocconverter_file
        {
            top: 52px;
            left: 80px;
        }
        #input_startlocconverter_source
        {
            position: absolute;
            top: 0px;
            left: 150px;
            width: 570px;
        }
        #input_startlocconverter_target
        {
            position: absolute;
            top: 26px;
            left: 150px;
            width: 570px;
        }
        #input_startlocconverter_file
        {
            position: absolute;
            top: 52px;
            left: 150px;
            width: 570px;
        }
        #parse_startlocconverter
        {
            position: absolute;
            top: 83px;
            left: 150px;
            padding: 8px 11px 10px 11px;
        }
        #downloader_startlocconverter
        {
            display: none;
        }
    `;

    function readFile(file) {
        return new Promise((res, rej) => {
            let reader = new FileReader();
            reader.onload = function(evt) {
                res(evt.target.result);
            }
            reader.readAsArrayBuffer(file);
        });
    }

    function findChunk(array, head) {
        let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
        let found = -1;
        for(let i=0; i<array.length; i++) {
            if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
                found = i;
                break;
            }
        }
        if(found == -1) {
            return null;
        }
        let chunkLength = array[found+4] + (array[found+5] << 8) + (array[found+6] << 16) + (array[found+7] << 24);
        return {
            chunkPosition: found,
            chunkLength: chunkLength,
            chunkLengthTotal: chunkLength + 8,
            data: array.slice(found + 8, found + chunkLength + 8)
        };
    }

    function replaceChunk(array, head, newChunk) {
        let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
        let found = -1;
        for(let i=0; i<array.length; i++) {
            if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
                found = i;
                break;
            }
        }
        if(found == -1) {
            return null;
        }
        let chunkLength = array[found+4] + (array[found+5] << 8) + (array[found+6] << 16) + (array[found+7] << 24);
        console.log(array.length);
        let output = array.slice(0, found).concat(b).concat(dword2bytes(newChunk.length)).concat(newChunk).concat(array.slice(found + chunkLength + 8));
        console.log(output.length);
        return output;
    }

    function splitChunk(data, len) {
        var out = [];
        for(let i=0; i<data.length; i+=len) {
            out.push(data.slice(i, i+len));
        }
        return out;
    }

    function byte2(array) {
        return array[0] + (array[1] << 8);
    }

    function byte4(array) {
        let n = array[0] + (array[1] << 8) + (array[2] << 16) + (array[3] << 24);
        return (n<0) ? n+0x100000000 : n;
    }

    function parseUnit(unitChunk) {
        return {
            classInstance : byte4(unitChunk.slice(0,  4)),
            x :             byte2(unitChunk.slice(4,  6)),
            y :             byte2(unitChunk.slice(6,  8)),
            unitID :        byte2(unitChunk.slice(8,  10)),
            relation :      byte2(unitChunk.slice(10, 12)),
            validFlags :    byte2(unitChunk.slice(12, 14)),
            validProps :    byte2(unitChunk.slice(14, 16)),
            player :        unitChunk[16],
            hp :            unitChunk[17],
            sp :            unitChunk[18],
            energy :        unitChunk[19],
            resources :     byte4(unitChunk.slice(20, 24)),
            hangar :        byte2(unitChunk.slice(24, 26)),
            stateFlags :    byte2(unitChunk.slice(26, 28)),
            relationCI :    byte4(unitChunk.slice(32, 36))
        };
    }

    function rebuildChunk(unitData) {
        return unitData.map(d => {
            return   dword2bytes(d.classInstance)
            .concat( word2bytes(d.x) )
            .concat( word2bytes(d.y) )
            .concat( word2bytes(d.unitID) )
            .concat( word2bytes(d.relation) )
            .concat( word2bytes(d.validFlags) )
            .concat( word2bytes(d.validProps) )
            .concat( [ d.player ] )
            .concat( [ d.hp ] )
            .concat( [ d.sp ] )
            .concat( [ d.energy ] )
            .concat( dword2bytes(d.resources) )
            .concat( word2bytes(d.hangar) )
            .concat( word2bytes(d.stateFlags) )
            .concat( [0, 0, 0, 0] )
            .concat( dword2bytes(d.relationCI) )
        }).reduce((a,b) => a.concat(b), []);
    }

    function saveFile(buffer, filename, linkElem) {
        let blob = new Blob([buffer]);
        let url = URL.createObjectURL(blob);
        linkElem.href = url;
        linkElem.download = filename;
        linkElem.click();
    }

    async function parse() {
        if($("input_startlocconverter_file").files.length > 0) {
            let file = $("input_startlocconverter_file").files[0];
            let fileContent = await readFile(file);
            let uint8Result = Array.from(new Uint8Array(fileContent));
            let chunk = findChunk(uint8Result, "UNIT");

            let sourceID = parseInt($("input_startlocconverter_source").value);
            let targetID = parseInt($("input_startlocconverter_target").value);

            if(!chunk) {
                $("trigger_output").value += "Chunk not found!\n";
                return;
            }

            let unitData = splitChunk(chunk.data, 36).map(u => parseUnit(u));

            let convertedUnitData = unitData.map(s => {
                if(s.unitID == sourceID) {
                    s.unitID = targetID;
                }
                return s;
            });

            let rebuiltChunk = rebuildChunk(convertedUnitData);

            let convertedMapData = replaceChunk(uint8Result, "UNIT", rebuiltChunk);

            let outBuffer = new Uint8Array(convertedMapData);

            saveFile(outBuffer, "scenario.chk", $("downloader_startlocconverter"));
        }
    }

    function init() {
        $("parse_startlocconverter").addEventListener("click", parse);
    }

    const plugin = new Plugin(0x6f8088, 4, "StartLoc Converter", {
        name : "startlocconverter",
        offset : 0,
        html : html,
        css : css,
        defaultDisplay : false,
        init : init,
        act : function() { }
    });
    registerPlugin(plugin);

})();