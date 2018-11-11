//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as compile from 'circom'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'

import {hash, numToCircomHashInput} from './hash'

const main = async function() {
    const circuitDef = JSON.parse(
        readFileSync('circuits/mastermind.json', 'utf8')
    )

    const circuit = new snarkjs.Circuit(circuitDef);
}

main()
