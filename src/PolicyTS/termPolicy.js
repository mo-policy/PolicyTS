"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPolicy = isPolicy;
exports.rewritePolicy = rewritePolicy;
exports.matchPolicy = matchPolicy;
const term_1 = require("./term");
const termMatch_1 = require("./termMatch");
function isPolicy(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Match") &&
        ("term" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!((0, termMatch_1.isRule)(term.rules[i]))) {
                return false;
            }
        }
    }
    return true;
}
/*
## Rewrite Rules

Add the Policy term to end Machine.policies array.
Reduce Policy.term.

*/
function rewritePolicy(m) {
    if (!(isPolicy(m.term))) {
        throw "expected PolicyTerm";
    }
    ;
    const policies = m.policies.slice();
    policies.push({ machine: m, term: m.term });
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term, policies: policies }));
    return m.copyWith({ term: resultOfTerm.term });
}
/*
## Match Rules


*/
function matchPolicy(pattern, value) {
    if (!(isPolicy(pattern))) {
        throw "expected Policy";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termPolicy.js.map