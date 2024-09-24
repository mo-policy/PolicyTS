"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTryWith = isTryWith;
exports.isException = isException;
exports.rewriteTryWith = rewriteTryWith;
exports.rewriteException = rewriteException;
exports.matchTryWith = matchTryWith;
exports.matchException = matchException;
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
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked";
    }
    else {
        if (isException(resultOfTerm.term)) {
            for (let i = 0; i < m.term.rules.length; i++) {
                const rule = m.term.rules[i];
                const matchResult = (0, term_1.matchTerm)(m, rule.pattern, resultOfTerm.term);
                if (matchResult !== false) {
                    const bindings = Object.assign({}, m.bindings, matchResult);
                    let guardPassed = true;
                    if ("guard" in rule) {
                        const resultOfGuard = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.guard, bindings: bindings }));
                        if (resultOfGuard.blocked) {
                            // to do, return a blocked match term
                            throw "guard blocked";
                        }
                        else if (typeof resultOfGuard.term !== "boolean") {
                            throw "guard not boolean";
                        }
                        else {
                            guardPassed = resultOfGuard.term;
                        }
                    }
                    if (guardPassed) {
                        const resultOfRule = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.term, bindings: bindings }));
                        return m.copyWith({ term: resultOfRule.term });
                    }
                }
            }
        }
        return resultOfTerm;
    }
}
function rewriteException(m) {
    if (!(isException(m.term))) {
        throw "expected ExceptionTerm";
    }
    ;
    return m;
}
/*
## Match Rules


*/
function matchTryWith(pattern, value) {
    if (!(isTryWith(pattern))) {
        throw "expected TryWith";
    }
    ;
    // to do
    return false;
}
function matchException(pattern, value) {
    if (!(isException(pattern))) {
        throw "expected Exception";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termTryWith.js.map