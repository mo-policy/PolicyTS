"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFix = isFix;
exports.rewriteFix = rewriteFix;
exports.matchFix = matchFix;
const term_1 = require("./term");
const termFunction_1 = require("./termFunction");
function isFix(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Fix") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

*/
function rewriteFix(m) {
    if (!(isFix(m.term))) {
        throw "expected Fix";
    }
    ;
    if ((0, termFunction_1.isFunction)(m.term.term)) {
        const f = m.term.term;
        const matchResult = (0, term_1.matchTerm)(m, f.pattern, f.term);
        if (!matchResult) {
            throw "match failed";
        }
        let fixBindings = {};
        for (const p in matchResult) {
            fixBindings[p] = {
                $policy: "Fix",
                term: {
                    $policy: "Function",
                    pattern: { $policy: "Lookup", name: p },
                    term: matchResult[p]
                }
            };
        }
        const bindings = Object.assign({}, m.bindings, fixBindings);
        const mFix = m.copyWith({ term: f.term, bindings: bindings });
        return (0, term_1.rewriteTerm)(mFix);
    }
    else {
        const resultOfFixTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
        const nextFix = {
            $policy: "Fix",
            term: resultOfFixTerm.term
        };
        return m.copyWith({ term: nextFix });
    }
}
/*
## Match Rules
*/
function matchFix(pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termFix.js.map