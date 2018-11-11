//@ts-ignore TS7016
import * as snarkjs from 'snarkjs'
//@ts-ignore TS7016
import * as argparse from 'argparse'
//@ts-ignore TS7016
import * as bigInt from 'big-integer'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'
import {unstringifyBigInts} from './utils'

function generateVerifier(verificationKey, template) {
    const vka_str = `[${verificationKey.vk_a[0][1].toString()},`+
                     `${verificationKey.vk_a[0][0].toString()}], `+
                    `[${verificationKey.vk_a[1][1].toString()},` +
                     `${verificationKey.vk_a[1][0].toString()}]`;
    template = template.replace("<%vk_a%>", vka_str);

    const vkb_str = `${verificationKey.vk_b[0].toString()},`+
                    `${verificationKey.vk_b[1].toString()}`;
    template = template.replace("<%vk_b%>", vkb_str);

    const vkc_str = `[${verificationKey.vk_c[0][1].toString()},`+
                     `${verificationKey.vk_c[0][0].toString()}], `+
                    `[${verificationKey.vk_c[1][1].toString()},` +
                     `${verificationKey.vk_c[1][0].toString()}]`;
    template = template.replace("<%vk_c%>", vkc_str);

    const vkg_str = `[${verificationKey.vk_g[0][1].toString()},`+
                     `${verificationKey.vk_g[0][0].toString()}], `+
                    `[${verificationKey.vk_g[1][1].toString()},` +
                     `${verificationKey.vk_g[1][0].toString()}]`;
    template = template.replace("<%vk_g%>", vkg_str);

    const vkgb1_str = `${verificationKey.vk_gb_1[0].toString()},`+
                      `${verificationKey.vk_gb_1[1].toString()}`;
    template = template.replace("<%vk_gb1%>", vkgb1_str);

    const vkgb2_str = `[${verificationKey.vk_gb_2[0][1].toString()},`+
                       `${verificationKey.vk_gb_2[0][0].toString()}], `+
                      `[${verificationKey.vk_gb_2[1][1].toString()},` +
                       `${verificationKey.vk_gb_2[1][0].toString()}]`;
    template = template.replace("<%vk_gb2%>", vkgb2_str);

    const vkz_str = `[${verificationKey.vk_z[0][1].toString()},`+
                     `${verificationKey.vk_z[0][0].toString()}], `+
                    `[${verificationKey.vk_z[1][1].toString()},` +
                     `${verificationKey.vk_z[1][0].toString()}]`;
    template = template.replace("<%vk_z%>", vkz_str);

    // The points

    template = template.replace("<%vk_input_length%>", (verificationKey.A.length-1).toString());
    template = template.replace("<%vk_ic_length%>", verificationKey.A.length.toString());
    let vi = "";
    for (let i=0; i<verificationKey.A.length; i++) {
        if (vi != "") vi = vi + "        ";
        vi = vi + `vk.IC[${i}] = Pairing.G1Point(${verificationKey.A[i][0].toString()},`+
                                                `${verificationKey.A[i][1].toString()});\n`;
    }
    template = template.replace("<%vk_ic_pts%>", vi);

    return template
}

const main = async function() {
    const parser = new argparse.ArgumentParser({
        description: 'Generate a zk-SNARK verifier in Solidity'
    })

    parser.addArgument(
        ['-i', '--input'],
        { 
            help: 'the .json verifying key source file',
            required: true
        }
    )

    parser.addArgument(
        ['-o', '--output'],
        { 
            help: 'the .sol output file for the verifier',
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
    const output = args.output
    const input = args.input
    const overwrite = args.overwrite != null || args.overwrite != false

    if (!existsSync(input)) {
        console.error(input, 'does not exist')
        return
    }

    // Run the trusted setup process if the output file doesn't exist, or the
    // user wants to overwrite them
    if (overwrite || !existsSync(output)) {
        const verifyingKey = unstringifyBigInts(JSON.parse(readFileSync(input, "utf8")));
        let template = readFileSync("./templates/verifier.sol", "utf-8");
        const code = generateVerifier(verifyingKey, template);
        writeFileSync(output, code, "utf-8");
    }
}

main()
