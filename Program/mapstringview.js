// Util functions

function bytes2word(byte1, byte2) {
    return (byte2 << 8) + byte1;
}
function bytes2dword(byte1, byte2, byte3, byte4) {
    return (byte4 << 24) + (byte3 << 16) + (byte2 << 8) + byte1;
}
function dword2bytes(dw) {
    return [dw & 255, (dw >>> 8) & 255, (dw >>> 16) & 255, (dw >>> 24) & 255];
}
function word2bytes(w) {
    return [w & 255, (w >>> 8) & 255];
}
function leftPad(str, len, buffer) {
    while(str.length < len) {
        str = buffer + str;
    }
    return str;
}
function scmdEscapeChar(c) {
    return scmdEscapeCharCode(c.charCodeAt(0));
}
function scmdEscapeCharCode(c) {
    return "<" + leftPad(c.toString(16).toUpperCase(), 2, "0") + ">";
}

// Tbl management functions

function parseTbl(tblBuffer, charset = "utf8") {
    let decoder = new TextDecoder(charset, {
        "fatal" : true
    });
    let statTxtBytes = Array.from(new Uint8Array(tblBuffer));
    let totalStrings = bytes2word(...statTxtBytes.slice(0, 2));
    let out = [];
    for(let i=1; i<=totalStrings && i<=10000; i++) { // add a upper limit to prevent deadloop at false chunk
        let offset = bytes2word(...statTxtBytes.slice(i * 2, i *2 + 2));
        let j = offset;
        let stringArray = [];
        let c = 255;
        while(c != 0) {
            c = statTxtBytes[j++];
            stringArray.push(c);
        }
        stringArray.pop();
        try {
            rawStr = decoder.decode(new Uint8Array(stringArray));
        }
        catch(e) {
            rawStr = "<RAW>" + stringArray.map(c => (c < 128 && c >= 32) ? String.fromCharCode(c) : scmdEscapeCharCode(c)).join("");
        }
        out.push({
            id: i,
            offset: offset,
            str: rawStr.replace(/\x0d/g, "").replace(/[\x00-\x1f]/g, rep => rep=="\x0a" ? "\n" : scmdEscapeChar(rep)),
            strPlain: rawStr.replace(/[\x00-\x1f]/g, rep => rep=="\x0a" ? "\n" : ""),
            strColor: coloredTextLinebreaks(rawStr.split("\n").map(str => colorText(str)))
        });
    }
    return out;
}
function parseTblX(tblBuffer, charset = "utf8") {
    let decoder = new TextDecoder(charset, {
        "fatal" : true
    });
    let statTxtBytes = Array.from(new Uint8Array(tblBuffer));
    let totalStrings = bytes2dword(...statTxtBytes.slice(0, 4));
    let out = [];
    for(let i=1; i<= totalStrings && i<=10000; i++) { // add a upper limit to prevent deadloop at false chunk
        let offset = bytes2dword(...statTxtBytes.slice(i * 4, i * 4 + 4));
        let j = offset;
        let stringArray = [];
        let c = 255;
        while(c != 0 && stringArray.length < 9999) {
            c = statTxtBytes[j++];
            stringArray.push(c);
        }
        stringArray.pop();
        let rawStr;
        try {
            rawStr = decoder.decode(new Uint8Array(stringArray));
        }
        catch(e) {
            rawStr = "<RAW>" + stringArray.map(c => (c < 128 && c >= 32) ? String.fromCharCode(c) : scmdEscapeCharCode(c)).join("");
        }
        out.push({
            id: i,
            offset: offset,
            str: rawStr.replace(/\x0d/g, "").replace(/[\x00-\x1f]/g, rep => rep=="\x0a" ? "\n" : "<" + leftPad(rep.charCodeAt(0).toString(16).toUpperCase(), 2, "0") + ">"),
            strPlain: rawStr.replace(/[\x00-\x1f]/g, rep => rep=="\x0a" ? "\n" : ""),
            strColor: coloredTextLinebreaks(rawStr.split("\n").map(str => colorText(str)))
        });
    }
    return out;
}
function buildCodedString(s) {
    return s.replace(/<[0-9a-fA-F]+>/g, c => {
        try {
            return String.fromCodePoint(parseInt(c.substring(1, c.length-1), 16));
        }
        catch(e) {
            return c;
        }
    });
}

function encodeCodedString(str, charset) {
    if(str.substring(0, 5) == "<RAW>") {
        return buildCodedString(str.substring(5)).split("").map(s => s.charCodeAt(0));
    }
    else {
        return Array.from(iconv.encode(buildCodedString(str), charset));
    }
}

