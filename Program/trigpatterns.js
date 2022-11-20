'use strict';

(function(exports) {

const TriggerMethodScmdAct  = ["Set To", "Add", "Subtract"];
const TriggerMethodScmdCond = ["Exactly", "At Least", "At Most"];
const TriggerMethodEpsAct  = ["SetTo", "Add", "Subtract"];
const TriggerMethodEpsCond = ["Exactly", "AtLeast", "AtMost"];

function encHex(val) {
    if(val < 0) {
        val += 0x100000000;
    }
    return "0x" + val.toString(16).padStart(8, "0");
}

function encNum(val) {
    return val & 0xFFFFFFFF;
}

function undefinedCpFunction() {
    throw new Error("This function required cp() but it was unimplemented.");
}

function undefinedCpMaskFunction() {
    throw new Error("This function required cpmask() but it was unimplemented.");
}

const ScmdTrgAct = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = ScmdTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodScmdAct[method];
        const valEnc = ScmdTrgAct.encodeVal(val);

        return `MemoryAddr(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = ScmdTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodScmdAct[method];
        const valEnc = ScmdTrgAct.encodeVal(val);
        const maskEnc = ScmdTrgAct.encodeMask(mask);

        return `Masked MemoryAddr(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodScmdAct[method];
        const valEnc = ScmdTrgAct.encodeVal(val);

        return `Set Deaths("Current Player", "Terran Marine", ${methodEnc}, ${valEnc});\n`;
    },
    cpmask : undefinedCpMaskFunction,
    err : function(text) {
        return `// ERROR: ${text}`;
    }
};

const ScmdTrgCond = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = ScmdTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodScmdCond[method];
        const valEnc = ScmdTrgCond.encodeVal(val);

        return `MemoryAddr(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = ScmdTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodScmdCond[method];
        const valEnc = ScmdTrgCond.encodeVal(val);
        const maskEnc = ScmdTrgCond.encodeMask(mask);

        return `Masked MemoryAddr(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodScmdCond[method];
        const valEnc = ScmdTrgAct.encodeVal(val);

        return `Deaths("Current Player", "Terran Marine", ${methodEnc}, ${valEnc});\n`;
    },
    cpmask : undefinedCpMaskFunction,
    err : function(text) {
        return `// ERROR: ${text}`;
    }
};

const TepTrgAct = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = TepTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = TepTrgAct.encodeVal(val);

        return `SetMemory(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = TepTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = TepTrgAct.encodeVal(val);
        const maskEnc = TepTrgAct.encodeMask(mask);

        return `SetMemoryX(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = TepTrgAct.encodeVal(val);

        return `SetDeaths("CurrentPlayer", ${methodEnc}, ${valEnc}, "Terran Marine");\n`;
    },
    cpmask : function(method, val, mask) {
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = EpsTrgAct.encodeVal(val);
        const maskEnc = EpsTrgAct.encodeMask(mask);

        return `SetDeathsX("CurrentPlayer", ${methodEnc}, ${valEnc}, "Terran Marine", ${maskEnc});\n`;
    },
    cpmask : undefinedCpMaskFunction,
    err : function(text) {
        return `-- ERROR: ${text}`;
    }
};

const TepTrgCond = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = TepTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = TepTrgCond.encodeVal(val);

        return `SetMemory(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = TepTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = TepTrgCond.encodeVal(val);
        const maskEnc = TepTrgCond.encodeMask(mask);

        return `SetMemoryX(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = TepTrgCond.encodeVal(val);

        return `Deaths("CurrentPlayer", ${methodEnc}, ${valEnc}, "Terran Marine");\n`;
    },
    cpmask : function(method, val, mask) {
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = TepTrgCond.encodeVal(val);
        const maskEnc = TepTrgCond.encodeMask(mask);

        return `DeathsX(CurrentPlayer, ${methodEnc}, ${valEnc}, "Terran Marine", ${maskEnc});\n`;
    },
    err : function(text) {
        return `-- ERROR: ${text}`;
    }
};

