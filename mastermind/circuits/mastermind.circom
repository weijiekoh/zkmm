include "../../node_modules/circomlib/circuits/comparators.circom";
include "./pedersenhash.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template Main() {
    // Public inputs
    signal input pubGuessA;
    signal input pubGuessB;
    signal input pubGuessC;
    signal input pubGuessD;
    signal input pubNumBlacks;
    signal input pubNumWhites;
    signal input pubSolnHash;

    // Private inputs: the solution to the puzzle
    signal private input privSolnA;
    signal private input privSolnB;
    signal private input privSolnC;
    signal private input privSolnD;

    signal private input privSaltedSoln;

    // Output
    signal output solnHashOut;

    var nb = 0;

    var guess = [pubGuessA, pubGuessB, pubGuessC, pubGuessD];
    var soln =  [privSolnA, privSolnB, privSolnC, privSolnD];

    // Count black pegs
    for (var i=0; i<4; i++) {
        if (guess[i] == soln[i]) {
            nb += 1;
            // Set matching pegs to 0
            guess[i] = 0;
            soln[i] = 0;
        }
    }
    var nw = 0;

    // Count white pegs
    // block scope isn't respected, so k and j have to be declared outside
    var k = 0;
    var j = 0;
    for (j=0; j<4; j++) {
        for (k=0; k<4; k++) {
            // the && operator doesn't work
            if (j != k) {
                if (guess[j] == soln[k]) {
                    if (guess[j] > 0) {
                        nw += 1;
                        // Set matching pegs to 0
                        guess[j] = 0;
                        soln[k] = 0;
                    }
                }
            }
        }
    }

    // Create a constraint around the number of black pegs
    nb * nb === pubNumBlacks * nb;

    // Create a constraint around the number of white pegs
    nw * nw ===  pubNumWhites * nw;

    // Verify that the hash of the private solution matches pubSolnHash
    // via a constraint that the publicly declared solution hash matches the
    // private solution witness

    component pedersen = PedersenHashSingle();
    pedersen.in <== privSaltedSoln;

    solnHashOut <== pedersen.encoded;
    /*pubSolnHash === pedersen.encoded;*/
}

component main = Main();
