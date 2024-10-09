"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSequence = isSequence;
exports.rewriteSequence = rewriteSequence;
const term_1 = require("./term");
function isSequence(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Sequence") &&
        (("terms" in term) && Array.isArray(term.terms) && term.terms.length > 0) &&
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
    const resultTerms = [];
    let nextMachine = m;
    for (let i = 0; i < m.term.terms.length; i++) {
        const seqTerm = m.term.terms[i];
        nextMachine = (0, term_1.rewriteTerm)(nextMachine.copyWith({ term: seqTerm }));
        if (nextMachine.term !== null) {
            resultTerms.push(nextMachine.term);
        }
    }
    if (resultTerms.length === 0) {
        resultTerms.push(null);
    }
    if (nextMachine.blocked) {
        const blockedTerm = Object.assign({}, m.term, { terms: resultTerms });
        return nextMachine.copyWith({ term: blockedTerm });
    }
    else {
        return nextMachine.copyWith({ term: resultTerms[resultTerms.length - 1] });
    }
}
//# sourceMappingURL=termSequence.js.map