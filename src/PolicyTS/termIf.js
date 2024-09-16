"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIf = isIf;
exports.rewriteIf = rewriteIf;
exports.matchIf = matchIf;
const term_1 = require("./term");
function isIf(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "If") &&
        ("condition" in term) &&
        ("then" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        }
        else if (kl === 4) {
            return ("else" in term);
        }
    }
    return false;
}
/*
## Rewrite Rules

First the condition is reduced. If it blocks a new If term is returned with
the reduced portion of the condition. If it does not block, the result
must be either true or false. If true, the result of reducing the 'then' is returned.
If false, then if there is an 'else', that is reduced and returned, otherwise
the value null is returned.
*/
function rewriteIf(m) {
    if (!(isIf(m.term))) {
        throw "expected IfTerm";
    }
    ;
    const resultOfCondition = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.condition }));
    if (resultOfCondition.blocked) {
        // to do, return new IfTerm
        throw "condition blocked";
    }
    else {
        if (typeof resultOfCondition.term === "boolean") {
            if (resultOfCondition.term) {
                return (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.then }));
            }
            else {
                if ("else" in m.term) {
                    return (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.else }));
                }
                else {
                    return m.copyWith({ term: null });
                }
            }
        }
        else {
            throw "condition not boolean";
        }
    }
}
/*
## Match Rules
*/
function matchIf(pattern, value) {
    // to do
    return false;
}
//# sourceMappingURL=termIf.js.map