//@ts-ignore TS7016
import * as argparse from 'argparse'
//@ts-ignore TS7016
import {unstringifyBigInts} from './utils'
//@ts-ignore TS7016
import {existsSync, readFileSync, writeFileSync} from 'fs'


const p256 = (n) => {
    let nstr = n.toString(16);
    while (nstr.length < 64) nstr = "0"+nstr;
    nstr = `"0x${nstr}"`;
    return nstr;
}

const main = async function() {
    const parser = new argparse.ArgumentParser({
        description: 'Generate function call parameters for the verifying contract'
    })

    parser.addArgument(
        ['-p', '--proof'],
        { 
            help: 'the .json input file of the proof',
            required: true
        }
    )

    parser.addArgument(
        ['-s', '--signals'],
        { 
            help: 'the .json input file of the public signals',
            required: true
        }
    )

    const args = parser.parseArgs()
    const pub = unstringifyBigInts(JSON.parse(readFileSync(args.signals, "utf8")));
    const proof = unstringifyBigInts(JSON.parse(readFileSync(args.proof, "utf8")));

    let inputs = "";
    for (let i=0; i<pub.length; i++) {
        if (inputs != "") inputs = inputs + ",";
        inputs = inputs + p256(pub[i]);
    }

    const S = `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
        `[${p256(proof.pi_ap[0])}, ${p256(proof.pi_ap[1])}],` +
        `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(proof.pi_b[1][1])}, ${p256(proof.pi_b[1][0])}]],` +
        `[${p256(proof.pi_bp[0])}, ${p256(proof.pi_bp[1])}],` +
        `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
        `[${p256(proof.pi_cp[0])}, ${p256(proof.pi_cp[1])}],` +
        `[${p256(proof.pi_h[0])}, ${p256(proof.pi_h[1])}],` +
        `[${p256(proof.pi_kp[0])}, ${p256(proof.pi_kp[1])}],` +
        `[${inputs}]` ;

    console.log(S);
}

main()
