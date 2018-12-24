import { Circuit, bigInt } from 'snarkjs'
import * as compile from 'circom'
import {unstringifyBigInts, genSolnInput, genSalt} from '../utils'
import {pedersenHash} from '../pedersen'

describe('Mastermind circuit', async () => {
    let circuitDef: any
    let circuit: any
    beforeAll(async () => {
        const circuitFile = __dirname + '/../../circuits/mastermind.circom'
        circuitDef = await compile(circuitFile)
        circuit = new Circuit(circuitDef)
    })

    test('mastermind circuit', async () => {
        const testCases = [
            {
                "guess": [1, 2, 2, 1],
                "soln":  [2, 2, 1, 2],
                "whitePegs": 2,
                "blackPegs": 1,
            },
            {
                "guess": [1, 2, 2, 1],
                "soln":  [1, 2, 1, 2],
                "whitePegs": 2,
                "blackPegs": 2,
            },
            {
                "guess": [1, 3, 3, 3],
                "soln":  [3, 3, 3, 3],
                "whitePegs": 0,
                "blackPegs": 3,
            },
            {
                "guess": [2, 2, 1, 1],
                "soln":  [2, 2, 2, 2],
                "whitePegs": 0,
                "blackPegs": 2,
            },
            {
                "guess": [3, 1, 3, 4],
                "soln":  [4, 3, 2, 3],
                "whitePegs": 3,
                "blackPegs": 0,
            },
            {
                "guess": [1, 2, 3, 4],
                "soln":  [4, 3, 2, 1],
                "whitePegs": 4,
                "blackPegs": 0,
            },
            {
                "guess": [1, 1, 1, 1],
                "soln":  [4, 3, 2, 1],
                "whitePegs": 0,
                "blackPegs": 1,
            }
        ]

        testCases.forEach(testCase => {
            const soln = genSolnInput(testCase.soln)
            const saltedSoln = soln.add(genSalt())
            const hashedSoln = pedersenHash(saltedSoln)

            const testInput = {
                pubNumBlacks: testCase.blackPegs.toString(),
                pubNumWhites: testCase.whitePegs.toString(),

                pubSolnHash: hashedSoln.encodedHash.toString(),
                privSaltedSoln: saltedSoln.toString(),

                pubGuessA: testCase.guess[0],
                pubGuessB: testCase.guess[1],
                pubGuessC: testCase.guess[2],
                pubGuessD: testCase.guess[3],
                privSolnA: testCase.soln[0],
                privSolnB: testCase.soln[1],
                privSolnC: testCase.soln[2],
                privSolnD: testCase.soln[3],
            }

            const witness = circuit.calculateWitness(testInput)

            console.log('NB calculated by circuit:', witness[circuit.getSignalIdx('main.pubNumBlacks')])
            expect(witness[circuit.getSignalIdx('main.pubNumBlacks')].toString())
                .toEqual(testCase.blackPegs.toString())

            console.log('NW calculated by circuit:', witness[circuit.getSignalIdx('main.pubNumWhites')])
            expect(witness[circuit.getSignalIdx('main.pubNumWhites')].toString())
                .toEqual(testCase.whitePegs.toString())

            console.log('Hash calculated by circuit:',
                witness[circuit.getSignalIdx('main.solnHashOut')].toString(16))

            console.log('Hash calculated by JS     :', hashedSoln.encodedHash.toString(16))

            expect(hashedSoln.encodedHash.toString())
                .toEqual(witness[circuit.getSignalIdx('main.solnHashOut')].toString())
        })
    })
})
