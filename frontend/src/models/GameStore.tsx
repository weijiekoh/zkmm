import * as CryptoJS from 'crypto-js'
import * as Cookies from 'js-cookie'
import { action, observable } from 'mobx'


let headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cache': 'no-cache',
}

const buf2hex = (buffer) => {
    return Array.prototype.map.call(
        new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)
    ).join('')
}

const generateSalt = () => {
    const n = 64
    let a = new Uint8Array(n)
    for (let i = 0; i < n; i += 65536) {
        crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, 65536)))
    }
    return buf2hex(a)
}

export default class GameStore {
  @observable
  public log = [
    'You can play a (semi)-trustless game of Mastermind here.',
    'Select four pegs of any colour or permutation and click the Guess button.',
    'After a couple of minutes, the codemaster will send you a clue.',
    'The clue cannot be faked as your browser will verify it using a zk-SNARK.',
    'Have fun!'
  ]

  @observable
  public salt: string

  @observable
  public pendingPegs: string[] = []

  @observable
  public currentGuess: string[] = []

  @observable
  public guesses: string[][] = []

  @action
  public pickColour(colour: string) {
    if (this.pendingPegs.length < 4) {
      this.pendingPegs.push(colour)
    }
  }

  @action public clearColours() {
      this.pendingPegs = []
  }

  @action public async makeGuess() {
    this.currentGuess = this.pendingPegs
    this.guesses.unshift(this.currentGuess)
    this.clearColours()
    let guess = 0
    const pegs = { R: 1, G: 2, B: 3, Y: 4 }
    this.currentGuess.forEach((peg, i) => {
      guess += 10 ** (3 - i) * pegs[peg]
    })

    const resp = await fetch('/api/guess/', {
        headers,
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({
          salt: this.salt,
          guess
        })
    })
  }

  @action public setSalt(salt: string) {
    this.salt = salt
  }

  @action public logEntry(entry: string) {
    this.log.push(entry)
  }

  @action public async registerWithServer() {
  const playerPlaintext = generateSalt()
  const playerHash = CryptoJS.SHA256(playerPlaintext).toString()

  // Fetch from /api/ to get the csrftoken cookie
  await fetch('/api/')
  headers['X-CSRFToken'] = Cookies.get('csrftoken')

  const r1 = await fetch(
    '/api/commit_hash/',
    {
      headers,
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        player_hash: playerHash
      })
    }
  )

  const serverResponse = await r1.json()
  const serverHash = serverResponse.server_hash

  const r2 = await fetch(
    '/api/reveal/',
    {
      headers,
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        player_hash: playerHash,
        player_plaintext: playerPlaintext
      })
    })

  const revealResponse = await r2.json()
  if (revealResponse.server_hash === serverHash &&
    revealResponse.player_hash === playerHash &&
    revealResponse.player_plaintext === playerPlaintext) {

    const randomSalt = CryptoJS.SHA256(playerHash + serverHash).toString()

    if (randomSalt === revealResponse.salt) {
      this.setSalt(randomSalt)
      this.logEntry(
        'Successfully performed a commit-reveal scheme ' +
        'to trustlessly generate a random salt: ' + randomSalt
      )
    }
  }
  }
}
