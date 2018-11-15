"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const snarkjs = require("snarkjs");
//@ts-ignore TS7016
const argparse = require("argparse");
//@ts-ignore TS7016
const fs_1 = require("fs");
const utils_1 = require("./utils");
const main = async function () {
    const parser = new argparse.ArgumentParser({
        description: 'Run a trusted setup of a zk-SNARK circuit'
    });
    parser.addArgument(['-i', '--input'], {
        help: 'the .json source file',
        required: true
    });
    parser.addArgument(['-pk', '--proving-key'], {
        help: 'the .pk.json output file for the proving key',
        required: true
    });
    parser.addArgument(['-vk', '--verifying-key'], {
        help: 'the .vk.json output file for the verifying key',
        required: true
    });
    parser.addArgument(['-r', '--overwrite'], {
        help: 'overwrite the output file',
        defaultValue: false,
        storeTrue: true,
        nargs: 0
    });
    const args = parser.parseArgs();
    const provingKeyOutput = args.proving_key;
    const verifyingKeyOutput = args.verifying_key;
    const input = args.input;
    const overwrite = args.overwrite != null || args.overwrite != false;
    if (!fs_1.existsSync(input)) {
        console.error(input, 'does not exist');
        return;
    }
    // Run the trusted setup process if the output keyfiles don't exist, or the
    // user wants to overwrite them
    if (overwrite || !fs_1.existsSync(provingKeyOutput) || !fs_1.existsSync(verifyingKeyOutput)) {
        try {
            // Load the circuit
            const circuitDef = JSON.parse(fs_1.readFileSync(input, 'utf8'));
            const circuit = new snarkjs.Circuit(circuitDef);
            // Perform the setup
            const setup = snarkjs.groth.setup(circuit);
            // Save the keys
            const provingKey = setup.vk_proof;
            const verifyingKey = setup.vk_verifier;
            fs_1.writeFileSync(provingKeyOutput, JSON.stringify(utils_1.stringifyBigInts(provingKey)), 'utf8');
            fs_1.writeFileSync(verifyingKeyOutput, JSON.stringify(utils_1.stringifyBigInts(verifyingKey)), 'utf8');
        }
        catch (e) {
            console.error(e);
        }
    }
};
main();
//# sourceMappingURL=trustedsetup.js.map