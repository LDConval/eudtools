const {drawStars} = require("./starsky");

const {previewMinimapImage, patchChkDrawMinimap} = require("./minimapdraw");
const {findChunk, replaceChunk} = require("./chunkfind");
const {previewQR, patchChkUnitQR, patchChkTileQR, getStartLocationSizes, suggestTiles} = require("./scqr");
const objpacker = require("./objpacker");
const chkstructs = require("./chkstructs");
const {autoSetLocale, getI18n, changeLocale} = require("./i18n");

var hiddenCanvas;
var downloadLink;

var mapChkData;

var optionsVisible = false;
var downloadsVisible = false;

var selectedFunction = 0;

function $Q(e) {
    return document.querySelector(e);
}

function init() {
    hiddenCanvas = document.getElementById("hidden-canvas").getContext("2d");
    downloadLink = document.getElementById("save-link");
    let canvasElem = document.getElementById("night-sky");
    drawStars(canvasElem.getContext("2d"), canvasElem.width, canvasElem.height);

    attachBubbleHintEvent($Q("#label-unitqr-pos"), $Q("#bubble-hint-unitqr-pos"));
    attachBubbleHintEvent($Q("#label-unitqr-layerdown"), $Q("#bubble-hint-unitqr-layer-down"));
    attachBubbleHintEvent($Q("#label-tileqr-tiles"), $Q("#bubble-hint-tileqr-tiles"));
    attachBubbleHintEvent($Q("#label-tileqr-pos"), $Q("#bubble-hint-tileqr-pos"));
    attachBubbleHintEvent($Q("#label-mmdraw-image"), $Q("#bubble-hint-mmdraw-image"));
    attachBubbleHintEvent($Q("#label-mmdraw-size"), $Q("#bubble-hint-mmdraw-size"));
    attachBubbleHintEvent($Q("#label-mmdraw-pos"), $Q("#bubble-hint-mmdraw-pos"));
    attachBubbleHintEvent($Q("#label-mmdraw-layerdown"), $Q("#bubble-hint-mmdraw-layerdown"));
    attachBubbleHintEvent($Q("#label-mmdraw-usegas"), $Q("#bubble-hint-mmdraw-usegas"));

    $Q("#mmdraw-image-file").addEventListener("change", mmdrawImageFileChange);
    $Q("#map-file").addEventListener("change", mapFileChange);

    $Q("#unitqr-input-text").addEventListener("change", unitqrInputTextChange);
    $Q("#tileqr-input-text").addEventListener("change", tileqrInputTextChange);

    $Q("#tab-unitqr").addEventListener("click", unitqrTabClick);
    $Q("#tab-tileqr").addEventListener("click", tileqrTabClick);
    $Q("#tab-mmdraw").addEventListener("click", mmdrawTabClick);

    $Q("#download-map").addEventListener("click", saveMapClick);
    $Q("#download-chk").addEventListener("click", saveChkClick);

    $Q("#link-change-language").addEventListener("click", evt => {
        let locale = changeLocale();
        document.body.lang = locale;
    });

    let locale = autoSetLocale();
    document.body.lang = locale;
}

function attachBubbleHintEvent(mainElem, bubbleHintElem) {
    mainElem.addEventListener("mouseover", evt => {
        bubbleHintElem.style.setProperty("display", "block");
        bubbleHintElem.style.setProperty("top", `${mainElem.offsetTop - bubbleHintElem.offsetHeight - 12}px`);
        bubbleHintElem.style.setProperty("left", `${mainElem.offsetLeft}px`);
    });
    mainElem.addEventListener("mouseout", evt => {
        bubbleHintElem.style.setProperty("display", "none");
    });
}

function warning(text) {
    let elem = document.createElement("div");
    elem.className = "status-item";
    let elemText = document.createElement("div");
    elemText.className = "status-message";
    elemText.innerHTML = text;
    elem.appendChild(elemText);
    let removeWarningFunction = evt => {
        if(!elem || elem.isBeingRemoved) {
            return;
        }
        elem.isBeingRemoved = true;
        elem.style.setProperty("animation", "fade 500ms reverse");
        elem.style.setProperty("opacity", 0);
        setTimeout(() => {
            try {
                document.getElementById("status-container").removeChild(elem);
            }
            catch(e) {

            }
        }, 550);
    };
    elem.addEventListener("click", removeWarningFunction);
    document.getElementById("status-container").appendChild(elem);
    setTimeout(removeWarningFunction, 3000);
}

