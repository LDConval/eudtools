function dword2bytes(dw) {
    return [dw & 255, (dw >>> 8) & 255, (dw >>> 16) & 255, (dw >>> 24) & 255];
}

/**
 * Find a chunk from a .chk file buffer.
 * @param {buffer} array - File buffer presented in Uint8Array or Array containing uint8s.
 * @param {string} head - The 4-character header of the chunk.
 * @param {function} validationFunc(len, buf) - Function to validate found chunk.
 */
function findChunk(array, head, validationFunc = () => true) {
    let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
    let found = -1;
    for(let i=0; i<array.length; i++) {
        if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
            let cl = array[i+4] + (array[i+5] << 8) + (array[i+6] << 16) + (array[i+7] << 24);
            if(validationFunc(cl, array.slice(i + 8, i + cl + 8))) {
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

function replaceChunk(arrayInput, head, newDataBuffer, validationFunc = () => true) {
    let array = arrayInput.concat ? arrayInput : Array.from(arrayInput);
    let b = [head.charCodeAt(0), head.charCodeAt(1), head.charCodeAt(2), head.charCodeAt(3)];
    let newData = Array.from(newDataBuffer);
    let found = -1;
    for(let i=0; i<array.length; i++) {
        if(array[i] == b[0] && array[i+1] == b[1] && array[i+2] == b[2] && array[i+3] == b[3]) {
            let cl = array[i+4] + (array[i+5] << 8) + (array[i+6] << 16) + (array[i+7] << 24);
            if(validationFunc(cl, array.slice(i + 8, i + cl + 8))) {
                found = i;
                break;
            }
        }
    }
    if(found == -1) {
        return null;
    }
    let chunkLength = array[found+4] + (array[found+5] << 8) + (array[found+6] << 16) + (array[found+7] << 24);
    let output = array.slice(0, found).concat(b).concat(dword2bytes(newData.length)).concat(newData).concat(array.slice(found + chunkLength + 8));
    return new Uint8Array(output);
}

module.exports.findChunk = findChunk;
module.exports.replaceChunk = replaceChunk;