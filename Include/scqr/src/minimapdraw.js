const chkstructs = require("./chkstructs");
const {findChunk, replaceChunk} = require("./chunkfind");
const {getStartLocationSizes, mergeUnits, mergeUnitsLayerDown, createStartLocation, createUnitObject, validateUnitSection} = require("./scqr");
const {findNearestColorIndex} = require("./nearestcolor");

const playerColors = [
    [244, 4, 4],
    [12, 72, 204],
    [44, 180, 148],
    [136, 64, 156],
    [248, 140, 20],
    [112, 48, 20],
    [240, 240, 240],
    [204, 224, 208],
    [8, 128, 8],
    [252, 252, 124],
    [236, 196, 176],
    [64, 104, 212]
];
const resourceColor = [0, 228, 252];

async function getImageFileData(imgFile, canvas, options) {
    let width, height;
    let fr = new FileReader();
    let loadedImage = await new Promise((res, rej) => {
        fr.readAsDataURL(imgFile);
        fr.onload = evt => {
            let im = new Image();
            im.src = fr.result;
            im.addEventListener("load", evt => {
                width = options.width || im.width;
                height = options.height || im.height;
                res(im);
            });
            im.addEventListener("error", rej);
        }
        fr.onerror = rej;
    });

    canvas.drawImage(loadedImage, 0, 0, width, height);
    return Array.from(canvas.getImageData(0, 0, width, height).data);
}

function approxPlayerColors(colors, useResource) {
    let approxColors = [[0, 0, 0]].concat(playerColors);
    let transparentIndex = -1;
    let resourceIndex = playerColors.length + 1;
    let resourceOutIndex = -2;
    if(useResource) {
        approxColors = approxColors.concat([resourceColor]);
    }

    return colors.map(row => row.map(color => {
        let nearest = findNearestColorIndex(color, approxColors);
        return nearest == 0 ? transparentIndex : nearest == resourceIndex ? resourceOutIndex : nearest - 1
    }));
}

function applyPlayerColors(pColors) {
    return pColors.map(row => row.map(pColor => {
        if(pColor == -1) {
            return [0, 0, 0]; // change to rgba(0, 0, 0, 0) if applicable
        }
        else if(pColor == -2) {
            return resourceColor;
        }
        else {
            return playerColors[pColor];
        }
    }));
}

function previewPlayerColors(pColors, canvas) {
    let imgData = applyPlayerColors(pColors);
    canvas.putImageData(imgData, 0, 0);
}

function createGas(x, y) {
    // The gas is created for P11. remove them using triggers from the beginning.
    return createUnitObject(188, 10, x, y);
}

function createColoredStartLocations(pColors, dims, options) {
    let [totalX, totalY, unitSizeX, unitSizeY, maxX, maxY] = getStartLocationSizes(dims);
    let out = [];
    let outGas = [];
    let offsetX = options.offsetX || 0;
    let offsetY = options.offsetX || 0;
    for(let i = 0; i < maxY && i < pColors.length; i++) {
        for(let j = 0; j < maxX && j < pColors[0].length; j++) {
            let playerID = pColors[i][j];
            if(playerID != -1) {
                if(playerID == -2) {
                    let x = Math.round(offsetX + (j + 0.5) * unitSizeX);
                    let y1 = Math.round(offsetY + (i + 0.5) * unitSizeY - 16);
                    let y2 = Math.round(offsetY + (i + 0.5) * unitSizeY + 16);
                    outGas.push(createGas(x, y1));
                    outGas.push(createGas(x, y2));
                }
                else {
                    let x = Math.round(offsetX + (j + 0.5) * unitSizeX);
                    let y = Math.round(offsetY + (i + 0.5) * unitSizeY);
                    out.push(createStartLocation(pColors[i][j], x, y));
                }
            }
        }
    }
    return [out, outGas];
}

function chunkize(array, n) {
    return array.reduce((r, e, i) =>
        (i % n ? r[r.length - 1].push(e) : r.push([e])) && r
    , []);
}

/**
 * Main function for Minimap Drawer.
 * @param {buffer} chkData - File buffer presented in Uint8Array, Buffer, or Array containing uint8s.
 * @param {string} imageFile - image file uploaded through input.
 * @param {Object} options - parameters.
 * @param {number} options.canvas - must provide a valid canvas context (canvas.getContext('2d')).
 * @param {number} options.offsetX - X position to place units, measured in game pixels.
 * @param {number} options.offsetY - Y position to place units, measured in game pixels.
 * @param {number} options.width - width, number of units.
 * @param {number} options.height - height, number of units.
 * @param {boolean} options.useGas - whether or not using player 11 gases are allowed.
 * @param {boolean} options.layerDown - move all start locations behind the image.
 * @returns {buffer} patched file buffer with additional units.
 */
