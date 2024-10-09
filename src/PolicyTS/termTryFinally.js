"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTryFinally = isTryFinally;
exports.rewriteTryFinally = rewriteTryFinally;
const term_1 = require("./term");
const termTryWith_1 = require("./termTryWith");
function isTryFinally(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "TryFinally") &&
        ("term" in term) &&
        ("finally" in term) &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules
Evaluate term.
if blocked, return blocked TryFinally
Evaluate finally
if blocked, return blocked TryFinally
if result of finally is exception, return that exception
else return result of term
*/
function rewriteTryFinally(m) {
    if (!(isTryFinally(m.term))) {
        throw "expected TryFinallyTerm";
    }
    ;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked";
    }
    else {
        const resultOfFinally = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.finally }));
        if (resultOfFinally.blocked) {
            throw "blocked";
        }
        else {
            if ((0, termTryWith_1.isException)(resultOfFinally.term)) {
                return m.copyWith({ term: resultOfFinally.term });
            }
        }
        return m.copyWith({ term: resultOfTerm.term });
    }
}
//# sourceMappingURL=termTryFinally.js.map