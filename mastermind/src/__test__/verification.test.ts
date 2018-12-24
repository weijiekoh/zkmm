import { groth, Circuit, bigInt } from 'snarkjs'
import * as compile from 'circom'
import { genSolnInput, genSalt } from '../utils'
import { pedersenHash } from '../pedersen'

describe('Mastermind circuit', async () => {
    let circuitDef: any
    let circuit: any
    let setup: any
    beforeAll(async () => {
        const circuitFile = __dirname + '/../../circuits/mastermind.circom'
        circuitDef = await compile(circuitFile)
        circuit = new Circuit(circuitDef)

        console.log(new Date(), 'Performing setup')
        setup = groth.setup(circuit)
        console.log(new Date(), 'Done')
    })

    test('mastermind circuit', async () => {
        const testCase = {
            "guess": [1, 3, 3, 3],
            "soln":  [3, 3, 3, 3],
            "blackPegs": 3,
            "whitePegs": 0,
        }

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

        expect(witness[circuit.getSignalIdx('main.pubNumBlacks')].toString())
            .toEqual(testCase.blackPegs.toString())

        expect(witness[circuit.getSignalIdx('main.pubNumWhites')].toString())
            .toEqual(testCase.whitePegs.toString())

        expect(hashedSoln.encodedHash.toString())
            .toEqual(witness[circuit.getSignalIdx('main.solnHashOut')].toString())

        console.log(hashedSoln.encodedHash.toString())
        console.log(witness[circuit.getSignalIdx('main.solnHashOut')].toString())

        console.log(new Date(), 'Generating proof')
        const {proof, publicSignals} = groth.genProof(setup.vk_proof, witness);

        console.log(new Date(), 'Verifying proof')
        const valid = groth.isValid(setup.vk_verifier, proof, publicSignals)

        expect(valid).toBeTruthy()
    })
})
