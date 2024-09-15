"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWrappedConstant = isWrappedConstant;
exports.isConstant = isConstant;
exports.rewriteConstant = rewriteConstant;
exports.matchConstant = matchConstant;
function isWrappedConstant(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Constant") &&
        ("value" in term) &&
        (Object.keys(term).length === 2);
}
/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
function isConstant(term) {
    if (isWrappedConstant(term)) {
        return true;
    }
    else {
        return !((term !== null) && (typeof term === "object") && ("$policy" in term));
    }
}
/*
## Rewrite Rules

Constant terms are in fully reduced form. The rewrite function is simply a no op.
*/
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
function matchConstant(pattern, value) {
    if (isWrappedConstant(pattern)) {
        if (pattern.value === value) {
            return {};
        }
        else {
            return false;
        }
    }
    else {
        if (pattern === value) {
            return {};
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=termConstant.js.map