"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsPattern = isAsPattern;
exports.rewriteAsPattern = rewriteAsPattern;
exports.matchAsPattern = matchAsPattern;
const term_1 = require("./term");
function isAsPattern(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "AsPattern") &&
        ("term" in term) &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules

*/
function rewriteAsPattern(m) {
    if (!(isAsPattern(m.term))) {
        throw "expected AsPatternTerm";
    }
    ;
    throw "as pattern not executable";
}
/*
## Match Rules
*/
function matchAsPattern(m, pattern, value) {
    if (!(isAsPattern(pattern))) {
        throw "expected AsPattern";
    }
    ;
    const matchResult = (0, term_1.matchTerm)(m, pattern.term, value);
    if (matchResult === false) {
        return false;
    }
    else {
        let r = {};
        if (pattern.name !== "_") {
            r[pattern.name] = value;
        }
        return r;
    }
}
//# sourceMappingURL=termAsPattern.js.map