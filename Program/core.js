/*
 * Core Functions for EUDTools Layout V2
 *
 * Models all EUD actions as memory/mask pairs, and generates triggers
 * only at final step, so eventually it yields the least amount of actions.
 * 
 * Tbh, it is probably better to just use EUD editor epscripts for everything.
 * It has a better paradigm for programming, more like actual coding instead
 * of oldstyle triggers. More capable of doing complex logic too.
 * 
 * I was bored, anyways, and for the fact it is unlikely for me to start
 * playing Monster Hunter Sunbreak at work even if there is no work to do.
 *
 * @ Ar3sgice 2022
 */

"use strict";

const U32_MAX = 0xFFFFFFFF;
const EUDMasks = [
    [0x00000000, 0x00000000, 0x00000000, 0x00000000], // failproof
    [0x000000FF, 0x0000FF00, 0x00FF0000, 0xFF000000],
    [0x0000FFFF, 0x00FFFF00, 0xFFFF0000],
    [0x00FFFFFF, 0xFFFFFF00],
    [0xFFFFFFFF],
];
const TriggerMethod = {
    "Add" : 1,
    "Subtract" : 2,
    "SetTo" : 0
};
const DeathTableStart = 0x58A364;

function getEUDMask(len, subp) {
    return EUDMasks[len][subp];
}

function u32Cast(x) {
    return Number(x) & 0xFFFFFFFF;
}

class EUDEngineClass {
    constructor() {
        this.mems = {};
        this.defaultPattern = null;
        this.modifier = TriggerMethod.SetTo;
    }

    setAlignedWithMask(mem, val, mask) {
        mem = Number(mem);
        val = u32Cast(val);
        mask = Number(mask);
        if(mask == 0) {
            return;
        }
        // assumes mem is aligned
        if(mem in this.mems) {
            this.mems[mem].val = (this.mems[mem].val & ~mask) | (val & mask);
            this.mems[mem].mask |= mask;
        }
        else {
            this.mems[mem] = {
                "mem" : mem,
                "val" : val & mask,
                "mask" : mask
            };
        }
    }

    set(mem, val, len) {
        if(len <= 0) {
            return;
        }
        if(len > 4) {
            throw new Error("Cannot set mem with len > 4");
        }
        // 0 < len <= 4
        switch(mem % 4) {
            case 0:
                this.setAlignedWithMask(mem, val, getEUDMask(len, 0));
            break;
            case 1:
                this.setAlignedWithMask(mem - 1, val << 8, getEUDMask(Math.min(len, 3), 1));
                if(len >= 4) {
                    this.setAlignedWithMask(mem + 3, val >>> 24, getEUDMask(len - 3, 0));
                }
            break;
            case 2:
                this.setAlignedWithMask(mem - 2, val << 16, getEUDMask(Math.min(len, 2), 2));
                if(len >= 3) {
                    this.setAlignedWithMask(mem + 2, val >>> 16, getEUDMask(len - 2, 0));
                }
            break;
            case 3:
                this.setAlignedWithMask(mem - 3, val << 24, getEUDMask(Math.min(len, 1), 3));
                if(len >= 2) {
                    this.setAlignedWithMask(mem + 1, val >>> 8, getEUDMask(len - 1, 0));
                }
            break;

        }
    }

    setWithMask(mem, val, len, mask) {
        if(len <= 0) {
            return;
        }
        if(len > 4) {
            throw new Error("Cannot set mem with len > 4");
        }
        // 0 < len <= 4
        switch(mem % 4) {
            case 0:
                this.setAlignedWithMask(mem, val, getEUDMask(len, 0) & mask);
            break;
            case 1:
                this.setAlignedWithMask(mem - 1, val << 8, getEUDMask(Math.min(len, 3), 1) & (mask << 8));
                if(len >= 4) {
                    this.setAlignedWithMask(mem + 3, val >>> 24, getEUDMask(len - 3, 0) & (mask >>> 24));
                }
            break;
            case 2:
                this.setAlignedWithMask(mem - 2, val << 16, getEUDMask(Math.min(len, 2), 2) & (mask << 16));
                if(len >= 3) {
                    this.setAlignedWithMask(mem + 2, val >>> 16, getEUDMask(len - 2, 0) & (mask >>> 16));
                }
            break;
            case 3:
                this.setAlignedWithMask(mem - 3, val << 24, getEUDMask(Math.min(len, 1), 3) & (mask << 24));
                if(len >= 2) {
                    this.setAlignedWithMask(mem + 1, val >>> 8, getEUDMask(len - 1, 0) & (mask >>> 8));
                }
            break;

        }
    }

    setArrayConst(mems, val, len) {
        for(let i = 0; i < mems.length; i++) {
            this.set(mems[i], val, len);
        }
    }

    setArray(mems, vals, len) {
        if(mems.length != vals.length) {
            throw new Error("mem and val length do not match");
        }
        for(let i = 0; i < mems.length; i++) {
            this.set(mems[i], val[i], len);
        }
    }

    setModifier(modifier) {
        switch(modifier.toLowerCase()) {
            case "add":
            this.modifier = TriggerMethod.Add;
            return;

            case "sub":
            case "subtract":
            this.modifier = TriggerMethod.Subtract;
            return;
            
            case "set":
            case "setto":
            case "set to":
            this.modifier = TriggerMethod.SetTo;
            return;
        }
    }

    getResult(trigPattern = this.defaultPattern) {
        if(!trigPattern) {
            throw new Error("Trigger Pattern not set");
        }
        const memKeys = Object.keys(this.mems).sort((a,b) => Number(a)-Number(b));
        let out = "";
        for(let i = 0; i < memKeys.length; i++) {
            const memKey = memKeys[i];
            if(u32Cast(this.mems[memKey].mask) == -1) {
                out += trigPattern.full(
                    this.mems[memKey].mem,
                    this.modifier,
                    this.mems[memKey].val
                );
            }
            else {
                out += trigPattern.mask(
                    this.mems[memKey].mem,
                    this.modifier,
                    this.mems[memKey].val,
                    this.mems[memKey].mask
                );
            }
        }
        return out;
    }

    clear() {
        this.mems = {};
        this.modifier = TriggerMethod.SetTo;
    }

    error(x, trigPattern = this.defaultPattern) {
        return trigPattern.err(x);
    }

    setDefaultPattern(pattern) {
        this.defaultPattern = pattern;
    }

    output(trigPattern = this.defaultPattern) {
        const x = this.getResult(trigPattern);
        this.clear();
        return x;
    }
}

/* Expose it on global scope so players can do console programming. */

const EUDEngine = new EUDEngineClass();