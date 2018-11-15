//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as argparse from 'argparse'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
import {stringifyBigInts} from './utils'

const main = async function() {
    const parser = new argparse.ArgumentParser({
        description: 'Run a trusted setup of a zk-SNARK circuit'
    })

    parser.addArgument(
        ['-i', '--input'],
        { 
            help: 'the .json source file',
            required: true
        }
    )

    parser.addArgument(
        ['-pk', '--proving-key'],
        { 
            help: 'the .pk.json output file for the proving key',
            required: true
        }
    )

    parser.addArgument(
        ['-vk', '--verifying-key'],
        {
            help: 'the .vk.json output file for the verifying key',
            required: true
        }
    )

    parser.addArgument(
        ['-r', '--overwrite'],
        { 
            help: 'overwrite the output file',
            defaultValue: false,
            storeTrue: true,
            nargs: 0
        }
    )

    const args = parser.parseArgs();
    const provingKeyOutput = args.proving_key
    const verifyingKeyOutput = args.verifying_key
    const input = args.input
    const overwrite = args.overwrite != null || args.overwrite != false

    if (!existsSync(input)) {
        console.error(input, 'does not exist')
        return
    }

    // Run the trusted setup process if the output keyfiles don't exist, or the
    // user wants to overwrite them
    if (overwrite || !existsSync(provingKeyOutput) || !existsSync(verifyingKeyOutput)) {
        try {
            // Load the circuit
            const circuitDef = JSON.parse(
                readFileSync(input, 'utf8')
            )
            const circuit = new snarkjs.Circuit(circuitDef);

            // Perform the setup
            const setup = snarkjs.groth.setup(circuit);

            // Save the keys
            const provingKey = setup.vk_proof
            const verifyingKey = setup.vk_verifier

            writeFileSync(
                provingKeyOutput,
                JSON.stringify(stringifyBigInts(provingKey)),
                'utf8'
            )

            writeFileSync(
                verifyingKeyOutput,
                JSON.stringify(stringifyBigInts(verifyingKey)),
                'utf8'
            )
        } catch (e) {
            console.error(e)
        }
    }
}

main()
