const bufferpack = require("bufferpack");

function unpackToObject(pattern, objKeys, buffer) {
    let unpacked = bufferpack.unpack(pattern, buffer);
    let out = {};
    let p = 0;
    objKeys.forEach(key => {
        if(!/\[.*\]/.test(key)) {
            out[key] = unpacked[p];
            p++;
        }
        else {
            let n = parseInt(key.match(/\[(.*)\]/)[1]);
            out[key.replace(/\[.*\]/g, "")] = unpacked.slice(p, p+n);
            p += n;
        }
    });
    return out;
}
function packFromObject(pattern, objKeys, obj) {
    let a = [];
    objKeys.forEach(key => {
        if(!/\[.*\]/.test(key)) {
            a.push(obj[key]);
        }
        else {
            let n = parseInt(key.match(/\[(.*)\]/)[1]);
            a = a.concat(out[key.replace(/\[.*\]/g, "")]);
        }
    });
    return bufferpack.pack(pattern, a);
}

function packToUint32(pattern, values) {
    let packed = bufferpack.pack(pattern, values);
    return bufferpack.unpack("<I", packed)[0];
}

function unpackFlags(binFlags, flagIdentifiers, truncated = false) {
    let out = {};
    flagIdentifiers.forEach((key, i) => {
        if(truncated) {
            if(binFlags & (1 << i)) {
                out[key] = true;
            }
        }
        else {
            out[key] = !!(binFlags & (1 << i));
        }
    });
    return out;
}

function packFlags(objFlags, flagIdentifiers) {
    let out = 0;
    flagIdentifiers.forEach((key, i) => {
        if(objFlags[key]) {
            out |= (1 << i);
        }
    });
    return out;
}

module.exports = {
    unpack : unpackToObject,
    pack : packFromObject,
    packToUint32 : packToUint32,
    unpackFlags : unpackFlags,
    packFlags : packFlags
};