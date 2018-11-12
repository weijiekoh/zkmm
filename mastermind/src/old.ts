//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as compile from 'circom'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS2304
const crypto = require('crypto')
//@ts-ignore TS2304

const CIRCUIT_SOURCE_FILEPATH = 'circuit.circom'
const CIRCUIT_COMPILED_FILEPATH = 'circuit.json'
const SETUP_FILEPATH = 'setups/mastermind.setup'
const PROOF_AND_SIGNALS_DIR = 'pas'


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

const genSolutionHash = (a: number, b: number): number => {
    //@ts-ignore TS2304
    const buf = new Buffer.alloc(54);

    buf[26] = a
    buf[53] = b

    const hex = crypto.createHash("sha256").update(buf).digest("hex")
    const r = '0x' + hex.slice(10);

    return snarkjs.bigInt(r, 16)
}

const testCases = [
    {
        "guess": [1, 2, 2, 1],
        "soln":  [2, 2, 1, 2],
        "whitePegs": 2,
        "blackPegs": 1,
    },
    //{
        //"guess": [1, 2, 2, 1],
        //"soln":  [1, 2, 1, 2],
        //"whitePegs": 2,
        //"blackPegs": '2',
    //},
    //{
        //"guess": [1, 3, 3, 3],
        //"soln":  [3, 3, 3, 3],
        //"whitePegs": 0,
        //"blackPegs": 3,
    //},
    //{
        //"guess": [2, 2, 1, 1],
        //"soln":  [2, 2, 2, 2],
        //"whitePegs": 0,
        //"blackPegs": 2,
    //},
    //{
        //"guess": [3, 1, 3, 4],
        //"soln":  [4, 3, 2, 3],
        //"whitePegs": 3,
        //"blackPegs": 0,
    //},
    //{
        //"guess": [1, 2, 3, 4],
        //"soln":  [4, 3, 2, 1],
        //"whitePegs": 4,
        //"blackPegs": 0,
    //},
    //{
        //"guess": [1, 1, 1, 1],
        //"soln":  [4, 3, 2, 1],
        //"whitePegs": 0,
        //"blackPegs": 1,
    //}
]

const main = async function() {
    //@ts-ignore TS2304
    const override = process.argv[2] === '-o'

    let circuitDef
    let setup

    try {
        if (!override && existsSync(CIRCUIT_COMPILED_FILEPATH)) {
            console.log('Reusing', CIRCUIT_COMPILED_FILEPATH)
            // The override flag isn't present and the compiled circuit exists,
            // so read it
            circuitDef = JSON.parse(
                readFileSync(
                    CIRCUIT_COMPILED_FILEPATH, 
                    'utf8'
                )
            )
        } else {
            // The override flag is present, so compile and save the circuit
            console.log('Compiling', CIRCUIT_SOURCE_FILEPATH)
            circuitDef = await compile(CIRCUIT_SOURCE_FILEPATH)
            writeFileSync(
                CIRCUIT_COMPILED_FILEPATH,
                JSON.stringify(circuitDef),
                'utf8'
            )
        }
    } catch (err) {
        console.error(err)
    }

    const circuit = new snarkjs.Circuit(circuitDef);

    let provingKey: any
    let verifyingKey: any

    try {
        if (!override && existsSync(SETUP_FILEPATH)) {
            console.log('Reusing', SETUP_FILEPATH)
            // The override flag isn't present and the setup exists, so read it
            setup = unstringifyBigInts(
                JSON.parse(
                    readFileSync(
                        SETUP_FILEPATH, 
                        'utf8'
                    )
                )
            )
            provingKey = setup.provingKey
            verifyingKey = setup.verifyingKey
        } else {
            // The override flag is present, so generate the setup
            console.log('Generating setup', SETUP_FILEPATH)
            setup = snarkjs.setup(circuit);
            provingKey = setup.vk_proof
            verifyingKey = setup.vk_verifier

            writeFileSync(
                SETUP_FILEPATH,
                JSON.stringify(
                    stringifyBigInts({
                        provingKey,
                        verifyingKey
                    })
                ),
                'utf8'
            )
        }
    } catch (err) {
        console.log('Error with the trusted setup')
        console.error(err)
    }


    let i = 0;
    testCases.forEach(testCase => {
        const ab = testCase.soln[0] * 10 + testCase.soln[1]
        const cd = testCase.soln[2] * 10 + testCase.soln[3]
        const testInput = {
            pubNumBlacks: testCase.blackPegs,
            pubNumWhites: testCase.whitePegs,
            pubSolnHash: genSolutionHash(ab, cd),
            pubGuessA: testCase.guess[0],
            pubGuessB: testCase.guess[1],
            pubGuessC: testCase.guess[2],
            pubGuessD: testCase.guess[3],
            privSolnA: testCase.soln[0],
            privSolnB: testCase.soln[1],
            privSolnC: testCase.soln[2],
            privSolnD: testCase.soln[3],
        }

        try {
            console.log('The codemaster calculates the witness')
            const witness = circuit.calculateWitness(testInput)

            console.log('The codemaster generates a proof', new Date())

            // Codemaster generates the proof and public signals
            const { proof, publicSignals } = snarkjs.genProof(provingKey, witness);

            // Save to file
            writeFileSync(
                PROOF_AND_SIGNALS_DIR + '/' + i.toString() + '.json',
                JSON.stringify(
                    stringifyBigInts({ proof, publicSignals }),
                ),
                'utf8'
            )

            console.log('Verifying proof', new Date())
            const isValid: boolean = snarkjs.isValid(verifyingKey, proof, publicSignals)

            if (!isValid) {
                throw new Error('Invalid proof')
            } else {
                console.log('Valid proof')
            }

            console.log('correctNumBlacks calculated by circuit:', witness[circuit.getSignalIdx('main.correctNumBlacks')])
            console.log('correctNumWhites calculated by circuit:', witness[circuit.getSignalIdx('main.correctNumWhites')])
            console.log('Hash calculated by JS     :', testInput.pubSolnHash)
            console.log('Hash calculated by circuit:', witness[circuit.getSignalIdx('main.solnHashOut')])
        } catch (e) {
            console.log(e)
        }

        i++
    })
}

main()
