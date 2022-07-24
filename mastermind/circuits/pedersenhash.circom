include "../../node_modules/circomlib/circuits/pedersen.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template EncodePedersenPoint() {
    signal input x;
    signal input y;
    signal output out;

    var n = 256;

    // convert x to bits
    component xBits = Num2Bits(n);
    xBits.in <-- x;

    // convert y to bits
    component yBits = Num2Bits(n);
    yBits.in <-- y;

    // insert the first 248 bits of y
    component resultNum = Bits2Num(n);
    for (var i=0; i<256-8; i++) {
        resultNum.in[i] <-- yBits.out[i];
    }

    // insert the last 8 bits of x
    for (var j=256-8; j<n; j++) {
        resultNum.in[j] <-- xBits.out[j];
    }

    out <-- resultNum.out;
}

template PedersenHashSingle() {
    signal input in;
    signal output out[2];
    signal output encoded;

    component n2b = Num2Bits(256);
    n2b.in <== in;

    component pedersen = Pedersen(256);
    for (var m=0; m<256; m++) {
        pedersen.in[m] <-- n2b.out[m];
    }
    
    out[0] <== pedersen.out[0];
    out[1] <== pedersen.out[1];

    component encoder = EncodePedersenPoint();
    encoder.x <== pedersen.out[0];
    encoder.y <== pedersen.out[1];
    encoded <== encoder.out;
}
