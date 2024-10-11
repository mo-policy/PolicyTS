"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRewrite = isRewrite;
exports.rewriteRewrite = rewriteRewrite;
const term_1 = require("./term");
function isRewrite(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Rewrite") &&
        ("code" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

Rewrite term.code
if blocked, return blocked rewrite
Rewrite result of term.code

*/
function rewriteRewrite(m) {
    if (!(isRewrite(m.term))) {
        throw "expected RewriteTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfCode = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.code }));
    Object.assign(blockedTerm, { code: resultOfCode.term });
    steps = resultOfCode.steps;
    if (resultOfCode.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    const resultOfEval = (0, term_1.rewriteTerm)(m.copyWith({ term: resultOfCode.term, steps: steps }));
    if (!(resultOfEval.blocked)) {
        steps = (0, term_1.stepsMinusOne)(resultOfEval.steps);
    }
    return m.copyWith({ term: resultOfEval.term, blocked: resultOfEval.blocked, steps: steps });
}
//# sourceMappingURL=termRewrite.js.map