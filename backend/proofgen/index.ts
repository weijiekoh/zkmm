//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
import * as sqlite3 from 'sqlite3'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
import {hash, numToCircomHashInput} from '../../mastermind/src/hash'
import {unstringifyBigInts, stringifyBigInts} from '../../mastermind/src/utils'
import {existsSync, readFileSync, writeFileSync} from 'fs'

const handleRow = (row) => {
  const salt = bigInt(row.salt, 16)
  const solution = bigInt(row.solution)
  const nw = row.clueNw
  const nb = row.clueNb

  const solutionA = Math.floor(row.solution / 1000)
  const solutionB = Math.floor(row.solution % 1000 / 100)
  const solutionC = Math.floor(row.solution % 100 / 10)
  const solutionD = Math.floor(row.solution % 10)
  const guessA = Math.floor(row.guess / 1000)
  const guessB = Math.floor(row.guess % 1000 / 100)
  const guessC = Math.floor(row.guess % 100 / 10)
  const guessD = Math.floor(row.guess % 10)

  const saltedSoln = solution.add(salt)
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

  return {proofStr, publicSignalsStr}
}

const genProofs = async () => {
  const version = parseInt(process.version.split('\.')[0].slice(1), 10)
  if (version < 10) {
    console.log('Please use Node v10 or higher.')
    return
  }

  const db = new sqlite3.Database('backend/db.sqlite3', (err) => {
    if (err) {
      console.error(err)
      return
    }
  })

  let sql = 'SELECT * FROM app_game LEFT OUTER JOIN app_proof on app_game.commit_reveal_id==app_proof.game_id where app_proof.proof IS null;'
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    if (rows.length > 0) {
      console.log('Generating', rows.length, 'proof(s)...')
      rows.forEach((row) => {
        if (row.guess !== null) {
          console.log('Guess:', row.guess)
          const {proofStr, publicSignalsStr} = handleRow(row)
          const d = [proofStr, publicSignalsStr, row.game_id, row.guess]
          db.run('UPDATE app_proof SET proof=?, public_signals=? WHERE game_id=? AND guess=?', d, (err) => {
            if (err) {
              console.error(err)
            }
          })

        }
      })
    }
  })
}

setInterval(genProofs, 3000)
