'use strict';

(function() {

    const unitTypes = ["Terran Marine", "Terran Ghost", "Terran Vulture", "Terran Goliath", "Goliath Turret", "Terran Siege Tank (Tank Mode)", "Tank Turret type   1", "Terran SCV", "Terran Wraith", "Terran Science Vessel", "Gui Montag (Firebat)", "Terran Dropship", "Terran Battlecruiser", "Vulture Spider Mine", "Nuclear Missile", "Terran Civilian", "Sarah Kerrigan (Ghost)", "Alan Schezar (Goliath)", "Alan Turret", "Jim Raynor (Vulture)", "Jim Raynor (Marine)", "Tom Kazansky (Wraith)", "Magellan (Science Vessel)", "Edmund Duke (Siege Tank)", "Duke Turret type   1", "Edmund Duke (Siege Mode)", "Duke Turret type   2", "Arcturus Mengsk (Battlecruiser)", "Hyperion (Battlecruiser)", "Norad II (Battlecruiser)", "Terran Siege Tank (Siege Mode)", "Tank Turret type   2", "Terran Firebat", "Scanner Sweep", "Terran Medic", "Zerg Larva", "Zerg Egg", "Zerg Zergling", "Zerg Hydralisk", "Zerg Ultralisk", "Zerg Broodling", "Zerg Drone", "Zerg Overlord", "Zerg Mutalisk", "Zerg Guardian", "Zerg Queen", "Zerg Defiler", "Zerg Scourge", "Torrasque (Ultralisk)", "Matriarch (Queen)", "Infested Terran", "Infested Kerrigan (Infested Terran)", "Unclean One (Defiler)", "Hunter Killer (Hydralisk)", "Devouring One (Zergling)", "Kukulza (Mutalisk)", "Kukulza (Guardian)", "Yggdrasill (Overlord)", "Terran Valkyrie", "Cocoon", "Protoss Corsair", "Protoss Dark Templar", "Zerg Devourer", "Protoss Dark Archon", "Protoss Probe", "Protoss Zealot", "Protoss Dragoon", "Protoss High Templar", "Protoss Archon", "Protoss Shuttle", "Protoss Scout", "Protoss Arbiter", "Protoss Carrier", "Protoss Interceptor", "Dark Templar (Hero)", "Zeratul (Dark Templar)", "Tassadar/Zeratul (Archon)", "Fenix (Zealot)", "Fenix (Dragoon)", "Tassadar (Templar)", "Mojo (Scout)", "Warbringer (Reaver)", "Gantrithor (Carrier)", "Protoss Reaver", "Protoss Observer", "Protoss Scarab", "Danimoth (Arbiter)", "Aldaris (Templar)", "Artanis (Scout)", "Rhynadon (Badlands)", "Bengalaas (Jungle)", "Unused type   1", "Unused type   2", "Scantid (Desert)", "Kakaru (Twilight)", "Ragnasaur (Ash World)", "Ursadon (Ice World)", "Zerg Lurker Egg", "Raszagal (Dark Templar)", "Samir Duran (Ghost)", "Alexei Stukov (Ghost)", "Map Revealer", "Gerard DuGalle (Ghost)", "Zerg Lurker", "Infested Duran", "Disruption Field", "Terran Command Center", "Terran Comsat Station", "Terran Nuclear Silo", "Terran Supply Depot", "Terran Refinery", "Terran Barracks", "Terran Academy", "Terran Factory", "Terran Starport", "Terran Control Tower", "Terran Science Facility", "Terran Covert Ops", "Terran Physics Lab", "Unused Terran Bldg type   1", "Terran Machine Shop", "Unused Terran Bldg type   2", "Terran Engineering Bay", "Terran Armory", "Terran Missile Turret", "Terran Bunker", "Norad II (Crashed Battlecruiser)", "Ion Cannon", "Uraj Crystal", "Khalis Crystal", "Infested Command Center", "Zerg Hatchery", "Zerg Lair", "Zerg Hive", "Zerg Nydus Canal", "Zerg Hydralisk Den", "Zerg Defiler Mound", "Zerg Greater Spire", "Zerg Queen's Nest", "Zerg Evolution Chamber", "Zerg Ultralisk Cavern", "Zerg Spire", "Zerg Spawning Pool", "Zerg Creep Colony", "Zerg Spore Colony", "Unused Zerg Bldg", "Zerg Sunken Colony", "Zerg Overmind (With Shell)", "Zerg Overmind", "Zerg Extractor", "Mature Crysalis", "Zerg Cerebrate", "Zerg Cerebrate Daggoth", "Unused Zerg Bldg 5", "Protoss Nexus", "Protoss Robotics Facility", "Protoss Pylon", "Protoss Assimilator", "Protoss Unused type   1", "Protoss Observatory", "Protoss Gateway", "Protoss Unused type   2", "Protoss Photon Cannon", "Protoss Citadel of Adun", "Protoss Cybernetics Core", "Protoss Templar Archives", "Protoss Forge", "Protoss Stargate", "Stasis Cell/Prison", "Protoss Fleet Beacon", "Protoss Arbiter Tribunal", "Protoss Robotics Support Bay", "Protoss Shield Battery", "Khaydarin Crystal Formation", "Protoss Temple", "Xel'Naga Temple", "Mineral Field (Type 1)", "Mineral Field (Type 2)", "Mineral Field (Type 3)", "Cave", "Cave-in", "Cantina", "Mining Platform", "Independent Command Center", "Independent Starport", "Jump Gate", "Ruins", "Kyadarin Crystal Formation", "Vespene Geyser", "Warp Gate", "Psi Disrupter", "Zerg Marker", "Terran Marker", "Protoss Marker", "Zerg Beacon", "Terran Beacon", "Protoss Beacon", "Zerg Flag Beacon", "Terran Flag Beacon", "Protoss Flag Beacon", "Power Generator", "Overmind Cocoon", "Dark Swarm", "Floor Missile Trap", "Floor Hatch (UNUSED)", "Left Upper Level Door", "Right Upper Level Door", "Left Pit Door", "Right Pit Door", "Floor Gun Trap", "Left Wall Missile Trap", "Left Wall Flame Trap", "Right Wall Missile Trap", "Right Wall Flame Trap", "Start Location", "Flag", "Young Chrysalis", "Psi Emitter", "Data Disc", "Khaydarin Crystal", "Mineral Chunk (Type 1)", "Mineral Chunk (Type 2)", "Vespene Orb (Protoss Type 1)", "Vespene Orb (Protoss Type 2)", "Vespene Sac (Zerg Type 1)", "Vespene Sac (Zerg Type 2)", "Vespene Tank (Terran Type 1)", "Vespene Tank (Terran Type 2)", "Invalid Unit"];

    const html = `
        <div class="labels" id="label_unitcreator_locnum">Loc ID: </div>
        <input type="text" id="input_unitcreator_locnum" value="17" />
        <div class="labels" id="label_unitcreator_locname">Loc Name: </div>
        <input type="text" id="input_unitcreator_locname" value="_CREATE" />
        <div class="labels" id="label_unitcreator_file">Units CHKFile: </div>
        <input type="file" id="input_unitcreator_file" value="0" />
        <div class="labels" id="label_unitcreator_player">Player: </div>
        <input type="text" id="input_unitcreator_player" value="8" />
        <div class="labels" id="label_unitcreator_cond">Conditions: </div>
        <textarea id="textarea_unitcreator_cond"></textarea>
        <div class="divbutton" id="parse_unitcreator">Parse</div>
    `;

    const css = `
        #label_unitcreator_locnum
        {
            top: 0px;
            left: 90px;
        }
        #label_unitcreator_locname
        {
            top: 0px;
            left: 215px;
        }
        #label_unitcreator_file
        {
            top: 26px;
            left: 37px;
        }
        #input_unitcreator_locnum
        {
            position: absolute;
            top: 0px;
            left: 150px;
            width: 50px;
        }
        #input_unitcreator_locname
        {
            position: absolute;
            top: 0px;
            left: 300px;
            width: 420px;
        }
        #input_unitcreator_file
        {
            position: absolute;
            top: 26px;
            left: 150px;
            width: 570px;
        }
        #parse_unitcreator
        {
            position: absolute;
            top: 57px;
            left: 150px;
            padding: 8px 11px 10px 11px;
        }
        #label_unitcreator_player
        {
            top: 108px;
            left: 89px;
        }
        #input_unitcreator_player
        {
            position: absolute;
            top: 108px;
            left: 150px;
            width: 150px;
        }
        #label_unitcreator_cond
        {
            top: 135px;
            left: 59px;
        }
        #textarea_unitcreator_cond
        {
            position: absolute;
            top: 135px;
            left: 150px;
            width: 450px;
            height: 100px;
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

    function basicTrigger(locID, locName) {
        return `
MemoryAddr(${5823584 + 20 * locID + 0}, Set To, 0);
MemoryAddr(${5823584 + 20 * locID + 4}, Set To, 0);
        `.trim();
    }

    function unitToTrigger(unit, locID, locName) {
        return `
MemoryAddr(${5823584 + 20 * locID + 8}, Set To, ${unit.x * 2});
MemoryAddr(${5823584 + 20 * locID + 12}, Set To, ${unit.y * 2});
Create Unit("Player ${unit.player+1}", "${unitTypes[unit.unitID]}", 1, "${locName}");
        `.trim();
    }

    async function parse() {
        if($("input_unitcreator_file").files.length > 0) {
            let file = $("input_unitcreator_file").files[0];
            let fileContent = await readFile(file);
            let uint8Result = new Uint8Array(fileContent);
            let chunk = findChunk(uint8Result, "UNIT");

            if(!chunk) {
                $("trigger_output").value += "Chunk not found!\n";
                return;
            }

            let unitData = splitChunk(chunk.data, 36).map(u => parseUnit(u));

            let locID = parseInt($("input_unitcreator_locnum").value) - 1;
            let locName = $("input_unitcreator_locname").value;

            let out = "";

            out += basicTrigger(locID, locName) + "\n" + unitData.map(u => unitToTrigger(u, locID, locName)).join("\n") + "\n";

            out += "Comment(\"Create Unit Triggers\");\n";

            let cond = $("textarea_unitcreator_cond").value;
            let player = "Player " + $("input_unitcreator_player").value;

            out = sliceTrigger(player, cond, out);

            $("trigger_output").value += out;
        }
    }

    function init() {
        $("parse_unitcreator").addEventListener("click", parse);
        if($("textarea_unitcreator_cond").value == "") {
            $("textarea_unitcreator_cond").value = "\tAlways();";
        }
    }

    const plugin = new Plugin(0x6f8080, 4, "Unit Creator", {
        name : "unitcreator",
        offset : 0,
        html : html,
        css : css,
        defaultDisplay : false,
        init : init,
        act : function() { }
    });
    registerPlugin(plugin);

})();