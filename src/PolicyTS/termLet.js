"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPatternBinding = isPatternBinding;
exports.isLet = isLet;
exports.rewriteLet = rewriteLet;
exports.matchLet = matchLet;
const term_1 = require("./term");
function isPatternBinding(pb) {
    return (pb !== undefined) &&
        (typeof pb === "object") &&
        ("$policy" in pb) && (pb.$policy === "PatternBinding") &&
        ("pattern" in pb) &&
        ("term" in pb) &&
        (Object.keys(pb).length === 3);
}
function isLet(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Let") &&
        ("binding" in term) && (isPatternBinding(term.binding)) &&
        ("in" in term) &&
        (Object.keys(term).length === 3);
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
    const resultOfBindingTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.binding.term }));
    if (resultOfBindingTerm.blocked) {
        // to do: return new LetTerm with blocked term
        return m;
    }
    else {
        const matchOfBinding = (0, term_1.matchTerm)(m, m.term.binding.pattern, resultOfBindingTerm.term);
        if (matchOfBinding) {
            const nextBindings = Object.assign({}, m.bindings, matchOfBinding);
            const resultOfIn = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.in, bindings: nextBindings }));
            return m.copyWith({ term: resultOfIn.term });
        }
        else {
            throw "binding failed";
        }
    }
}
/*
## Match Rules
*/
function matchLet(pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termLet.js.map