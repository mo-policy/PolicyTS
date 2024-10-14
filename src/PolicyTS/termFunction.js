"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = isFunction;
exports.freenames = freenames;
exports.rewriteFunction = rewriteFunction;
exports.matchFunction = matchFunction;
const term_1 = require("./term");
const termLet_1 = require("./termLet");
const termLookup_1 = require("./termLookup");
function isFunction(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Function") &&
        ("pattern" in term) &&
        ("term" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        }
        else if (kl === 4) {
            return ("closure" in term);
        }
    }
    return false;
}
function freenames(bound, fn, term) {
    let nfn = fn;
    let nb = bound;
    if (term !== null) {
        if (Array.isArray(term)) {
            for (let i = 0; i < term.length; i++) {
                nfn = freenames(nb, nfn, term[i]);
            }
        }
        else if (typeof term === "object") {
            if ((0, termLookup_1.isLookup)(term)) {
                if (!(term.name in bound)) {
                    nfn = Object.assign({}, nfn);
                    nfn[term.name] = null;
                }
            }
            else if ((0, termLet_1.isLet)(term)) {
                nfn = freenames(nb, nfn, term.term); // get freenames of let.term
                nb = freenames(nb, nb, term.pattern); // get names (as bound) of let.pattern
                nfn = freenames(nb, nfn, term.in); // get freenames of let.in
            }
            else if (isFunction(term)) {
                nb = freenames(nb, nb, term.pattern); // get names (as bound) of fun.pattern
                nfn = freenames(nb, nfn, term.term); // get freenames of fun.term
            }
            else {
                for (const p in term) {
                    nfn = freenames(nb, nfn, term[p]);
                }
            }
        }
    }
    return nfn;
}
/*
## Rewrite Rules

Function terms reduce to a function value with any associated closure bindings.
Function bindings block if any of the closure bindings are blocked.

*/
function rewriteFunction(m) {
    if (!(isFunction(m.term))) {
        throw "expected Function";
    }
    ;
    if (("closure" in m.term) || (Object.keys(m.bindings).length === 0)) {
        return m;
    }
    else {
        const fn = freenames({}, {}, m.term);
        const cb = {};
        for (const p in fn) {
            if (p in m.bindings) {
                cb[p] = m.bindings[p];
            }
        }
        const f = Object.assign({}, m.term, { closure: cb });
        const steps = (0, term_1.stepsMinusOne)(m.steps);
        return m.copyWith({ term: f, steps: steps });
    }
}
/*
## Match Rules
*/
function matchFunction(m, pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termFunction.js.map