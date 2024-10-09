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
    // let rec f = (fun x -> if "x<4" then f "x+1" else 4) in f 1
    // m.term is:
    /*
        LetRec
        pattern: f
        term: fun x -> if "x<4" then f "x+1" else 4
        in: f 1
    */
    // result should be:
    // let f = fix (fun f -> fun x -> if "x<4" then f "x+1" else 4) in f 1
    /*
        Let
        pattern: f
        term: fix (fun f -> fun x -> if "x<4" then f "x+1" else 4)
        in: f 1
    */
    // match gives us:
    // f, fun x -> if "x<4" then f "x+1" else 4
    // name, match[name]
    // want:
    // let name = fix (fun name -> match[name]) in term.in
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
    const letMachine = m.copyWith({ term: letTerm });
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