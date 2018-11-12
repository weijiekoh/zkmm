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

    const testCase = {
        "guess": [1, 2, 2, 1],
        "soln":  [2, 2, 1, 2],
        "whitePegs": 2,
        "blackPegs": 1,
    }

    const salt: bigInt.BigInteger = genSalt()
    const saltedSoln = genSolnInput(testCase.soln).add(salt)
    const {a, b} = numToCircomHashInput(saltedSoln)
    const hashedSaltedSoln = hash(saltedSoln).toString()

    const testInput = {
        pubNumBlacks: testCase.blackPegs.toString(),
        pubNumWhites: testCase.whitePegs.toString(),
        pubSolnHash: hashedSaltedSoln.toString(),
        pubSalt: salt.toString(),
        pubSaltedSolnA: a.toString(),
        pubSaltedSolnB: b.toString(),
        pubGuessA: testCase.guess[0],
        pubGuessB: testCase.guess[1],
        pubGuessC: testCase.guess[2],
        pubGuessD: testCase.guess[3],
        privSolnA: testCase.soln[0],
        privSolnB: testCase.soln[1],
        privSolnC: testCase.soln[2],
        privSolnD: testCase.soln[3],
    }

    console.log(testInput)

    const provingKey = unstringifyBigInts(JSON.parse(readFileSync(provingKeyInput, "utf8")))
    const verifyingKey = unstringifyBigInts(JSON.parse(readFileSync(verifyingKeyInput, "utf8")))
    const circuitDef = JSON.parse(readFileSync(circuitFile, "utf8"))

    console.log(new Date(), 'Loading circuit')
    const circuit = new snarkjs.Circuit(circuitDef)

    console.log(new Date(), 'Calculating witness')
    const witness = circuit.calculateWitness(testInput)
    console.log('Hash calculated by JS     :', testInput.pubSolnHash)
    console.log('Hash calculated by circuit:', witness[circuit.getSignalIdx('main.solnHashOut')])

    console.log(new Date(), 'Generating proof')
    const {proof, publicSignals} = snarkjs.genProof(provingKey, witness);

    console.log(new Date(), 'Verifying proof')
    const valid = snarkjs.isValid(verifyingKey, proof, publicSignals)

    console.log(new Date(), 'Done')

    if (valid) {
        console.log("The proof is valid");
    } else {
        console.log("The proof is not valid");
    }

}

main()