const EpsTrgAct = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = EpsTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = EpsTrgAct.encodeVal(val);

        return `SetMemory(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = EpsTrgAct.encodeMem(mem);
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = EpsTrgAct.encodeVal(val);
        const maskEnc = EpsTrgAct.encodeMask(mask);

        return `SetMemoryX(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = EpsTrgAct.encodeVal(val);

        return `SetDeaths(CurrentPlayer, ${methodEnc}, ${valEnc}, 0);\n`;
    },
    cpmask : function(method, val, mask) {
        const methodEnc = TriggerMethodEpsAct[method];
        const valEnc = EpsTrgAct.encodeVal(val);
        const maskEnc = EpsTrgAct.encodeMask(mask);

        return `SetDeathsX(CurrentPlayer, ${methodEnc}, ${valEnc}, 0, ${maskEnc});\n`;
    },
    err : function(text) {
        return `// ERROR: ${text}`;
    }
};

const EpsTrgCond = {
    encodeMem : encHex,
    encodeVal : encNum,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = EpsTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = EpsTrgCond.encodeVal(val);

        return `Memory(${memEnc}, ${methodEnc}, ${valEnc});\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = EpsTrgCond.encodeMem(mem);
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = EpsTrgCond.encodeVal(val);
        const maskEnc = EpsTrgCond.encodeMask(mask);

        return `MemoryX(${memEnc}, ${methodEnc}, ${valEnc}, ${maskEnc});\n`;
    },
    cp : function(method, val) {
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = EpsTrgCond.encodeVal(val);

        return `Deaths(CurrentPlayer, ${methodEnc}, ${valEnc}, 0);\n`;
    },
    cpmask : function(method, val, mask) {
        const methodEnc = TriggerMethodEpsCond[method];
        const valEnc = EpsTrgCond.encodeVal(val);
        const maskEnc = EpsTrgCond.encodeMask(mask);

        return `DeathsX(CurrentPlayer, ${methodEnc}, ${valEnc}, 0, ${maskEnc});\n`;
    },
    err : function(text) {
        return `// ERROR: ${text}`;
    }
};

const EpsTrgRead = {
    encodeMem : encHex,
    encodeMask : encHex,
    full : function(mem, method, val) {
        const memEnc = EpsTrgRead.encodeMem(mem);
        return `dwread_epd(EPD(${memEnc}));\n`;
    },
    mask : function(mem, method, val, mask) {
        const memEnc = EpsTrgRead.encodeMem(mem);
        switch(mask) {
            case 0x000000FF:
                return `bread_epd(EPD(${memEnc}), 0);\n`;
            case 0x0000FF00:
                return `bread_epd(EPD(${memEnc}), 1);\n`;
            case 0x00FF0000:
                return `bread_epd(EPD(${memEnc}), 2);\n`;
            case 0xFF000000:
                return `bread_epd(EPD(${memEnc}), 3);\n`;
            case 0x0000FFFF:
                return `wread_epd(EPD(${memEnc}), 0);\n`;
            case 0x00FFFF00:
                return `wread_epd(EPD(${memEnc}), 1);\n`;
            case 0xFFFF0000:
                return `wread_epd(EPD(${memEnc}), 2);\n`;
            default:
                const maskEnc = EpsTrgRead.encodeMask(mask);
                return `maskread_epd(EPD(${memEnc}), ${maskEnc});\n`;
        }
    },
    cp : function(method, val) {
        return `dwread_cp(0);\n`;
    },
    cpmask : function(method, val, mask) {
        switch(mask) {
            case 0x000000FF:
                return `bread_cp(0, 0);\n`;
            case 0x0000FF00:
                return `bread_cp(0, 1);\n`;
            case 0x00FF0000:
                return `bread_cp(0, 2);\n`;
            case 0xFF000000:
                return `bread_cp(0, 3);\n`;
            case 0x0000FFFF:
                return `wread_cp(0, 0);\n`;
            case 0x00FFFF00:
                return `wread_cp(0, 1);\n`;
            case 0xFFFF0000:
                return `wread_cp(0, 2);\n`;
            default:
                const maskEnc = EpsTrgRead.encodeMask(mask);
                return `maskread_cp(0, ${maskEnc});\n`;
        }
    },
    err : function(text) {
        return `// ERROR: ${text}`;
    }
};

