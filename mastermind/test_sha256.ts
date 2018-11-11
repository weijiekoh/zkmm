//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as compile from 'circom'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS2304
const crypto = require('crypto')

import {hash, numToCircomHashInput} from './hash'


const main = async function() {
    const num = bigInt(2).pow(50)
    console.log('Hash calculated by JS     :', hash(num).toString())

    const {a, b} = numToCircomHashInput(num)

    const circuitDef = JSON.parse(
        readFileSync('circuits/hash.json', 'utf8')
    )

    const circuit = new snarkjs.Circuit(circuitDef);
    const witness = circuit.calculateWitness({a, b})
    const c = witness[circuit.getSignalIdx('main.out')]
    console.log('Hash calculated by circuit:', c)
}

main()
