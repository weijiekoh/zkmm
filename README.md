# A Mastermind game with zk-SNARKs

This is an implementation of the [Mastermind board
game](https://en.wikipedia.org/wiki/Mastermind_(board_game)) which uses
zk-SNARKs instead of a trusted third party to enforce game rules.

It uses the [`snarkjs`](https://github.com/iden3/snarkjs) and
[`circom`](https://github.com/iden3/circom) JavaScript libraries from
[iden3](https://iden3.io/).

<img 
width=400
src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Mastermind.jpg" />

[*Image source*](https://commons.wikimedia.org/wiki/File:Mastermind.jpg)


## About zk-SNARKS

zk-SNARKs allow you to cryptographically prove knowledge of some secret data
without revealing said data. For a simple explanation of zk-SNARKs, read [this
blog
post](https://media.consensys.net/introduction-to-zksnarks-with-examples-3283b554fc3b)
by Christian Lundkvist.

## The rules of Mastermind

There are two players: the *codebreaker* and the *codemaster*.

The codemaster creates a secret four-digit sequence of coloured pegs, limited to red,
blue, green, and yellow.

To win, the codebreaker must guess the secret sequence of pegs within a set
number of attempts. After each guess, if the codebreaker does not yet have the
correct solution, the codemaster must tell the codebreaker the following clue:

1) How many exact matches of colour and position there are — these are are
*black pegs*

2) How many pegs have matching colours, but are in the wrong position — these
are *white pegs*.

For example, if the solution is `R R B Y`, and the guess is `Y R B G`, the
codemaster must provide this clue: 2 black pegs and 1 white peg.

```
Solution       : Y R B G
Guess          : R R B Y

Exact matches  : 0 1 1 0 -> 2 black pegs
Inexact matches: 1 0 0 0 -> 1 white peg
```

Inexact matches do not overlap; for instance:

```
Solution       : R R Y B
Guess          : G G R B

Exact matches  : 0 0 0 1 -> 1 black peg
Inexact matches: 0 0 1 0 -> 1 white peg (not two, even though there are two red 
                                         pegs in the solution)
```

An illustrated example:

<img src='https://www.mathworks.com/matlabcentral/mlc-downloads/downloads/submissions/11798/versions/1/screenshot.gif'
  width=400 />

[*Image source*](https://www.mathworks.com/matlabcentral/fileexchange/11798-mastermind)

## The protocol

### 1. Prepare the circuit

Create an arithmetic circuit `C` which is essentially this function:

```
C (pubGuess, pubClue, pubSolutionHash, privSolution):
    hash(privSolution) === pubSolutionHash
    genClue(pubGuess, privSolution) === pubClue
```

That is, given the secret sequence `privSolution`, the guess `pubGuess`, the
clue `pubClue`, and a cryptographic hash of the secret sequence, the circuit:

a) calculates the correct clue and the cryptographic hash of the secret
sequence, and 

b) declares two *constraints*: that the cryptographic hash is correct and that
the clue is correct.

In a later step, the codebreaker can cryptographically verify that (a) and/or
(b) does not hold; more on that later.

### 2. Trusted setup

Generate the proving key, verifiying key, and toxic waste. Discard the toxic
waste. Make the proving key and verifying key public. For simplicity, we assume
that whoever did so can be trusted.

### 3. Generate a random salt

Using a commit-reveal scheme, the codemaster and codebreaker should arrive at a
random salt. This is not part of the zk-SNARK, but helps to prevent a rainbow
attack on the solution by the codebreaker.

### 4. Start the game

Before each game, the codemaster should generate the following:

a) the secret solution to the puzzle — e.g. `G R Y B`

b) the SHA256 hash of the solution and the salt

The codemaster should then send the hash to the codebreaker.

### 5. Make a guess

For each turn, the codebreaker should send their guess to the codemaster, who
should then generate the following:

a) the clue which corresponds to the secret solution and the guess;

b) a proof that the clue is correct, which is the result of computing:

```
proof = Prover(provingKey, pubGuess, pubClue, pubSolutionHash, privSolution)
```

The codemaster must then send the clue and the proof back to the codemaster,
who can verify that the clue is valid by computing:

```
Verify(verifyingKey, pubGuess, pubClue, pubSolutionHash, proof)
```

### 6. Repeat

Perform step 5 until the codebreaker runs out of allowed attempts, or guesses
the correct solution.

## Running the game

## Setting up the circuit

### 1. Set up dependencies

```
cd mastermind && \
npm i && \
tsc
```

### 2. Compile the circuit

```
node --max-old-space-size=4000 build/compile.js -i mastermind/circuits/mastermind.circom -o mastermind/circuits/mastermind.json
```

### 3. Perform the trusted setup

This takes about half an hour if you use Node 10, as it computes BigInts faster
than Node 9.

```
node --max-old-space-size=4000 build/trustedsetup.js -i mastermind/circuits/mastermind.json -pk mastermind/setup/mastermind.pk.json -vk mastermind/setup/mastermind.vk.json -r
```


### 5. Generate and verify a sample proof in JS

Generate the proof and public signals for a sample input:

```
node --max-old-space-size=4000 build/generateproof.js -c mastermind/circuits/mastermind.json  -vk mastermind/setup/mastermind.vk.json -pk mastermind/setup/mastermind.pk.json -po mastermind/proofs/mastermind.proof.json -so mastermind/signals/testsignals.json
```

Verify it in JS:

```
```

### 6. Verify a sample proof in Solidity

Generate the Solidity code of the verifier, and deploy it to a Ethereum
network, like Ropsten. You can use [Remix](http://remix.ethereum.org) to do
this. Avoid using the Javascript VM feature as your browser may freeze up.
Instead, get some Ropsten ether, deploy your contract to the testnet, and use
that to verify the proof.

```
node --max-old-space-size=4000 build/generateverifier.js -i mastermind/setup/mastermind.vk.json -o mastermind/contracts/mastermindverifier.sol -r

```

Next, generate the contract call parameters and paste the output into Remix:

```
node build/generatecall.js -p mastermind/proofs/mastermind.proof.json -s mastermind/signals/testsignals.json
```

Click the `verifyProof` button to execute the function.

<img src="./img/remix_screenshot.png" />