class ReplacePattern {
    constructor(patString, encodeMem, encodeVal, encodeMask, method = false) {
        patString = patString.trim() + "\n";
        this.encodeMem = encodeMem;
        this.encodeVal = encodeVal;
        this.encodeMask = encodeMask;
        this.method = method;
        this.full = function(mem, method, val) {
            const memEnc = encodeMem(mem);
            const valEnc = encodeVal(val);
            const result = patString.replace(/^1/g, memEnc).replace(/^2/g, valEnc);
            if(method) {
                const methodEnc = TriggerMethodEpsCond[method];
                return result.replace(/^4/g, methodEnc);
            }
    
            return result;
        };
        this.mask = function(mem, method, val, mask) {
            const memEnc = encodeMem(mem);
            const valEnc = encodeVal(val);
            const maskEnc = encodeMask(mask);
            const result = patString.replace(/^1/g, memEnc).replace(/^2/g, valEnc).replace(/^3/g, maskEnc);
            if(method) {
                const methodEnc = TriggerMethodEpsCond[method];
                return result.replace(/^4/g, methodEnc);
            }
    
            return result;
        };
        this.cp = this.full;
        this.cpmask = this.mask;
        this.err = function(text) {
            return `Comment("ERROR: ${text}");`;
        };
    }
}

// compat

const compatTriggerPatterns = {
    NAME : 0,
    ADD : 1,
    MASKED : 2,
    MASKED_OP : 3,
    NORMAL : 4,
    NORMAL_OP : 5,
    CPT : 8,
    CPT_OP : 9,
    OP_ADD : 20,
    OP_SUB : 21,
    OP_SET : 22,
    ERROR : -1
};
const compatTriggerStyles = [
    {
        "name" : "scmd",
        "add" : "MemoryAddr(^1, Add, ^2);",
        "masked" : "Masked MemoryAddr(^1, Set To, ^2, ^3);",
        "masked2" : "Masked MemoryAddr(^1, ^4, ^2, ^3);",
        "set" : "MemoryAddr(^1, Set To, ^2);",
        "set2" : "MemoryAddr(^1, ^4, ^2);",
        "cpt" : "Set Deaths(\"Current Player\", \"Terran Marine\", Set To, ^2);",
        "cpt2" : "Set Deaths(\"Current Player\", \"Terran Marine\", ^4, ^2);",
        "error" : "Comment(\"Error: ^1\");",
        "opsetto" : "Set To",
        "opadd" : "Add",
        "opsub" : "Subtract"
    },
    {
        "name" : "scmdcond",
        "add" : "MemoryAddr(^1, At least, ^2);",
        "masked" : "Masked MemoryAddr(^1, Exactly, ^2, ^3);",
        "masked2" : "Masked MemoryAddr(^1, ^4, ^2, ^3);",
        "set" : "MemoryAddr(^1, Exactly, ^2);",
        "set2" : "MemoryAddr(^1, ^4, ^2);",
        "cpt" : "Deaths(\"Current Player\", \"Terran Marine\", Set To, ^2);",
        "cpt2" : "Deaths(\"Current Player\", \"Terran Marine\", ^4, ^2);",
        "error" : "Never(); // Error: ^1",
        "opsetto" : "Exactly",
        "opadd" : "At least",
        "opsub" : "At most"
    },
    {
        "name" : "tep",
        "add" : "SetMemory(^1, Add, ^2);",
        "masked" : "SetMemoryX(^1, SetTo, ^2, ^3);",
        "masked2" : "SetMemoryX(^1, ^4, ^2, ^3);",
        "set" : "SetMemory(^1, SetTo, ^2);",
        "set2" : "SetMemory(^1, ^4, ^2);",
        "cpt" : "SetDeaths(CurrentPlayer, SetTo, ^2, \"Terran Marine\");",
        "cpt2" : "SetDeaths(CurrentPlayer, ^4, ^2, \"Terran Marine\");",
        "error" : "-- Error: ^1",
        "opsetto" : "SetTo",
        "opadd" : "Add",
        "opsub" : "Subtract"
    },
    {
        "name" : "tepcond",
        "add" : "Memory(^1, AtLeast, ^2);",
        "masked" : "MemoryX(^1, Exactly, ^2, ^3);",
        "masked2" : "MemoryX(^1, ^4, ^2, ^3);",
        "set" : "Memory(^1, Exactly, ^2);",
        "set2" : "Memory(^1, ^4, ^2);",
        "cpt" : "Deaths(CurrentPlayer, Exactly, ^2, \"Terran Marine\");",
        "cpt2" : "Deaths(CurrentPlayer, ^4, ^2, \"Terran Marine\");",
        "error" : "-- Error: ^1",
        "opsetto" : "Exactly",
        "opadd" : "AtLeast",
        "opsub" : "AtMost"
    },
    {
        "name" : "eud3",
        "add" : "SetMemory(^1, Add, ^2);",
        "masked" : "SetMemoryX(^1, SetTo, ^2, ^3);",
        "masked2" : "SetMemoryX(^1, ^4, ^2, ^3);",
        "set" : "SetMemory(^1, SetTo, ^2);",
        "set2" : "SetMemory(^1, ^4, ^2);",
        "cpt" : "SetDeaths(CurrentPlayer, SetTo, ^2, 0);",
        "cpt2" : "SetDeaths(CurrentPlayer, ^4, ^2, 0);",
        "error" : "// Error: ^1",
        "opsetto" : "SetTo",
        "opadd" : "Add",
        "opsub" : "Subtract"
    }
];

