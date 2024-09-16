"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTerm = rewriteTerm;
exports.matchTerm = matchTerm;
/**
 * The top level rewrite function for all terms.
 * @param m     The input machine.
 * @returns     The output machine.
 */
function rewriteTerm(m) {
    if (m.blocked) {
        return m;
    }
    else {
        if (Array.isArray(m.term)) {
            // rewrite the elements of machine.term
            const nextTerm = [];
            for (let i = 0; i < m.term.length; i++) {
                const nextMachine = rewriteTerm(m.copyWith({ term: m.term[i] }));
                nextTerm[i] = nextMachine.term;
            }
            return m.copyWith({ term: nextTerm });
        }
        else {
            const f = m.getRewriteFunction();
            if ((m.term !== null) && (typeof m.term === "object")) {
                if ("$policy" in m.term) {
                    return f(m);
                }
                else {
                    // rewrite the properties of machine.term
                    const nextTerm = {};
                    for (let p in m.term) {
                        let nextMachine = rewriteTerm(m.copyWith({ term: m.term[p] }));
                        nextTerm[p] = nextMachine.term;
                    }
                    return m.copyWith({ term: nextTerm });
                }
            }
            else {
                return f(m);
            }
        }
    }
}
function matchTerm(m, pattern, value) {
    const f = m.getMatchFunction(pattern);
    return f(pattern, value);
}
//# sourceMappingURL=term.js.map