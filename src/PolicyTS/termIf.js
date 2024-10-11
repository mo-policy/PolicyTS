"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIf = isIf;
exports.rewriteIf = rewriteIf;
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
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfCondition = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.condition }));
    Object.assign(blockedTerm, { condition: resultOfCondition.term });
    steps = resultOfCondition.steps;
    if (resultOfCondition.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        if (typeof resultOfCondition.term === "boolean") {
            let ifResult = m;
            if (resultOfCondition.term) {
                ifResult = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.then, steps: steps }));
            }
            else {
                if ("else" in m.term) {
                    ifResult = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.else, steps: steps }));
                }
                else {
                    ifResult = (0, term_1.rewriteTerm)(m.copyWith({ term: null, steps: steps }));
                }
            }
            steps = (0, term_1.stepsMinusOne)(ifResult.steps);
            return m.copyWith({ term: ifResult.term, blocked: ifResult.blocked, steps: steps });
        }
        else {
            throw "condition not boolean";
        }
    }
}
//# sourceMappingURL=termIf.js.map