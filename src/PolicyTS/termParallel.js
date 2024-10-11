"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParallel = isParallel;
exports.rewriteParallel = rewriteParallel;
const term_1 = require("./term");
function isParallel(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Parallel") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

Rewrite Parallel.term
Return result of term, blocked with m.blocked || result.blocked

*/
function rewriteParallel(m) {
    if (!(isParallel(m.term))) {
        throw "expected ParallelTerm";
    }
    ;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    const steps = (0, term_1.stepsMinusOne)(resultOfTerm.steps);
    return m.copyWith({ term: resultOfTerm.term, blocked: resultOfTerm.blocked, steps: steps });
}
//# sourceMappingURL=termParallel.js.map