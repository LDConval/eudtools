const QRCode = require("qrcode");
const chkstructs = require("./chkstructs");
const {findChunk, replaceChunk} = require("./chunkfind");

/**
 * JSDoc Type Definition for Buffers.
 * @typedef buffer
 * @type {Buffer|Uint8Array|ArrayBuffer|Array}
 */

//                                           //
// ---------------- GENERAL ---------------- //
//                                           //

function createQRData(qrText, qrParams) {
    let qr = QRCode.create(qrText, qrParams);
    let out = [];
    let data = qr.modules.data;
    let size = qr.modules.size;
    for(let i=0; i<size; i++) {
        out.push(Array.from(data.slice(i * size, (i+1) * size)))
    }
    return out;
}

//                                         //
// ---------------- TILES ---------------- //
//                                         //

function multitile(mat, n) {
    return mat.map(row => row.map(val => Array(n).fill(val))
                             .reduce((t,a) => t.concat(a), []))
              .map(row => Array(n).fill(row))
              .reduce((t,a) => t.concat(a), []);
}

function setTile(tileArray, newTileArray, offsetX = 0, offsetY = 0) {
    for(let i = 0; i < newTileArray.length && i + offsetY < tileArray.length; i++) {
        for(let j = 0; j < newTileArray[0].length && j + offsetX < tileArray[0].length; j++) {
            tileArray[i + offsetY][j + offsetX] = newTileArray[i][j];
        }
    }
    return tileArray;
}

function getQRTiles(qrText, qrParams) {
    let tile0 = qrParams.tile0;
    let tile1 = qrParams.tile1;
    let size = qrParams.tileSize;

    let qrData = createQRData(qrText, qrParams);
    let qrTiles = qrData.map(row => row.map(item => item ? tile1 : tile0));

    if(size > 1) {
        qrTiles = multitile(qrTiles, size);
    }

    return qrTiles;
}

/**
 * Suggest a pair of tiles according to tileset.
 * @param {number} tileset - Integer from 0 to 7.
 * @returns {number[2]} Suggested tiles.
 */
function suggestTiles(tileset) {
    return [
        [0x80, 0x100],
        [0x60, 0x100],
        [0x20, 0x80],
        [0xC0, 0x20],
        [0xC0, 0x1A0],
        [0x80, 0x1A0],
        [0x40, 0x120],
        [0x80, 0x1A0]
    ][tileset];
}

/**
 * Main function for tile QRCodes.
 * @param {buffer} chkData - File buffer presented in Uint8Array, Buffer, or Array containing uint8s.
 * @param {string} qrText - Text to convert to QR code.
 * @param {Object} qrParams - parameters.
 * @param {number} qrParams.offsetX - X position to place units, measured in tile grids.
 * @param {number} qrParams.offsetY - Y position to place units, measured in tile grids.
 * @param {number} qrParams.tile0 - Tile value for negative grids.
 * @param {number} qrParams.tile1 - Tile value for positive grids.
 * @param {number} qrParams.tileSize - Tile size each grid.
 * @param {string} qrParams.errorCorrectionLevel - "L" = 7% correction, "M" = 15%, "H" = 30%
 * @returns {buffer} patched file buffer with additional QRCode tiles..
 */
function patchChkTileQR(chkData, qrText, qrParams = {}) {
    // Create the QRCode tiles.
    let qrTiles = getQRTiles(qrText, {
        tile0: qrParams.tile0 ?? 0x40,
        tile1: qrParams.tile1 ?? 0x1a0,
        tileSize: qrParams.tileSize ?? 2
    });

    // Read dimension information of the map.
    let dimData = findChunk(chkData, "DIM ");
    let dims = chkstructs.unpackDim(dimData.data);

    // Default position at center if not specified.
    let offsetX = qrParams.offsetX ?? ((dims.width - qrTiles[0].length) >> 1);
    let offsetY = qrParams.offsetY ?? ((dims.height - qrTiles.length) >> 1);

    // Patch MTXM section.
    let tileData = findChunk(chkData, "MTXM");
    let tiles = chkstructs.unpackTile(tileData.data, [dims.width, dims.height]);
    tiles = setTile(tiles, qrTiles, offsetX, offsetY);

    let repackedTiles = chkstructs.packTile(tiles);
    let newBuffer = replaceChunk(chkData, "MTXM", repackedTiles);

    // Patch TILE section. If it is not found ignore it.
    try {
        let tileDataSE = findChunk(chkData, "TILE");
        let tilesSE = chkstructs.unpackTile(tileDataSE.data, [dims.width, dims.height]);
        tilesSE = setTile(tilesSE, qrTiles, offsetX, offsetY);

        let repackedTilesSE = chkstructs.packTile(tilesSE);
        newBuffer = replaceChunk(newBuffer, "TILE", repackedTilesSE);
    }
    catch(e) {

    }

    return newBuffer;
}

//                                         //
// ---------------- UNITS ---------------- //
//                                         //

function createUnitObject(unitID, player, x, y) {
    return {
        classInstance: Math.floor(Math.random() * 2147483647), // 96979960+104*x
        x: x,
        y: y,
        unitID: unitID,
        relation: {},
        validFlags: {
            hallucinated: true,
            invincible: true
        },
        validProps: {
            owner: true
        },
        player: player,
        hp: 100,
        sp: 0,
        energy: 0,
        resources: 0,
        hangar: 0,
        stateFlags: {},
        relationCI: 0,
    };
}

function createStartLocation(player, x, y) {
    return createUnitObject(214, player, x, y);
}

