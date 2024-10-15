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
    let anyBlocked = false;
    let steps = m.steps;
    const resultTerms = [];
    let nm = m;
    for (let i = 0; i < m.term.terms.length; i++) {
        const seqTerm = m.term.terms[i];
        nm = (0, term_1.rewriteTerm)(nm.copyWith({ term: seqTerm, steps: steps }));
        anyBlocked = anyBlocked || nm.blocked;
        resultTerms.push(nm.term);
    }
    if (anyBlocked) {
        const blockedTerm = Object.assign({}, m.term, { terms: resultTerms });
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        steps = (0, term_1.stepsMinusOne)(steps);
        return m.copyWith({ term: resultTerms[resultTerms.length - 1], steps: steps });
    }
}
//# sourceMappingURL=termSequence.js.map