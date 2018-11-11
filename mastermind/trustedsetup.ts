//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as argparse from 'argparse'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'


const stringifyBigInts = (o: any): any => {
    if ((typeof(o) == "bigint") || (o instanceof snarkjs.bigInt))  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o === "object") {
        const res = {};
        for (let k in o) {
            res[k] = stringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

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

    // Exit if the compiled circuit input file doesn't exist
    if (!input) {
    }

    if (!existsSync(input)) {
        console.error(input, 'does not exist')
        return
    }

    // Run the trusted setup process if the output keyfiles don't exist, or the
    // user wants to overwrite them
    if (overwrite || !existsSync(provingKeyOutput) || !existsSync(verifyingKeyOutput)) {
        try {
            const circuitDef = JSON.parse(
                readFileSync(input, 'utf8')
            )
            const circuit = new snarkjs.Circuit(circuitDef);
            const setup = snarkjs.setup(circuit);
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
    } else {
        return
    }
}

main()
