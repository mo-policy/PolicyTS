"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTerm = rewriteTerm;
exports.matchTerm = matchTerm;
const termConstant_1 = require("./termConstant");
const termLet_1 = require("./termLet");
const termLookup_1 = require("./termLookup");
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
        else if ((m.term !== null) && (typeof m.term === "object")) {
            if ("$policy" in m.term) {
                switch (m.term.$policy) {
                    case "Constant": return (0, termConstant_1.rewriteConstant)(m);
                    case "Let": return (0, termLet_1.rewriteLet)(m);
                    case "Lookup": return (0, termLookup_1.rewriteLookup)(m);
                }
                throw "Unexpected term";
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
        else
            return (0, termConstant_1.rewriteConstant)(m);
    }
}
function matchTerm(pattern, value) {
    if ((pattern !== null) && (typeof pattern === "object") && ("$policy" in pattern)) {
        switch (pattern.$policy) {
            case "Constant": return (0, termConstant_1.matchConstant)(pattern, value);
            case "Let": return (0, termLet_1.matchLet)(pattern, value);
            case "Lookup": return (0, termLookup_1.matchLookup)(pattern, value);
        }
        throw "unexpected pattern";
    }
    else {
        return (0, termConstant_1.matchConstant)(pattern, value);
    }
}
//# sourceMappingURL=term.js.map