function show(elem, val = "block", time = "500ms") {
    elem.style.setProperty("display", val);
    elem.style.setProperty("animation", `fade ${time}`);
    elem.style.setProperty("opacity", 1);
}

function hide(elem) {
    elem.style.setProperty("display", "none");
    elem.style.setProperty("animation", "fadeout 500ms");
    elem.style.setProperty("opacity", 0);
}

function toHex(n) {
    return "0x" + n.toString(16).padStart("0", 2).toUpperCase();
}

function readFileToUint8Array(file) {
    let fr = new FileReader();
    return new Promise((res, rej) => {
        fr.readAsArrayBuffer(file);
        fr.onload = evt => {
            res(fr.result);
        }
        fr.onerror = rej;
    }).then(s => new Uint8Array(s));
}

async function mapFileChange(evt) {
    try {
        $Q("#map-input-status-text").innerText = $Q("#map-file").files[0].name;
    }
    catch(e) {
        warning(getI18n("No input map!"));
        return;
    }
    try {
        let fileData = await readFileToUint8Array($Q("#map-file").files[0]);

        let fileMagic = objpacker.packToUint32("<4B", fileData.slice(0, 4));
        if(fileMagic === 441536589) { // is a MPQ file
            mapChkData = await extractChk(fileData);
        }
        else {
            mapChkData = fileData;
        }

        let dimData = findChunk(mapChkData, "DIM ");
        let dims = chkstructs.unpackDim(dimData.data);

        $Q("#map-size-width").innerHTML = dims.width;
        $Q("#map-size-height").innerHTML = dims.height;

        let sizes = getStartLocationSizes([dims.width, dims.height]);

        $Q("#mmdraw-size-width").value = sizes[4];
        $Q("#mmdraw-size-height").value = sizes[5];

        let eraData = findChunk(mapChkData, "ERA ");
        let era = eraData.data[0] & 7;
        let suggestedTiles = suggestTiles(era);

        $Q("#tileqr-tile-0").value = toHex(suggestedTiles[0]);
        $Q("#tileqr-tile-1").value = toHex(suggestedTiles[1]);

        if(!optionsVisible) {
            show($Q(".map-info"));
            show($Q(".function-tabs"), "grid");
            optionsVisible = true;
        }
    }
    catch(e) {
        warning(getI18n("Failed to read map data!"));
    }
}

function unitqrTabClick(evt) {
    $Q("#tab-unitqr").classList.add("function-tab-selected");
    $Q("#tab-tileqr").classList.remove("function-tab-selected");
    $Q("#tab-mmdraw").classList.remove("function-tab-selected");
    show($Q("#function-options-unitqr"));
    hide($Q("#function-options-tileqr"));
    hide($Q("#function-options-mmdraw"));
    selectedFunction = 1;
}

function tileqrTabClick(evt) {
    $Q("#tab-unitqr").classList.remove("function-tab-selected");
    $Q("#tab-tileqr").classList.add("function-tab-selected");
    $Q("#tab-mmdraw").classList.remove("function-tab-selected");
    hide($Q("#function-options-unitqr"));
    show($Q("#function-options-tileqr"));
    hide($Q("#function-options-mmdraw"));
    selectedFunction = 2;
}

function mmdrawTabClick(evt) {
    $Q("#tab-unitqr").classList.remove("function-tab-selected");
    $Q("#tab-tileqr").classList.remove("function-tab-selected");
    $Q("#tab-mmdraw").classList.add("function-tab-selected");
    hide($Q("#function-options-unitqr"));
    hide($Q("#function-options-tileqr"));
    show($Q("#function-options-mmdraw"));
    selectedFunction = 3;
}

function getErrorCorrectionLevel() {
    if(selectedFunction == 1) {
        return $Q("#unitqr-ecl-l").checked ? "L" : $Q("#unitqr-ecl-h").checked ? "H" : "M";
    }
    else if(selectedFunction == 2) {
        return $Q("#tileqr-ecl-l").checked ? "L" : $Q("#tileqr-ecl-h").checked ? "H" : "M";
    }
    return "M";
}

