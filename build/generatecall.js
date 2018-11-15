"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const argparse = require("argparse");
//@ts-ignore TS7016
const utils_1 = require("./utils");
//@ts-ignore TS7016
const fs_1 = require("fs");
const p256 = (n) => {
    let nstr = n.toString(16);
    while (nstr.length < 64)
        nstr = "0" + nstr;
    nstr = `"0x${nstr}"`;
    return nstr;
};
const main = async function () {
    const parser = new argparse.ArgumentParser({
        description: 'Generate function call parameters for the verifying contract'
    });
    parser.addArgument(['-p', '--proof'], {
        help: 'the .json input file of the proof',
        required: true
    });
    parser.addArgument(['-s', '--signals'], {
        help: 'the .json input file of the public signals',
        required: true
    });
    const args = parser.parseArgs();
    const pub = utils_1.unstringifyBigInts(JSON.parse(fs_1.readFileSync(args.signals, "utf8")));
    const proof = utils_1.unstringifyBigInts(JSON.parse(fs_1.readFileSync(args.proof, "utf8")));
    let inputs = "";
    for (let i = 0; i < pub.length; i++) {
        if (inputs != "")
            inputs = inputs + ",";
        inputs = inputs + p256(pub[i]);
    }
    const S = `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
        `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(proof.pi_b[1][1])}, ${p256(proof.pi_b[1][0])}]],` +
        `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
        `[${inputs}]`;
    console.log(S);
};
main();
//# sourceMappingURL=generatecall.js.map