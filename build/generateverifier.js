"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const argparse = require("argparse");
//@ts-ignore TS7016
const fs_1 = require("fs");
const utils_1 = require("./utils");
function generateVerifier(verificationKey, template) {
    // Copied from https://github.com/iden3/snarkjs
    const vkalfa1_str = `${verificationKey.vk_alfa_1[0].toString()},` +
        `${verificationKey.vk_alfa_1[1].toString()}`;
    template = template.replace("<%vk_alfa1%>", vkalfa1_str);
    const vkbeta2_str = `[${verificationKey.vk_beta_2[0][1].toString()},` +
        `${verificationKey.vk_beta_2[0][0].toString()}], ` +
        `[${verificationKey.vk_beta_2[1][1].toString()},` +
        `${verificationKey.vk_beta_2[1][0].toString()}]`;
    template = template.replace("<%vk_beta2%>", vkbeta2_str);
    const vkgamma2_str = `[${verificationKey.vk_gamma_2[0][1].toString()},` +
        `${verificationKey.vk_gamma_2[0][0].toString()}], ` +
        `[${verificationKey.vk_gamma_2[1][1].toString()},` +
        `${verificationKey.vk_gamma_2[1][0].toString()}]`;
    template = template.replace("<%vk_gamma2%>", vkgamma2_str);
    const vkdelta2_str = `[${verificationKey.vk_delta_2[0][1].toString()},` +
        `${verificationKey.vk_delta_2[0][0].toString()}], ` +
        `[${verificationKey.vk_delta_2[1][1].toString()},` +
        `${verificationKey.vk_delta_2[1][0].toString()}]`;
    template = template.replace("<%vk_delta2%>", vkdelta2_str);
    // The points
    template = template.replace("<%vk_input_length%>", (verificationKey.IC.length - 1).toString());
    template = template.replace("<%vk_ic_length%>", verificationKey.IC.length.toString());
    let vi = "";
    for (let i = 0; i < verificationKey.IC.length; i++) {
        if (vi != "")
            vi = vi + "        ";
        vi = vi + `vk.IC[${i}] = Pairing.G1Point(${verificationKey.IC[i][0].toString()},` +
            `${verificationKey.IC[i][1].toString()});\n`;
    }
    template = template.replace("<%vk_ic_pts%>", vi);
    return template;
}
const main = async function () {
    const parser = new argparse.ArgumentParser({
        description: 'Generate a zk-SNARK verifier in Solidity'
    });
    parser.addArgument(['-i', '--input'], {
        help: 'the .json verifying key source file',
        required: true
    });
    parser.addArgument(['-o', '--output'], {
        help: 'the .sol output file for the verifier',
        required: true
    });
    parser.addArgument(['-r', '--overwrite'], {
        help: 'overwrite the output file',
        defaultValue: false,
        storeTrue: true,
        nargs: 0
    });
    const args = parser.parseArgs();
    const output = args.output;
    const input = args.input;
    const overwrite = args.overwrite != null || args.overwrite != false;
    if (!fs_1.existsSync(input)) {
        console.error(input, 'does not exist');
        return;
    }
    // Run the trusted setup process if the output file doesn't exist, or the
    // user wants to overwrite them
    if (overwrite || !fs_1.existsSync(output)) {
        const verifyingKey = utils_1.unstringifyBigInts(JSON.parse(fs_1.readFileSync(input, "utf8")));
        let template = fs_1.readFileSync("./mastermind/templates/verifier_groth.sol", "utf-8");
        const code = generateVerifier(verifyingKey, template);
        fs_1.writeFileSync(output, code, "utf-8");
    }
};
main();
//# sourceMappingURL=generateverifier.js.map