async function unitqrInputTextChange(evt) {
    let text = $Q("#unitqr-input-text").value;
    await previewQR($Q("#previewer"), text, {
        "errorCorrectionLevel" : getErrorCorrectionLevel()
    });
    $Q("#previewer").style.setProperty("width", "256px");
    $Q("#previewer").style.setProperty("height", "256px");

    if(!downloadsVisible) {
        show($Q(".results"), "grid");
        downloadsVisible = true;
    }
}

async function tileqrInputTextChange(evt) {
    let text = $Q("#tileqr-input-text").value;
    await previewQR($Q("#previewer"), text, {
        "errorCorrectionLevel" : getErrorCorrectionLevel()
    });
    $Q("#previewer").style.setProperty("width", "256px");
    $Q("#previewer").style.setProperty("height", "256px");

    if(!downloadsVisible) {
        show($Q(".results"), "grid");
        downloadsVisible = true;
    }
}

function mmdrawImageFileChange(evt) {
    try {
        $Q("#mmdraw-image-status-text").innerText = $Q("#mmdraw-image-file").files[0].name;
    }
    catch(e) {
    }
    previewMinimapImage($Q("#mmdraw-image-file").files[0],
                        hiddenCanvas,
                        $Q("#previewer"),
                        $Q("#mmdraw-size-width").value || 32,
                        $Q("#mmdraw-size-height").value || 32
                        );

    if(!downloadsVisible) {
        show($Q(".results"), "grid");
        downloadsVisible = true;
    }
}

function unitqrUpdateChk(chkData) {
    let text = $Q("#unitqr-input-text").value;
    let p0 = parseInt($Q("#unitqr-player-0").value);
    let p1 = parseInt($Q("#unitqr-player-1").value);
    let x = parseInt($Q("#unitqr-pos-x").value);
    let y = parseInt($Q("#unitqr-pos-y").value);
    let ld = !!$Q("#unitqr-layerdown").checked;

    let newChkData = patchChkUnitQR(chkData, text, {
        offsetX : isNaN(x) ? null : x,
        offsetY : isNaN(y) ? null : y,
        player0 : isNaN(p0) ? 6 : p0,
        player1 : isNaN(p1) ? 5 : p1,
        layerDown : ld,
        errorCorrectionLevel : getErrorCorrectionLevel()
    });

    return newChkData;
}

function parseTile(t) {
    if(t.indexOf(".") != -1) {
        let arr = t.split(".");
        return parseInt(arr[0], 10) * 16 + parseInt(arr[1], 10);
    }
    else {
        return parseInt(t);
    }
}

function tileqrUpdateChk(chkData) {
    let text = $Q("#tileqr-input-text").value;
    let t0 = parseTile($Q("#tileqr-tile-0").value);
    let t1 = parseTile($Q("#tileqr-tile-1").value);
    let x = parseInt($Q("#tileqr-pos-x").value);
    let y = parseInt($Q("#tileqr-pos-y").value);
    let size = parseInt($Q("#tileqr-size").value);

    let newChkData = patchChkTileQR(chkData, text, {
        offsetX : isNaN(x) ? null : x,
        offsetY : isNaN(y) ? null : y,
        tile0 : isNaN(t0) ? 0x40 : t0,
        tile1 : isNaN(t1) ? 0x1a0 : t1,
        tileSize : size,
        errorCorrectionLevel : getErrorCorrectionLevel()
    });

    return newChkData;
}

function mmdrawUpdateChk(chkData) {
    let text = $Q("#tileqr-input-text").value;
    let width = parseInt($Q("#mmdraw-size-width").value);
    let height = parseInt($Q("#mmdraw-size-height").value);
    let x = parseInt($Q("#mmdraw-pos-x").value);
    let y = parseInt($Q("#mmdraw-pos-y").value);
    let layerDown = !!$Q("#mmdraw-layerdown").checked;
    let useGas = !!$Q("#mmdraw-usegas").checked;

    let newChkData = patchChkDrawMinimap(chkData, $Q("#mmdraw-image-file").files[0], {
        canvas : hiddenCanvas,
        offsetX : isNaN(x) ? null : x,
        offsetY : isNaN(y) ? null : y,
        width : isNaN(width) ? null : width,
        height : isNaN(height) ? null : height,
        useGas : useGas,
        layerDown : layerDown
    });

    return newChkData;
}


