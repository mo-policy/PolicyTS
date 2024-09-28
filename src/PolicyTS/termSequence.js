"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSequence = isSequence;
exports.rewriteSequence = rewriteSequence;
exports.matchSequence = matchSequence;
const term_1 = require("./term");
function isSequence(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Sequence") &&
        (("terms" in term) && Array.isArray(term.terms)) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

Evaluate Sequence.terms in order.
if any block, return blocked SequenceTerm
otherwise, return result of last term.

*/
function rewriteSequence(m) {
    if (!(isSequence(m.term))) {
        throw "expected SequenceTerm";
    }
    ;
    if (m.term.terms.length === 0) {
        throw "sequence with no terms";
    }
    const resultTerms = m.term.terms.splice(0);
    let nextMachine = m;
    for (let i = 0; i < resultTerms.length; i++) {
        const seqTerm = resultTerms[i];
        nextMachine = (0, term_1.rewriteTerm)(nextMachine.copyWith({ term: seqTerm }));
        resultTerms[i] = nextMachine.term;
    }
    if (nextMachine.blocked) {
        const blockedTerm = Object.assign({}, m.term, { terms: resultTerms });
        return nextMachine.copyWith({ term: blockedTerm });
    }
    else {
        return nextMachine.copyWith({ term: resultTerms[resultTerms.length - 1] });
    }
}
/*
## Match Rules
*/
function matchSequence(pattern, value) {
    if (!(isSequence(pattern))) {
        throw "expected Sequence";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termSequence.js.map