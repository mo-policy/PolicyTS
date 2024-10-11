"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLet = isLet;
exports.rewriteLet = rewriteLet;
exports.matchLet = matchLet;
const term_1 = require("./term");
function isLet(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Let") &&
        ("pattern" in term) &&
        ("term" in term) &&
        ("in" in term) &&
        (Object.keys(term).length === 4);
}
/*
## Rewrite Rules

The term of the binding is evaluated bound to the associated
pattern. See pattern matching. If the binding term blocks, then the
let term reduces to another let term with the results of any unblocked
binding term.

*/
function rewriteLet(m) {
    if (!(isLet(m.term))) {
        throw "expected Let";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfBindingTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfBindingTerm.term });
    steps = resultOfBindingTerm.steps;
    if (resultOfBindingTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        const matchOfBinding = (0, term_1.matchTerm)(m, m.term.pattern, resultOfBindingTerm.term);
        if (matchOfBinding) {
            const nextBindings = Object.assign({}, m.bindings, matchOfBinding);
            const resultOfIn = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.in, bindings: nextBindings, steps: steps }));
            if (!resultOfIn.blocked) {
                steps = (0, term_1.stepsMinusOne)(resultOfIn.steps);
            }
            return m.copyWith({ term: resultOfIn.term, blocked: resultOfIn.blocked, steps: steps });
        }
        else {
            throw "binding failed";
        }
    }
}
/*
## Match Rules
*/
function matchLet(m, pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termLet.js.map