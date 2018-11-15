"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const snarkjs = require("snarkjs");
//@ts-ignore TS7016
const crypto = require("crypto");
//@ts-ignore TS7016
const bigInt = require("big-integer");
const unstringifyBigInts = (o) => {
    if ((typeof (o) === "string") && (/^[0-9]+$/.test(o))) {
        return snarkjs.bigInt(o);
    }
    else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    }
    else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k]);
        }
        return res;
    }
    else {
        return o;
    }
};
exports.unstringifyBigInts = unstringifyBigInts;
const stringifyBigInts = (o) => {
    //@ts-ignore TS2365
    if ((typeof (o) == "bigint") || (o instanceof snarkjs.bigInt)) {
        return o.toString(10);
    }
    else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    }
    else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = stringifyBigInts(o[k]);
        }
        return res;
    }
    else {
        return o;
    }
};
exports.stringifyBigInts = stringifyBigInts;
const genSolnInput = (soln) => {
    let m = bigInt(0);
    for (let i = soln.length - 1; i >= 0; i--) {
        m = m.add(soln[i] * (4 ** i));
    }
    return m;
};
exports.genSolnInput = genSolnInput;
const genSalt = () => {
    // the maximum integer supported by Solidity is (2 ^ 256), which is 32
    // bytes long
    const buf = crypto.randomBytes(32);
    const salt = bigInt.fromArray(Array.from(buf), 256, false).minus(340);
    // 4 * (4^3) + 4 * (4^2) + 4 * (4^1) + 4 * (4^0) = 340
    // Only return values greater than the largest possible solution
    if (salt.lt(340)) {
        return genSalt();
    }
    return salt;
};
exports.genSalt = genSalt;
//# sourceMappingURL=utils.js.map