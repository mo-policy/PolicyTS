"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEval = isEval;
exports.rewriteEval = rewriteEval;
exports.matchEval = matchEval;
const term_1 = require("./term");
function isEval(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Eval") &&
        ("code" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

Rewrite term.code
if blocked, return blocked eval
Rewrite result of term.code

*/
function rewriteEval(m) {
    if (!(isEval(m.term))) {
        throw "expected EvalTerm";
    }
    ;
    const resultOfCode = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.code }));
    if (resultOfCode.blocked) {
        throw "blocked";
    }
    const resultOfEval = (0, term_1.rewriteTerm)(m.copyWith({ term: resultOfCode.term }));
    return m.copyWith({ term: resultOfEval.term });
}
/*
## Match Rules


*/
function matchEval(pattern, value) {
    if (!(isEval(pattern))) {
        throw "expected Eval";
    }
    ;
    // todo
    return false;
}
//# sourceMappingURL=termEval.js.map