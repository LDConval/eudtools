const objpacker = require("./objpacker");

function unpackTile(buffer, tileSize) {
    if(!tileSize) {
        // unpack everything
        let i16Array = new Uint16Array(buffer.buffer || buffer,
                                       buffer.byteOffset || 0,
                                       (buffer.byteLength || buffer.length) >> 1
                                       );
        return Array.from(i16Array);
    }
    else {
        let [w, h] = tileSize;
        let retArray = new Uint16Array(w * h);
        let inpArray = new Uint16Array(buffer.buffer || buffer,
                                       buffer.byteOffset || 0,
                                       (buffer.byteLength || buffer.length) >> 1
                                       );
        retArray.set(inpArray.slice(0, w * h));
        let a = [];
        for(let i=0; i<h; i++) {
            a.push(Array.from(retArray.slice(i * w, (i+1) * w)));
        }
        return a;
    }
}

function packTile(arrayInput) {
    let array;
    if(arrayInput[0].length > 0) { // 2-dim array
        array = arrayInput.reduce((t,a) => t.concat(a), []);
    }
    else {
        array = arrayInput;
    }
    let i16a = new Uint16Array(array);
    return new Uint8Array(i16a.buffer);
}

function unpackDim(buffer) {
    return objpacker.unpack("<HH", ["width", "height"], buffer);
}

function packDim(obj) {
    return objpacker.pack("<HH", ["width", "height"], obj);
}

const unitStructPattern = "<I6H4BIHHI";
const unitStructNames = ["classInstance", "x", "y", "unitID",
                         "relation", "validFlags", "validProps", "player",
                         "hp", "sp", "energy", "resources",
                         "hangar", "stateFlags", "relationCI"
                        ];
const unitStateBits = ["cloak", "burrow", "transit", "hallucinated", "invincible"];
const validPropBits = ["owner", "hp", "shield", "energy", "resource", "hangar"];
const relationBits = ["_0", "_1", "_2", "_3", "_4", "_5", "_6", "_7", "_8", "nydus", "addon"];

function unpackUnit(buffer) {
    let unpacked = objpacker.unpack(unitStructPattern, unitStructNames, buffer);
    unpacked.validFlags = objpacker.unpackFlags(unpacked.validFlags, unitStateBits);
    unpacked.validProps = objpacker.unpackFlags(unpacked.validProps, validPropBits);
    unpacked.relation = objpacker.unpackFlags(unpacked.relation, relationBits, true);
    unpacked.stateFlags = objpacker.unpackFlags(unpacked.stateFlags, unitStateBits);
    return unpacked;
}

function unpackAllUnits(buffer) {
    let out = [];
    for(let i=0; i<buffer.length; i+=36) {
        out.push(unpackUnit(buffer.slice(i, i + 36)));
    }
    return out;
}

function packUnit(obj) {
    let objToPack = {};
    unitStructNames.forEach(key => {
        switch(key) {
            case "relation":
                objToPack[key] = objpacker.packFlags(obj[key], relationBits);
                break;
            case "validFlags":
            case "stateFlags":
                objToPack[key] = objpacker.packFlags(obj[key], unitStateBits);
                break;
            case "validProps":
                objToPack[key] = objpacker.packFlags(obj[key], validPropBits);
                break;
            default:
                objToPack[key] = obj[key];
                break;
        }
    });
    return objpacker.pack(unitStructPattern, unitStructNames, objToPack);
}

function packAllUnits(units) {
    let buffer = new Uint8Array(36 * units.length);
    units.map(packUnit).forEach((buf, i) => {
        buffer.set(buf, i * 36);
    });
    return buffer;
}

module.exports = {
    packUnit : packUnit,
    unpackUnit : unpackUnit,
    packAllUnits : packAllUnits,
    unpackAllUnits : unpackAllUnits,
    packTile : packTile,
    unpackTile : unpackTile,
    packDim : packDim,
    unpackDim : unpackDim,
};