function createQRUnits(qrText, qrParams) {
    let qrData = createQRData(qrText, qrParams);
    let player0 = qrParams.player0;
    let player1 = qrParams.player1;
    let size = qrData.length;

    let defUnitSize = qrParams.unitSize || 96;
    let mapSize = qrParams.mapSize;
    var l, r, t, b, unitSizeX, unitSizeY;
    if(qrParams.offsetX && qrParams.offsetY) {
        unitSizeX = defUnitSize;
        unitSizeY = defUnitSize;
        l = qrParams.offsetX;
        r = l + unitSizeX * size;
        t = qrParams.offsetY;
        b = b + unitSizeY * size;
    }
    else if(mapSize[0] <= defUnitSize * size || mapSize[1] <= defUnitSize * size) {
        l = 64;
        r = mapSize[0] - 64;
        t = 64;
        b = mapSize[1] - 64;
        unitSizeX = Math.round((r - l) / (qrData[0].length - 1));
        unitSizeY = Math.round((b - t) / (qrData.length - 1));
    }
    else {
        unitSizeX = defUnitSize;
        unitSizeY = defUnitSize;
        l = (mapSize[0] - defUnitSize * size) >> 1;
        r = mapSize[0] - l;
        t = (mapSize[1] - defUnitSize * size) >> 1;
        b = mapSize[1] - t;
    }
    let out = [];
    for(let i = 0; i < qrData.length; i++) {
        for(let j = 0; j < qrData[0].length; j++) {
            let x = l + j * unitSizeX;
            let y = t + i * unitSizeY;
            out.push(createStartLocation(qrData[i][j] ? player1 : player0, x, y));
        }
    }
    return out;
}

function arrayPadding(array) {
    return [Array(array.length+2).fill(0)].concat(array.map(row => [0].concat(row).concat([0]))).concat([Array(array.length+2).fill(0)]);
}

function mergeUnitsLayerDown(origUnits, qrUnits, usedPlayers) {
    let sLocsToMoveFront = origUnits.filter(u => u.unitID === 214 && usedPlayers.every(p => p != u));
    let otherUnits = origUnits.filter(u => u.unitID !== 214 || !usedPlayers.every(p => p != u));
    let u = mergeUnits(sLocsToMoveFront, qrUnits);
    return mergeUnits(u, otherUnits);
}

function mergeUnits(units1, units2) {
    return units1.concat(units2);
}

function getStartLocationSizes(mapSize) {
    let s = Math.max(mapSize[0], mapSize[1]);
    let t = s <= 64 ? 48 : s <= 96 ? 64 : s <= 128 ? 96 : s <= 192 ? 128 : 128;
    return [
        mapSize[0] * 32,
        mapSize[1] * 32,
        t,
        t,
        Math.floor(mapSize[0] * 32 / t),
        Math.floor(mapSize[1] * 32 / t)
    ];
}

function previewQR(canvasElem, qrText, qrParams) {
    QRCode.toCanvas(canvasElem, qrText, qrParams);
}

function validateUnitSection(len, buf) {
    return (len % 36 === 0) && (len < 3600000);
}

/**
 * Main function for unit QRCodes.
 * @param {buffer} chkData - File buffer presented in Uint8Array, Buffer, or Array containing uint8s.
 * @param {string} qrText - Text to convert to QR code.
 * @param {Object} qrParams - parameters.
 * @param {number} qrParams.player0 - Player used for 0 bits.
 * @param {number} qrParams.player1 - Player used for 1 bits.
 * @param {number} qrParams.offsetX - X position to place units, measured in game pixels.
 * @param {number} qrParams.offsetY - Y position to place units, measured in game pixels.
 * @param {boolean} qrParams.layerDown - Layer down start locations for other players. It looks better but not recommended if it is important for players to know where they would start.
 * @param {string} qrParams.errorCorrectionLevel - "L" = 7% correction, "M" = 15%, "H" = 30%
 * @returns {buffer} patched file buffer with additional QRCode units.
 */
function patchChkUnitQR(chkData, qrText, qrParams = {}) {
    // Read map dimensions
    let dimData = findChunk(chkData, "DIM ");
    let dims = chkstructs.unpackDim(dimData.data);

    // Default players 7 (white) and 6 (brown)
    qrParams.player0 = qrParams.player0 ?? 6;
    qrParams.player1 = qrParams.player1 ?? 5;

    // Patch QRParams with calculated dimension data
    let convDims = getStartLocationSizes([dims.width, dims.height]);
    qrParams.mapSize = [convDims[0], convDims[1]];
    qrParams.unitSize = convDims[2];

    let qrUnits = createQRUnits(qrText, qrParams)
                          .sort((a,b) => a.x - b.x);

    // Find and replace UNIT chunk section
    let unitsData = findChunk(chkData, "UNIT", validateUnitSection);
    let units = chkstructs.unpackAllUnits(unitsData.data);

    // Layer down start locations for other players.
    // This will make the qrcode harder to scan idk why.
    if(qrParams.layerDown) {
        var unitsNew = mergeUnitsLayerDown(units, qrUnits, [qrParams.player0, qrParams.player1]);
    }
    else {
        var unitsNew = mergeUnits(qrUnits, units);
    }

    let unitsNewBuffer = chkstructs.packAllUnits(unitsNew);
    return replaceChunk(chkData, "UNIT", unitsNewBuffer, validateUnitSection);
}

module.exports = {
    patchChkTileQR : patchChkTileQR,
    patchChkUnitQR : patchChkUnitQR,
    previewQR : previewQR,
    getStartLocationSizes : getStartLocationSizes,
    mergeUnits : mergeUnits,
    mergeUnitsLayerDown : mergeUnitsLayerDown,
    createStartLocation : createStartLocation,
    createUnitObject : createUnitObject,
    validateUnitSection : validateUnitSection,
    suggestTiles : suggestTiles
};