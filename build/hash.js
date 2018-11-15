"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const bigInt = require("big-integer");
//@ts-ignore TS2304
const crypto = require("crypto");
class CircomHashInput {
    constructor(_a, _b) {
        this.a = _a;
        this.b = _b;
    }
}
const numToBuf = (num) => {
    const numAsArray = num.toArray(256);
    //@ts-ignore TS2304
    let buf = new Buffer.alloc(numAsArray.value.length);
    for (let i = 0; i < numAsArray.value.length; i++) {
        buf[i] = numAsArray.value[i];
    }
    return buf;
};
const bufToNum = (buf) => {
    return bigInt.fromArray(Array.from(buf), 256, false);
};
const numToCircomHashInput = (num) => {
    // TODO: add bounds check
    //@ts-ignore TS2304
    const buf = new Buffer.alloc(54);
    const numAsArray = bigInt(num).toArray(256);
    const ar = Array.from(numAsArray.value);
    ar.reverse();
    for (let i = 0; i < numAsArray.value.length; i++) {
        buf[53 - i] = ar[i];
    }
    const a = buf.slice(0, 27);
    const b = buf.slice(27, 54);
    return new CircomHashInput(bufToNum(a), bufToNum(b));
};
exports.numToCircomHashInput = numToCircomHashInput;
const hash = (num) => {
    //@ts-ignore TS2304
    const buf = Buffer.alloc(54);
    //@ts-ignore TS2345
    const n = Array.from(numToBuf(num));
    n.reverse();
    for (let i = 0; i < n.length; i++) {
        buf[53 - i] = n[i];
    }
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    const r = hash.slice(10);
    return bigInt(r, 16);
};
exports.hash = hash;
//# sourceMappingURL=hash.js.map