async function patchChkDrawMinimap(chkData, imageFile, options = {}) {
    // Read map dimensions
    let dimData = findChunk(chkData, "DIM ");
    let dims = chkstructs.unpackDim(dimData.data);

    let sizeParams = getStartLocationSizes([dims.width, dims.height]);

    let width = options.width || sizeParams[4];
    let height = options.height || sizeParams[5];
    let useGas = options.useGas;

    var imageData = await getImageFileData(imageFile, options.canvas, {
        width : width,
        height : height
    });

    let chunkedBuf = chunkize(imageData, 4);
    let gridBuf = chunkize(chunkedBuf, width);

    let pColors = approxPlayerColors(gridBuf, useGas);
    let startLocs = createColoredStartLocations(pColors, [dims.width, dims.height], {
        offsetX : options.offsetX,
        offsetY : options.offsetY
    });
    let minimapUnits = startLocs[0];
    let gasUnits = startLocs[1];

    let unitsData = findChunk(chkData, "UNIT", validateUnitSection);
    let units = chkstructs.unpackAllUnits(unitsData.data);

    let unitsNew = mergeUnits(minimapUnits, units);
    unitsNew = mergeUnits(unitsNew, gasUnits);

    let unitsNewBuffer = chkstructs.packAllUnits(unitsNew);

    let newBuffer = replaceChunk(chkData, "UNIT", unitsNewBuffer, validateUnitSection);

    return newBuffer;
}

async function previewMinimapImage(imageFile, canvas, outputCanvasElem, width, height) {
    var imageData = await getImageFileData(imageFile, canvas, {
        width  : width,
        height : height
    });
    let chunkedBuf = chunkize(imageData, 4);
    let gridBuf = chunkize(chunkedBuf, width);
    let pColors = approxPlayerColors(gridBuf, false);
    let colorArray = applyPlayerColors(pColors).map(s => s.reduce((a,b) => a.concat(b).concat([255]), [])).reduce((a,b) => a.concat(b), []);
    let _canvasW = outputCanvasElem.offsetWidth;
    let _canvasH = outputCanvasElem.offsetHeight;
    outputCanvasElem.width = width;
    outputCanvasElem.height = height;
    outputCanvasElem.style.setProperty("width",  `${_canvasW}px`);
    outputCanvasElem.style.setProperty("height", `${_canvasH}px`);

    let outputCanvas = outputCanvasElem.getContext('2d');
    outputCanvas.fillStyle = 'rgb(0, 0, 0)';
    outputCanvas.fillRect(0, 0, width, height);

    let newImageData = new ImageData(new Uint8ClampedArray(colorArray), width, height);
    outputCanvas.putImageData(newImageData, 0, 0);
}

module.exports = {
    patchChkDrawMinimap : patchChkDrawMinimap,
    previewMinimapImage : previewMinimapImage
};

// let pColors = approxPlayerColors([
//     [
//         [244, 4, 4],
//         [32, 24, 184],
//         [44, 180, 148],
//         [136, 64, 156],
//         [248, 140, 20],
//         [84, 40, 32],
//         [240, 240, 240],
//         [252, 252, 56],
//         [36, 152, 36],
//         [252, 252, 164],
//         [236, 196, 176],
//         [124, 172, 252],
//         [1, 15, 60],
//         [0, 255, 255]
//     ],
//     [
//         [244, 4, 4],
//         [32, 24, 184],
//         [44, 180, 148],
//         [136, 64, 156],
//         [248, 140, 20],
//         [84, 40, 32],
//         [240, 240, 240],
//         [252, 252, 56],
//         [36, 152, 36],
//         [252, 252, 164],
//         [236, 196, 176],
//         [124, 172, 252],
//         [1, 15, 60],
//         [0, 255, 255]
//     ].reverse()
// ], true);

// let d = createColoredStartLocations(pColors, [128, 128]);

// console.log(d);

// async function a() {

//     const fs = require("fs");
//     let fileData = fs.readFileSync("chks/scenario256.chk");

//     let dimData = findChunk(fileData, "DIM ");
//     let dims = chkstructs.unpackDim(dimData.data);

//     let sizeParams = getStartLocationSizes([dims.width, dims.height]);

//     const sharp = require("sharp");

//     let imgBuf = await sharp('demo.jpg').resize(sizeParams[4], sizeParams[5]).raw().toBuffer();

//     // console.log(buf.length);
//     // console.log(buf);
//     // console.log(chunkize(Array.from(buf), 3));


//     let newBuffer = await patchChkDrawMinimap(fileData, imgBuf, {
//         useGas: true
//     });

//     fs.writeFileSync("chks/scenario.chk", newBuffer);
// }

// a();