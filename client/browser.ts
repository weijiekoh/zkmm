import * as snarkjs from 'snarkjs'
//const snarkjs = require('snarkjs')

console.log('Downloading setup...')

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
console.log(snarkjs)

fetch('../mastermind/setup/mastermind.vk.json').then(res => {
    res.json().then(vk => {
      const verifyingKey = unstringifyBigInts(vk)

        fetch('../mastermind/proofs/mastermind.proof.json').then(res1 => {
            res1.json().then(p => {
                const proof = unstringifyBigInts(p)

                fetch('../mastermind/signals/testsignals.json').then(res2 => {
                    res2.json().then(s => {
                        const publicSignals = unstringifyBigInts(s)

                        console.log('Validating proof...')
                        console.log('Start:', new Date())
                        console.log(verifyingKey)
                        console.log(proof)
                        console.log(publicSignals)
                        const isValid: boolean = snarkjs.isValid(
                            verifyingKey,
                            proof,
                            publicSignals,
                        )
                        console.log('End:', new Date())
                        if (isValid) {
                            console.log('The zk-SNARK proof is valid.')
                        }
                    })
                })
            })
        })
    })
})
