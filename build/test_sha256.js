"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore TS7016
const snarkjs = require("snarkjs");
//@ts-ignore TS7016
const bigInt = require("big-integer");
//@ts-ignore TS7016
const fs_1 = require("fs");
//@ts-ignore TS2304
const crypto = require('crypto');
const hash_1 = require("./hash");
const main = async function () {
    const num = bigInt(2).pow(50);
    console.log('Hash calculated by JS     :', hash_1.hash(num).toString());
    const { a, b } = hash_1.numToCircomHashInput(num);
    const circuitDef = JSON.parse(fs_1.readFileSync('circuits/hash.json', 'utf8'));
    const circuit = new snarkjs.Circuit(circuitDef);
    const witness = circuit.calculateWitness({ a, b });
    const c = witness[circuit.getSignalIdx('main.out')];
    console.log('Hash calculated by circuit:', c);
};
main();
//# sourceMappingURL=test_sha256.js.map