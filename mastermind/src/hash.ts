//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as compile from 'circom'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS2304
import * as crypto from 'crypto'
//@ts-ignore TS2304
import * as assert from 'assert'

interface ICircomHashInput {
    a: bigInt.BigInteger,
    b: bigInt.BigInteger,
}

class CircomHashInput implements ICircomHashInput {
    public a: bigInt.BigInteger
    public b: bigInt.BigInteger

    constructor(_a: bigInt.BigInteger, _b: bigInt.BigInteger) {
        this.a = _a
        this.b = _b
    }
}

const bufToNum = (buf: any): bigInt.BigInteger => {
    return bigInt.fromArray(Array.from(buf), 256, false)
}

const numToCircomHashInput = (num: bigInt.BigInteger): CircomHashInput => {
    const max = bigInt(2).pow(256)
    if (num.lesser(0) || num.greater(max)){
      throw 'Invalid number; should be between 0 and 2^256'
    }

    //@ts-ignore TS2304
    const buf = numToBuf(num)
    const a = buf.slice(0, 27)
    const b = buf.slice(27, 54)

    return new CircomHashInput(
        bufToNum(a),
        bufToNum(b)
    )
}

//@ts-ignore TS2304
const numToBuf = (num: bigInt.BigInteger): Buffer => {
    //@ts-ignore TS2304
    const buf = Buffer.alloc(54)

    //@ts-ignore TS2345
    const n = Array.from(num.toArray(256).value)

    while (n.length < 32) {
      n.unshift(0)
    }

    for (let i = 0; i < n.length; i++) {
      buf[53-i] = n[31-i]
    }

    return buf
}

const hash = (num: bigInt.BigInteger): bigInt.BigInteger => {
    //@ts-ignore TS2304
    const buf = numToBuf(num)
    const hash = crypto.createHash("sha256").update(buf).digest("hex")
    const r = hash.slice(10);

    return bigInt(r, 16)
}

export {hash, numToCircomHashInput}
