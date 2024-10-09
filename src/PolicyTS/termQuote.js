"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuote = isQuote;
exports.isConstant = isConstant;
exports.rewriteQuote = rewriteQuote;
exports.rewriteConstant = rewriteConstant;
exports.matchQuote = matchQuote;
exports.matchConstant = matchConstant;
const term_1 = require("./term");
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
function matchQuote(m, pattern, value) {
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
function matchConstant(m, pattern, value) {
    if (pattern === null) {
        if (value === null) {
            return {};
        }
    }
    else if (Array.isArray(pattern)) {
        if (Array.isArray(value) && pattern.length === value.length) {
            let allMatched = true;
            let arrayResult = {};
            for (let i = 0; i < pattern.length; i++) {
                if (allMatched) {
                    const itemResult = (0, term_1.matchTerm)(m, pattern[i], value[i]);
                    if (itemResult === false) {
                        allMatched = false;
                    }
                    else {
                        arrayResult = Object.assign(arrayResult, itemResult);
                    }
                }
                else {
                    break;
                }
            }
            if (allMatched) {
                return arrayResult;
            }
        }
    }
    else if (typeof pattern === "object") {
        let allMatched = true;
        let mapResult = {};
        for (const p in pattern) {
            if (p in value) {
                if (allMatched) {
                    const elementResult = (0, term_1.matchTerm)(m, pattern[p], value[p]);
                    if (elementResult === false) {
                        allMatched = false;
                    }
                    else {
                        mapResult = Object.assign(mapResult, elementResult);
                    }
                }
                else {
                    break;
                }
            }
        }
        if (allMatched) {
            return mapResult;
        }
    }
    else {
        if (m.compare(pattern, value) === 0) {
            return {};
        }
    }
    return false;
}
//# sourceMappingURL=termQuote.js.map