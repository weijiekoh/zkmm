//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import {hash, numToCircomHashInput} from '../../mastermind/src/hash'
import {pedersenHash} from '../../mastermind/src/pedersen'
import {unstringifyBigInts, stringifyBigInts, genSolnInput} from '../../mastermind/src/utils'
//@ts-ignore TS2304
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS7016
import * as argparse from 'argparse'

const numToArray = (n: number) => {
    return n.toString().split('').map(a => parseInt(a, 10))
}


const main = async () => {
    //@ts-ignore TS2304
    const version = parseInt(process.version.split('\.')[0].slice(1), 10)
    if (version < 10) {
        console.log('Please use Node v10 or higher.')
        return
    }

    const parser = new argparse.ArgumentParser({
        description: 'Generate a zk-SNARK proof in JavaScript'
    })

    parser.addArgument(
        ['-g', '--guess'],
        { 
            help: 'the guess as a number',
            required: true
        }
    )

    parser.addArgument(
        ['-s', '--solution'],
        { 
            help: 'the solution as a number',
            required: true
        }
    )

    parser.addArgument(
        ['-nb'],
        { 
            help: 'the number of exact matches',
            required: true
        }
    )

    parser.addArgument(
        ['-nw'],
        { 
            help: 'the number of inexact matches',
            required: true
        }
    )

    parser.addArgument(
        ['-l', '--salt'],
        { 
            help: 'the salt',
            required: true
        }
    )

    const args = parser.parseArgs();
    const guess = args.guess
    const soln = args.solution
    const nb = args.nb
    const nw = args.nw
    const salt = snarkjs.bigInt('0x' + args.salt, 16)

    const saltedSoln = snarkjs.bigInt(soln).add(salt)
    const hashedSoln = pedersenHash(saltedSoln)

    let guessArr = numToArray(guess)
    let solnArr = numToArray(soln)

    const input = {
        pubNumBlacks: nb.toString(),
        pubNumWhites: nw.toString(),
        pubSolnHash: hashedSoln.encodedHash.toString(),
        privSaltedSoln: saltedSoln.toString(),
        pubGuessA: guessArr[0],
        pubGuessB: guessArr[1],
        pubGuessC: guessArr[2],
        pubGuessD: guessArr[3],
        privSolnA: solnArr[0],
        privSolnB: solnArr[1],
        privSolnC: solnArr[2],
        privSolnD: solnArr[3],
    }

    const pkFile = './mastermind/setup/mastermind.pk.json'
    const circuitFile = './mastermind/circuits/mastermind.json'
    const provingKey = unstringifyBigInts(JSON.parse(readFileSync(pkFile, "utf8")))
    const circuitDef = JSON.parse(readFileSync(circuitFile, "utf8"))
    const circuit = new snarkjs.Circuit(circuitDef)
    const witness = circuit.calculateWitness(input)
    const {proof, publicSignals} = snarkjs.groth.genProof(provingKey, witness);
    console.log(JSON.stringify(stringifyBigInts(proof)))
    console.log(JSON.stringify(stringifyBigInts(publicSignals)))
    console.log(hashedSoln.encodedHash.toString())

    const vkFile = './mastermind/setup/mastermind.vk.json'
    const vk = unstringifyBigInts(JSON.parse(readFileSync(vkFile, "utf8")))
    const valid = snarkjs.groth.isValid(vk, proof, publicSignals)
    console.log(valid)
}

main()
