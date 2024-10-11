"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLetRec = isLetRec;
exports.rewriteLetRec = rewriteLetRec;
exports.matchLetRec = matchLetRec;
const term_1 = require("./term");
function isLetRec(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LetRec") &&
        ("pattern" in term) &&
        ("term" in term) &&
        ("in" in term) &&
        (Object.keys(term).length === 4);
}
/*
## Rewrite Rules

*/
function rewriteLetRec(m) {
    if (!(isLetRec(m.term))) {
        throw "expected LetRec";
    }
    ;
    const matchResult = (0, term_1.matchTerm)(m, m.term.pattern, m.term.term);
    if (!matchResult) {
        throw "match failed";
    }
    if (Object.keys(matchResult).length !== 1) {
        // to do: investigate support for any pattern and term.
        throw "LetRec excpets only one name right now";
    }
    const name = Object.keys(matchResult)[0];
    const letTerm = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: name },
        term: {
            $policy: "Fix",
            term: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: name },
                term: matchResult[name]
            }
        },
        in: m.term.in
    };
    const steps = (0, term_1.stepsMinusOne)(m.steps);
    const letMachine = m.copyWith({ term: letTerm, steps: steps });
    return (0, term_1.rewriteTerm)(letMachine);
}
/*
## Match Rules
*/
function matchLetRec(m, pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termLetRec.js.map