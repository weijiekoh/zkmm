import { Circuit, bigInt } from 'snarkjs'
import * as compile from 'circom'
import {pedersenHash} from '../pedersen'

describe('Pedersen hash', async () => {
    let circuitDef: any
    let circuit: any
    beforeAll(async () => {
        const circuitFile = __dirname + '/../../circuits/pedersen_test.circom'
        circuitDef = await compile(circuitFile)
        circuit = new Circuit(circuitDef)
    })

    test('should match encodePedersen()', async () => {
        const testInput = {
            in: 124
        }

        const witness = circuit.calculateWitness(testInput)

        const circuitHash = witness[circuit.getSignalIdx('main.encoded')]
        const jsHash = pedersenHash(bigInt(testInput.in))

        console.log('Hash calculated by circuit:', circuitHash.toString(16))
        console.log('Hash calculated by js     :', jsHash.encodedHash.toString(16))

        //console.log('jx', jsHash.babyJubX.toString(16))
        //console.log('cx', witness[circuit.getSignalIdx('main.out[0]')].toString(16))

        //console.log('jy', jsHash.babyJubY.toString(16))
        //console.log('cy', witness[circuit.getSignalIdx('main.out[1]')].toString(16))

        expect(jsHash.encodedHash.toString()).toEqual(circuitHash.toString())
    })
})

