"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWrappedConstant = isWrappedConstant;
exports.isConstant = isConstant;
exports.rewriteConstant = rewriteConstant;
exports.matchConstant = matchConstant;
function isWrappedConstant(term) {
    return (term !== undefined) &&
        (typeof term === "object") &&
        ("$policy" in term) &&
        ("value" in term) &&
        (Object.entries(term).length === 2) &&
        (term.$policy === "Constant");
}
/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
function isConstant(term) {
    if (term !== undefined) {
        if ((typeof term === "object") && ("$policy" in term)) {
            return isWrappedConstant(term);
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}
/*
## Rewrite Rules

Constant terms are in fully reduced form. The rewrite function is simply a no op.
*/
function rewriteConstant(m) {
    if (!(isConstant(m.term))) {
        throw "expected ConstantTerm";
    }
    ;
    return m;
}
/*
## Match Rules


*/
function matchConstant(pattern, value) {
    return (pattern === value);
}
//# sourceMappingURL=termConstant.js.map