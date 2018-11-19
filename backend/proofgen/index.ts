//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
import {hash, numToCircomHashInput} from '../../mastermind/src/hash'
import {unstringifyBigInts, stringifyBigInts, genSolnInput} from '../../mastermind/src/utils'
//@ts-ignore TS2304
import {existsSync, readFileSync, writeFileSync} from 'fs'
//@ts-ignore TS7016
import * as argparse from 'argparse'

const numToArray = (n: number) => {
  return n.toString().split('').map(a => parseInt(a, 10))
}

const handleRow = (salt: number, guess: number, solution: number, nw: number, nb: number) => {
  const solutionA = Math.floor(solution / 1000)
  const solutionB = Math.floor(solution % 1000 / 100)
  const solutionC = Math.floor(solution % 100 / 10)
  const solutionD = Math.floor(solution % 10)
  const guessA = Math.floor(guess / 1000)
  const guessB = Math.floor(guess % 1000 / 100)
  const guessC = Math.floor(guess % 100 / 10)
  const guessD = Math.floor(guess % 10)

  const saltedSoln = bigInt(solution).add(salt)
  const {a, b} = numToCircomHashInput(saltedSoln)
  const hashedSaltedSoln = hash(saltedSoln).toString()
  const input = {
      pubNumBlacks: nb.toString(),
      pubNumWhites: nw.toString(),
      pubSolnHash: hashedSaltedSoln.toString(),
      pubSalt: salt.toString(),
      pubSaltedSolnA: a.toString(),
      pubSaltedSolnB: b.toString(),
      pubGuessA: guessA,
      pubGuessB: guessB,
      pubGuessC: guessC,
      pubGuessD: guessD,
      privSolnA: solutionA,
      privSolnB: solutionB,
      privSolnC: solutionC,
      privSolnD: solutionD,
  }
  const provingKeyInput = './mastermind/setup/mastermind.pk.json'
  const provingKey = unstringifyBigInts(JSON.parse(readFileSync(provingKeyInput, "utf8")))
  const circuitDef = JSON.parse(readFileSync('./mastermind/circuits/mastermind.json', "utf8"))
  const circuit = new snarkjs.Circuit(circuitDef)
  const witness = circuit.calculateWitness(input)
  console.log(new Date(), 'Generating proof')
  const {proof, publicSignals} = snarkjs.groth.genProof(provingKey, witness);
  console.log(new Date(), 'Done.')
  const proofStr = JSON.stringify(stringifyBigInts(proof))
  const publicSignalsStr = JSON.stringify(stringifyBigInts(publicSignals))

  console.log({proofStr, publicSignalsStr})
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
  const salt = bigInt(args.salt, 16)

  const saltedSoln = bigInt(soln).add(salt)
  const hashedSaltedSoln = hash(saltedSoln).toString()

  let guessArr = numToArray(guess)
  let solnArr = numToArray(soln)
  const {a, b} = numToCircomHashInput(saltedSoln)

  const input = {
      pubNumBlacks: nb.toString(),
      pubNumWhites: nw.toString(),
      pubSolnHash: hashedSaltedSoln,
      pubSalt: salt.toString(),
      privSaltedSolnA: a.toString(),
      privSaltedSolnB: b.toString(),
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
  console.log(hashedSaltedSoln.toString())
}

main()