function compatGetTriggerPattern(type, style) {
    style = style || ((typeof Settings != 'undefined') && Settings.triggerStyle) || 0;
    switch(type) {
        case compatTriggerPatterns.NAME: // NAME
        return compatTriggerStyles[style].name;
        case compatTriggerPatterns.ADD: // ADD
        return compatTriggerStyles[style].add;
        case compatTriggerPatterns.MASKED: // MASKED SETMEMORY
        return compatTriggerStyles[style].masked;
        case compatTriggerPatterns.MASKED_OP: // MASKED SETMEMORY + OP
        return compatTriggerStyles[style].masked2;
        case compatTriggerPatterns.NORMAL: // SETMEMORY
        return compatTriggerStyles[style].set;
        case compatTriggerPatterns.NORMAL_OP: // SETMEMORY + OP
        return compatTriggerStyles[style].set2;
        case compatTriggerPatterns.CPT: // CPT
        return compatTriggerStyles[style].cpt;
        case compatTriggerPatterns.CPT_OP: // CPT + OP
        return compatTriggerStyles[style].cpt2;
        case compatTriggerPatterns.OP_ADD: // OP ADD
        return compatTriggerStyles[style].opadd;
        case compatTriggerPatterns.OP_SUB: // OP SUB
        return compatTriggerStyles[style].opsub;
        case compatTriggerPatterns.OP_SET: // OP SET
        return compatTriggerStyles[style].opsetto;
        case compatTriggerPatterns.ERROR: // ERROR
        default:
        return compatTriggerStyles[style].error;
    }
}

exports.TriggerPatterns = {
    encHex : encHex,
    encNum : encNum,
    ScmdTrgAct : ScmdTrgAct,
    ScmdTrgCond : ScmdTrgCond,
    TepTrgAct : TepTrgAct,
    TepTrgCond : TepTrgCond,
    EpsTrgAct : EpsTrgAct,
    EpsTrgCond : EpsTrgCond,
    EpsTrgRead : EpsTrgRead,
    ReplacePattern : ReplacePattern
};
exports.getTriggerPattern = compatGetTriggerPattern;

}) ((typeof window != "undefined") ? window : module.exports);