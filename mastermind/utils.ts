//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'

const unstringifyBigInts = (o: any): any => {
    if ((typeof(o) === "string") && (/^[0-9]+$/.test(o) ))  {
        return snarkjs.bigInt(o);
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
    if ((typeof(o) == "bigint") || (o instanceof snarkjs.bigInt))  {
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

export {unstringifyBigInts, stringifyBigInts}
