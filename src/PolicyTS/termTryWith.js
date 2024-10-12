"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTryWith = isTryWith;
exports.isException = isException;
exports.rewriteTryWith = rewriteTryWith;
exports.rewriteException = rewriteException;
const term_1 = require("./term");
const termMatch_1 = require("./termMatch");
function isTryWith(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "TryWith") &&
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
function isException(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Exception") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules
Evaluate term.
if blocked, return blocked TryWith
If result of term is Exception,
    lookup for matching rule in term.Rules
    If no rules match, return with Exception
else
    return result of term
*/
function rewriteTryWith(m) {
    if (!(isTryWith(m.term))) {
        throw "expected TryWithTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const tries = m.tries.slice();
    tries.push({ machine: m, term: m.term });
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term, tries: tries }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        steps = (0, term_1.stepsMinusOne)(resultOfTerm.steps);
        return m.copyWith({ term: resultOfTerm.term });
    }
}
function rewriteException(m) {
    if (!(isException(m.term))) {
        throw "expected ExceptionTerm";
    }
    ;
    return m;
}
//# sourceMappingURL=termTryWith.js.map