async function extractChk(mpqData) {
    let mpq = await MPQ.fromArrayBuffer(mpqData);
    let mpqPath = mpq.filePath;
    let chkData = mpq.readFile("staredit\\scenario.chk");
    mpq.close();
    try {
        FS.unlink(mpqPath);
    }
    catch(e) {
        console.log(e);
    }
    return chkData;
}

async function packMpq(origMpqData, chkData) {
    let mpq = await MPQ.fromArrayBuffer(origMpqData);
    return mpq.addFileFromArrayBuffer("staredit\\scenario.chk", chkData, {
        "compression" : ["pkware"],
        "encrypt" : true,
        "fixKey" : false,
        "replace" : true
    }).compact();
}

async function createMpq(chkData) {
    let mpq = await MPQ.create(`temp_scqr_${Math.floor(Math.random()*100000)}.mpq`, {
        "version" : 1,
        "fileFlagsListfile" : {
            "compression" : ["pkware"],
            "encrypt" : true,
            "fixKey" : false,
        },
        "fileFlagsAttributes" : {},
        "fileFlagsSignature" : {},
    });
    return mpq.addFileFromArrayBuffer("staredit\\scenario.chk", chkData, {
        "compression" : ["pkware"],
        "encrypt" : true,
        "fixKey" : false,
        "replace" : true
    }).compact();
}

function saveFile(buffer, filename, linkElem) {
    let blob = new Blob([buffer]);
    let url = URL.createObjectURL(blob);
    linkElem.href = url;
    linkElem.download = filename;
    linkElem.click();
}

async function saveMapOrChkClick(outputRawChk, evt) {
    if(!mapChkData) {
        warning(getI18n("No map data! load map from input first"));
        return;
    }

    try {
        var newChkData;
        if(selectedFunction == 1) {
            if($Q("#unitqr-input-text").value == "") {
                warning(getI18n("No input text!"));
                return;
            }
            newChkData = unitqrUpdateChk(mapChkData);
        }
        else if(selectedFunction == 2) {
            if($Q("#tileqr-input-text").value == "") {
                warning(getI18n("No input text!"));
                return;
            }
            newChkData = tileqrUpdateChk(mapChkData);
        }
        else if(selectedFunction == 3) {
            if(!$Q("#mmdraw-image-file").files[0]) {
                warning(getI18n("Please upload image file!"));
                return;
            }
            newChkData = await mmdrawUpdateChk(mapChkData);
        }
        else {
            warning(getI18n("No function selected!"));
            return;
        }
    }
    catch(e) {
        warning(getI18n("Cannot apply function!"));
        return;
    }

    if(!newChkData) {
        warning(getI18n("Unknown error! cannot convert map"));
        return;
    }

    if(outputRawChk) {
        try {
            saveFile(newChkData, "scenario.chk", downloadLink);
            return;
        }
        catch(e) {
            warning(getI18n("Cannot save file!"));
            return;
        }
    }

    try {
        let fileData = await readFileToUint8Array($Q("#map-file").files[0]);

        let fileMagic = objpacker.packToUint32("<4B", fileData.slice(0, 4));

        var newMpqData;
        if(fileMagic === 441536589) { // is a MPQ file
            let newMpq = await packMpq(fileData, newChkData);
            newMpqData = newMpq.toArrayBuffer();
            newMpq.close();
            try {
                FS.unlink(newMpq.filePath);
            }
            catch(e) {

            }
        }
        else {
            let createdMpq = await createMpq(newChkData);
            newMpqData = createdMpq.toArrayBuffer();
            createdMpq.close();
            try {
                FS.unlink(createdMpq.filePath);
            }
            catch(e) {
            }
        }
        if(!newMpqData) {
            throw new Error("localError");
        }
    }
    catch(e) {
        warning(getI18n("Error! cannot pack map as MPQ (try saving as CHK)"));
        return;
    }


    try {
        saveFile(newMpqData, $Q("#map-file").files[0].name.replace(".chk", ".scx"), downloadLink);
    }
    catch(e) {
        warning(getI18n("Cannot save file!"));
    }
}

function saveMapClick(evt) {
    saveMapOrChkClick(false, evt);
}

function saveChkClick(evt) {
    saveMapOrChkClick(true, evt);
}

window.init = init;