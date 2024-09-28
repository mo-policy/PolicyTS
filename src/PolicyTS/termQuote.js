"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuote = isQuote;
exports.isConstant = isConstant;
exports.rewriteQuote = rewriteQuote;
exports.rewriteConstant = rewriteConstant;
exports.matchQuote = matchQuote;
exports.matchConstant = matchConstant;
function isQuote(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Quote") &&
        ("quote" in term) &&
        (Object.keys(term).length === 2);
}
/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
function isConstant(term) {
    if (isQuote(term)) {
        return true;
    }
    else {
        return !((term !== null) && (typeof term === "object") && ("$policy" in term));
    }
}
/*
## Rewrite Rules

Quote terms are in fully reduced form. The rewrite function is simply a no op.
*/
function rewriteQuote(m) {
    if (!(isQuote(m.term))) {
        throw "expected Quote";
    }
    ;
    return m;
}
function rewriteConstant(m) {
    if (!(isConstant(m.term))) {
        throw "expected Constant";
    }
    ;
    return m;
}
/*
## Match Rules


*/
function matchQuote(pattern, value) {
    if (isQuote(pattern)) {
        if (pattern.quote === value) {
            return {};
        }
        else {
            return false;
        }
    }
    return false;
}
function matchConstant(pattern, value) {
    if (pattern === value) {
        return {};
    }
    else {
        return false;
    }
}
//# sourceMappingURL=termQuote.js.map