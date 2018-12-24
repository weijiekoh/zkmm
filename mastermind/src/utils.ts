//@ts-ignore TS7016
import {bigInt} from 'snarkjs'
//@ts-ignore TS7016
import * as crypto from 'crypto'
//@ts-ignore TS7016

const unstringifyBigInts = (o: any): any => {
    if ((typeof(o) === "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

const stringifyBigInts = (o: any): any => {
    //@ts-ignore TS2365
    if ((typeof(o) == "bigint") || (o instanceof bigInt))  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = stringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

const genSolnInput = (soln: number[]): bigInt.BigInteger => {
    let m = bigInt(0)

    for (let i=soln.length-1; i >= 0; i--) {
        m = m.add(bigInt(soln[i] * (4 ** i)))
    }

    return m
}

const genSalt = (): bigInt.BigInteger => {
    // the maximum integer supported by Solidity is (2 ^ 256), which is 32
    // bytes long
    const buf = crypto.randomBytes(30)
    const salt = bigInt.leBuff2int(buf).sub(bigInt(340))

    // 4 * (4^3) + 4 * (4^2) + 4 * (4^1) + 4 * (4^0) = 340
    // Only return values greater than the largest possible solution
    if (salt.lt(340)) {
        return genSalt()
    }

    return salt
}

export {unstringifyBigInts, stringifyBigInts, genSolnInput, genSalt}
