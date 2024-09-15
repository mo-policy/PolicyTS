"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = isFunction;
exports.rewriteFunction = rewriteFunction;
exports.matchFunction = matchFunction;
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
    if (Object.keys(m.bindings).length === 0) {
        return m;
    }
    else {
        // to do: filter closure to only free variables in function.
        const cb = Object.assign({}, m.bindings);
        const f = Object.assign({}, m.term, { closure: cb });
        return m.copyWith({ term: f });
    }
}
/*
## Match Rules
*/
function matchFunction(pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termFunction.js.map