function buildTbl(strings, charset = "utf8", buildStrX = false) {
    let stringCount = strings.length;
    let tblStringCount = stringCount <= 1024 ? 1024 : stringCount;
    let stringOffsets = Array(tblStringCount).fill(0);
    let bytes = [];
    let byteHeader = [];
    let buffer = [];
    let len = 0;
    let byteLen = buildStrX ? 4 : 2;
    let offsetLen = buildStrX ? 4 : 1;
    if(buildStrX) {
        byteHeader.push(...dword2bytes(tblStringCount));
    }
    else {
        byteHeader.push(...word2bytes(tblStringCount));
    }
    for(let i=0; i<stringCount; i++) {
        let s = strings[i];

        if(typeof iconv != "undefined") { // load iconv-lite-browserify to turn iconv on
            buffer = encodeCodedString(s.str, charset);
            buffer.push(0);
            if(buildStrX) {
                while(buffer.length % 4 != 0) {
                    buffer.push(0);
                }
            }
            len = buffer.length;
            if(len == 0) {
                stringOffsets[i] = byteLen + byteLen * tblStringCount;
            }
            else {
                stringOffsets[i] = bytes.length + byteLen + offsetLen + byteLen * tblStringCount;
                bytes = bytes.concat(buffer);
                bytes.push(0);
            }
        }
        else {
            console.log("ERROR: iconv failed to load");
        }
    }
    for(let i=0; i<stringOffsets.length; i++) {
        if(buildStrX) {
            byteHeader.push(...dword2bytes(stringOffsets[i]));
        }
        else {
            byteHeader.push(...word2bytes(stringOffsets[i]));
        }
    }
    byteHeader.push(0);
    if(buildStrX) {
        byteHeader.push(0);
        byteHeader.push(0);
        byteHeader.push(0);
    }
    return new Uint8Array(byteHeader.concat(bytes));
}

// Chunk functions

function findChunk(array, head, chunkChecker) {
    let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
    let found = -1;
    for(let i=0; i<array.length; i++) {
        if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
            let cl = array[i+4] + (array[i+5] << 8) + (array[i+6] << 16) + (array[i+7] << 24);
            if(chunkChecker(cl, array.slice(i + 8, i + cl + 8))) {
                found = i;
                break;
            }
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
function chkValueReplace(array, value, valueRep, offset, nextValueCheck) {
    let replacedArray = dword2bytes(valueRep);
    for(let i=offset; i<array.length; i+=4) {
        if(bytes2dword(...array.slice(i, i+4)) == value) {
            array[i] = replacedArray[0];
            array[i+1] = replacedArray[1];
            array[i+2] = replacedArray[2];
            array[i+3] = replacedArray[3];
        }
    }
    return array;
}
function isGoodStrChunk(chunkLength, chunkData) {
    // check if it is a good chunk.
    // since we don't load all chunks, it's possible we get a chunk header in other chunks,
    // resulting a false positive.
    let stringCount = bytes2word(...chunkData.slice(0, 2));
    if(chunkLength > 256
    && chunkLength < 1000000
    && stringCount >= 200
    && stringCount <= 10000
    && bytes2word(...chunkData.slice(2, 4)) >= stringCount*2
    && bytes2word(...chunkData.slice(2, 4)) <= chunkLength) {
        return true;
    }
    return false;
}
function isGoodStrXChunk(chunkLength, chunkData) {
    let stringCount = bytes2dword(...chunkData.slice(0, 4));
    if(chunkLength > 256
    && chunkLength < 100000000 // I still think EUD maps are possible to reach 100MB string data..
    && stringCount >= 200
    && stringCount <= 40000
    && bytes2word(...chunkData.slice(4, 8)) >= stringCount*4
    && bytes2word(...chunkData.slice(4, 8)) <= chunkLength) {
        return true;
    }
    return false;
}
function replaceChunk(array, head, newHead, chunkChecker, newDataBuffer) {
    let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
    let newData = Array.from(newDataBuffer);
    let found = -1;
    for(let i=0; i<array.length; i++) {
        if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
            let cl = array[i+4] + (array[i+5] << 8) + (array[i+6] << 16) + (array[i+7] << 24);
            if(chunkChecker(cl, array.slice(i + 8, i + cl + 8))) {
                found = i;
                break;
            }
        }
    }
    if(found == -1) {
        return null;
    }
    b = [newHead.charCodeAt(0), newHead.charCodeAt(1), newHead.charCodeAt(2), newHead.charCodeAt(3)];
    let chunkLength = array[found+4] + (array[found+5] << 8) + (array[found+6] << 16) + (array[found+7] << 24);
    let output = array.slice(0, found).concat(b).concat(dword2bytes(newData.length)).concat(newData).concat(array.slice(found + chunkLength + 8));
    return new Uint8Array(output);
}