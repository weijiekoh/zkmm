/*include "../node_modules/circom/circuits/sha256/sha256_2.circom";*/

template Main() {
    // Public inputs
    signal input pubGuessA;
    signal input pubGuessB;
    signal input pubGuessC;
    signal input pubGuessD;
    signal input pubNumBlacks;
    signal input pubNumWhites;
    signal input pubSolnHash;
    signal input pubSalt;

    // Private inputs: the solution to the puzzle
    signal private input privSolnA;
    signal private input privSolnB;
    signal private input privSolnC;
    signal private input privSolnD;

    // Output
    signal output solnHashOut;

    var nb = 0;
    var nw = 0;

    var guess = [
        pubGuessA,
        pubGuessB,
        pubGuessC,
        pubGuessD
    ];

    var soln = [
        privSolnA,
        privSolnB,
        privSolnC,
        privSolnD
    ];

    // Count black pegs
    for (var i=0; i<4; i++) {
        if (guess[i] == soln[i]) {
            nb += 1;
            // Set matching pegs to 0
            guess[i] = 0;
            soln[i] = 0;
        }
    }
    // Create a constraint around the number of black pegs
    signal output correctNumBlacks;
    correctNumBlacks <-- nb / pubNumBlacks;
    correctNumBlacks === 1;

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

    // Create a constraint around the number of white pegs
    signal output correctNumWhites;
    correctNumWhites <-- nw / pubNumWhites;
    correctNumWhites === 1;


    // Verify that the hash of the private solution matches pubSolnHash
    // Enforce a constraint that the publicly declared solution hash matches the private solution witness

    // TODO: add salt and then hash
    // salt should not be so big that the sum will overflow
    var hashInputAB = privSolnA * 10 + privSolnB;
    var hashInputCD = privSolnC * 10 + privSolnD;

    /*component hash = Sha256_2();*/
    /*hash.a <== hashInputAB;*/
    /*hash.b <== hashInputCD;*/

    /*pubSolnHash === hash.out;*/
    /*solnHashOut <-- hash.out;*/
    solnHashOut <-- 0;
}

component main = Main();
