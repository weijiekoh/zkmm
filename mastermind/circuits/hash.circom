include "../node_modules/circom/circuits/sha256/sha256_2.circom";

template Hash() {
    signal input a;
    signal input b;
    signal output out;

    component hash = Sha256_2();
    hash.a <== a;
    hash.b <== b;

    out <-- hash.out;
}

component main = Hash();
