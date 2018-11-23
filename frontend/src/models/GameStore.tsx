import * as CryptoJS from 'crypto-js'
import * as Cookies from 'js-cookie'
import { action, observable } from 'mobx'
import { pegsToNum } from '../utils'

import * as snarkjs from 'snarkjs'

let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache': 'no-cache'
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

const unstringifyBigInts = (o: any): any => {
    if ((typeof(o) === "string") && (/^[0-9]+$/.test(o) ))  {
        return snarkjs.bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

export default class GameStore {
    @observable
    public log = [
        'You can play a (semi)-trustless game of Mastermind here.',
        'Select four pegs of any colour or permutation and click the Guess button.',
        'The codemaster will send you a clue. Click the Verify button to verify it, which takes about two minutes on a modern processor.',
        'The clue cannot be faked as your browser will verify it using a zk-SNARK.',
        'Have fun!'
    ]

    @observable public salt: string

    @observable public solnHash: any

    @observable public verifyingKey: any

    @observable public pendingPegs: string[] = []

    @observable public currentGuess: string[] = []

    @observable public guesses: string[][] = []

    @action public async verify(i: number) {
      const guess = this.guesses[i]

      this.logEntry('Verifying ' + JSON.stringify(guess['guess']) + '...')

      this.guesses[i]['verifying'] = true

      const guessAsNum = pegsToNum(guess['guess'])
      const r = await fetch(
        '/api/proof/?salt=' + encodeURIComponent(this.salt) +
        '&guess=' + guessAsNum.toString(),
        {
          headers,
          method: 'GET',
          credentials: 'same-origin'
        }
      )
      const json = await r.json()
      const proof = unstringifyBigInts(JSON.parse(json.proof))
      const publicSignals = unstringifyBigInts(JSON.parse(json.public_signals))

      this.logEntry('Proof:' + json.proof)
      this.logEntry('Public signals:' + json.public_signals)

      const psGuessA = parseInt(publicSignals[1], 10)
      const psGuessB = parseInt(publicSignals[2], 10)
      const psGuessC = parseInt(publicSignals[3], 10)
      const psGuessD = parseInt(publicSignals[4], 10)
      const correctGuess = guessAsNum === (
        psGuessA * 1000 +
        psGuessB * 100 +
        psGuessC * 10 +
        psGuessD * 1
      )

      const correctClue =
        parseInt(publicSignals[5], 10) === guess['nb'] &&
        parseInt(publicSignals[6], 10) === guess['nw']

      const correctSalt =
        snarkjs.bigInt('0x' + this.salt).equals(publicSignals[8])

      const correctHash =
        this.solnHash.equals(publicSignals[7])

      this.guesses[i]['verified'] =
        snarkjs.groth.isValid(
          this.verifyingKey,
          proof,
          publicSignals
        ) && correctClue && correctSalt && correctHash

      if (this.guesses[i]['verified']) {
        this.logEntry('Verified!')
      }

      this.guesses[i]['verifying'] = false
    }

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
        this.clearColours()
        const guess = pegsToNum(this.currentGuess)

        const resp = await fetch('/api/guess/', {
            headers,
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({
                salt: this.salt,
                guess
            })
        })
        const unverifiedClue = await resp.json()
        this.guesses.unshift({
            guess: this.currentGuess,
            verified: false,
            verifying: false,
            ...unverifiedClue
        })
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

        const verifyingKeyR = await fetch('/api/verifying_key')
        const verifyingKey = JSON.parse(await verifyingKeyR.text())
        this.verifyingKey = unstringifyBigInts(JSON.parse(verifyingKey))

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
            }
        )

        const revealResponse = await r2.json()
        if (revealResponse.server_hash === serverHash &&
            revealResponse.player_hash === playerHash &&
            revealResponse.player_plaintext === playerPlaintext) {

            const randomSalt = CryptoJS.SHA256(playerHash + serverHash).toString()

            if (randomSalt === revealResponse.salt) {
                this.salt = randomSalt
                this.solnHash = snarkjs.bigInt('0x' + revealResponse.solnHash)

                this.logEntry(
                    'Successfully performed a commit-reveal scheme ' +
                    'to trustlessly generate a random salt: ' + snarkjs.bigInt('0x' + randomSalt).toString()
                )

                this.logEntry(
                  'Additionally, the codemaster has declared ' +
                  'that the hashed solution is: ' +
                  this.solnHash.toString()
                )
                this.logEntry('You are now ready to play Mastermind.')
            }
        }
    }
}
