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
        'After a couple of minutes, the codemaster will send you a clue.',
        'The clue cannot be faked as your browser will verify it using a zk-SNARK.',
        'Have fun!'
    ]

    @observable public salt: string

    @observable public verifyingKey: any

    @observable public pendingPegs: string[] = []

    @observable public currentGuess: string[] = []

    @observable public guesses: string[][] = []

    @action loopFetchProofs() {
        window.setInterval(() => {
            this.guesses.forEach(async (guess, i) => {
                if (guess['proof'] === null) {
                    const guessAsNum = pegsToNum(guess['guess'])
                    const r = await fetch(
                        '/api/proof?salt=' + encodeURIComponent(this.salt) +
                        '&guess=' + guessAsNum.toString(),
                        {
                            headers,
                            method: 'GET',
                            credentials: 'same-origin'
                        }
                    )

                    const json = await r.json()

                    if (json.proof !== null) {
                        const proof = unstringifyBigInts(JSON.parse(json.proof))
                        this.guesses[i]['proof'] = proof

                        const publicSignals = unstringifyBigInts(JSON.parse(json.public_signals))
                        this.guesses[i]['publicSignals'] = publicSignals

                        this.logEntry('Verifying clue for guess ' + guess['guess'].join(" "))

                        this.guesses[i]['verified'] = snarkjs.groth.isValid(
                            this.verifyingKey,
                            proof,
                            publicSignals
                        )
                    }
                }
            })
        }, 3000)
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
            ...unverifiedClue
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
            }
        )

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
                this.logEntry('You are now ready to play Mastermind.')
            }
        }
    }
}
