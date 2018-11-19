//@ts-ignore TS7016
import * as bigInt from 'big-integer'
import {hash, numToCircomHashInput} from './hash'
import {unstringifyBigInts, genSolnInput, genSalt} from './utils'

const r = {
  "server_plaintext":"39b24b5d8409c1ff3b3c08dcac2e43693386ed05d800f7110327d16faad85e17",
  "server_hash":"3358d8356102c4b5a8df667a9bfc965dc4863b3f8f9d48abdf55b0076c820cea",
  "player_plaintext":"16046253f7988a54fced66da19701d32c26dd0af21079d9d699ee73df9070a8de526b37dd1f77214df300440b0c7c8d3f54615ab37472b104ad4ef148183643e",
  "player_hash":"e185c79024f1be7c093a15e921f163c4e9d8ccf475f0a4a3e1c3158aedd6ebd5",
  "salt":"b30aef39bf830c4dcf7eaa3142126d40174c00547570bce97dc8944714ca5db8",
  "saltedSolnHash":"2b7382699024de0d27376c5bcb3e5c7bd336eebdb322a0be7689868b163998fb",
  "solution":2144
}


const salt = bigInt(r.salt, 16)

const saltedSoln = genSolnInput([2, 1, 4, 4]).add(salt)
const hashedSaltedSoln = hash(saltedSoln).toString(16)
console.log(saltedSoln.toString())
console.log(hashedSaltedSoln)
