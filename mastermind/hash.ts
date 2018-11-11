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
//@ts-ignore TS2304
import * as sha256 from './sha256'

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

const numToBuf = (num: bigInt.BigInteger): object => {
    const numAsArray = num.toArray(256)
    //@ts-ignore TS2304
    let buf = new Buffer.alloc(numAsArray.value.length)
    for (let i=0; i<numAsArray.value.length; i++) {
        buf[i] = numAsArray.value[i]
    }
    return buf
}

const bufToNum = (buf: any): bigInt.BigInteger => {
    return bigInt.fromArray(Array.from(buf), 256, false)
}

const numToCircomHashInput = (num: bigInt.BigInteger): CircomHashInput => {
    // TODO: add bounds check

    //@ts-ignore TS2304
    const buf = new Buffer.alloc(54)
    const numAsArray = bigInt(num).toArray(256)


    const ar = Array.from(numAsArray.value)
    ar.reverse()
    for (let i=0; i<numAsArray.value.length; i++) {
        buf[53-i] = ar[i]
    }

    const a = buf.slice(0, 27)
    const b = buf.slice(27, 54)

    return new CircomHashInput(
        bufToNum(a),
        bufToNum(b)
    )
}

const hash = (num: bigInt.BigInteger): bigInt.BigInteger => {
    //@ts-ignore TS2304
    const buf = Buffer.alloc(54)

    const n = Array.from(numToBuf(num))
    n.reverse()
    for (let i=0; i<n.length; i++) {
        buf[53-i] = n[i]
    }
    const hash = crypto.createHash("sha256").update(buf).digest("hex")
    const r = hash.slice(10);

    const hash2 = sha256.hash(buf.toString("hex"), {msgFormat: "hex-bytes"})
    assert(hash == hash2)

    return bigInt(r, 16)
}

export {hash, numToCircomHashInput}
