'use strict';

const TriggerPatterns = {
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
const TriggerStyles = [
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
        "setto" : "Set To",
        "add" : "Add",
        "sub" : "Subtract"
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
        "setto" : "Exactly",
        "add" : "At least",
        "sub" : "At most"
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
        "setto" : "SetTo",
        "add" : "Add",
        "sub" : "Subtract"
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
        "setto" : "Exactly",
        "add" : "AtLeast",
        "sub" : "AtMost"
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
        "setto" : "SetTo",
        "add" : "Add",
        "sub" : "Subtract"
    }
];

function getTriggerPattern(type, style) {
    style = style || ((typeof Settings != 'undefined') && Settings.triggerStyle) || 0;
    switch(type) {
        case TriggerPatterns.NAME: // NAME
        return TriggerStyles[style].name;
        case TriggerPatterns.ADD: // ADD
        return TriggerStyles[style].add;
        case TriggerPatterns.MASKED: // MASKED SETMEMORY
        return TriggerStyles[style].masked;
        case TriggerPatterns.MASKED_OP: // MASKED SETMEMORY + OP
        return TriggerStyles[style].masked2;
        case TriggerPatterns.NORMAL: // SETMEMORY
        return TriggerStyles[style].set;
        case TriggerPatterns.NORMAL_OP: // SETMEMORY + OP
        return TriggerStyles[style].set2;
        case TriggerPatterns.CPT: // CPT
        return TriggerStyles[style].cpt;
        case TriggerPatterns.CPT_OP: // CPT + OP
        return TriggerStyles[style].cpt2;
        case TriggerPatterns.OP_ADD: // OP ADD
        return TriggerStyles[style].add;
        case TriggerPatterns.OP_SUB: // OP SUB
        return TriggerStyles[style].sub;
        case TriggerPatterns.OP_SET: // OP SET
        return TriggerStyles[style].setto;
        case TriggerPatterns.ERROR: // ERROR
        default:
        return TriggerStyles[style].error;
    }
}