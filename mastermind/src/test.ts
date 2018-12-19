//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS7016
import * as argparse from 'argparse'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
import {unstringifyBigInts, genSolnInput, genSalt} from './utils'
import {hash, numToCircomHashInput} from './hash'

const main = async function() {
    const parser = new argparse.ArgumentParser({
        description: 'Generate a zk-SNARK verifier in JavaScript'
    })

    parser.addArgument(
        ['-c', '--circuit'],
        { 
            help: 'the compiled .json file',
            required: true
        }
    )

    parser.addArgument(
        ['-vk', '--verifying-key'],
        { 
            help: 'the .json verifying key source file',
            required: true
        }
    )

    parser.addArgument(
        ['-pk', '--proving-key'],
        { 
            help: 'the .pk.json input file for the proving key',
            required: true
        }
    )

    const args = parser.parseArgs();
    const provingKeyInput = args.proving_key
    const verifyingKeyInput = args.verifying_key
    const circuitFile = args.circuit

    const testInput = {
      i: '4'
    }

    const provingKey = unstringifyBigInts(JSON.parse(readFileSync(provingKeyInput, "utf8")))
    const verifyingKey = unstringifyBigInts(JSON.parse(readFileSync(verifyingKeyInput, "utf8")))
    const circuitDef = JSON.parse(readFileSync(circuitFile, "utf8"))

    console.log(new Date(), 'Loading circuit')
    const circuit = new snarkjs.Circuit(circuitDef)

    console.log(new Date(), 'Calculating witness')
    const witness = circuit.calculateWitness(testInput)
    console.log('witness:', witness)
    console.log('output:', witness[circuit.getSignalIdx('main.out')])

    console.log(new Date(), 'Generating proof')
    const {proof, publicSignals} = snarkjs.groth.genProof(provingKey, witness);

    console.log('publicSignals:', publicSignals)

    console.log(new Date(), 'Verifying proof')
    const valid = snarkjs.groth.isValid(verifyingKey, proof, publicSignals)


    if (valid) {
        console.log("The proof is valid");
    } else {
        console.log("The proof is not valid");
    }

    console.log(new Date(), 'Done')
}

main()
