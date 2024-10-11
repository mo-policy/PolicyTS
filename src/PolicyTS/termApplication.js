"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApplication = isApplication;
exports.rewriteApplication = rewriteApplication;
const term_1 = require("./term");
const termFunction_1 = require("./termFunction");
function isApplication(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Application") &&
        ("function" in term) &&
        ("arg" in term) &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules

The 'function' is reduced first and must evaluate to a function value. If not, the
application term is blocked and the result is an application term with
the value of the reduced 'function'. Then the 'arg' is reduced. It too might block
which results in an application term with the blocked value of 'arg'. If both
the 'function' and 'arg' terms reduce without blocking and
the 'function' is a function value, then the 'term' of the 'function' is reduced with a
context of any closure bindings and the bindings from binding with the 'function', 'pattern'.
If the binding doesn't work, then the application term is also blocked.

*/
function rewriteApplication(m) {
    if (!(isApplication(m.term))) {
        throw "expected ApplicationTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    // first, evaluate the function term
    const resultOfAppFunction = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.function }));
    Object.assign(blockedTerm, { function: resultOfAppFunction.term });
    steps = resultOfAppFunction.steps;
    if (resultOfAppFunction.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        if (!((0, termFunction_1.isFunction)(resultOfAppFunction.term))) {
            throw "value is not a function";
        }
        else {
            // second, evaluate the arg term
            const resultOfAppArg = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.arg, steps: steps }));
            Object.assign(blockedTerm, { arg: resultOfAppArg.term });
            steps = resultOfAppArg.steps;
            if (resultOfAppArg.blocked) {
                return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
            }
            else {
                // third, match the arg to the function pattern, returning an object
                //        which maps string (names) to Bindings, or false if it fails to match
                // to do: consider matching using up steps
                const matchResult = (0, term_1.matchTerm)(m, resultOfAppFunction.term.pattern, resultOfAppArg.term);
                if (matchResult) {
                    // fourth, assemble the bindings for use inside the term of the function
                    //         the bindings should be, the bindings of the function's closure
                    //         and the bindings which matched the function pattern to the arg
                    let bindings = {};
                    if ("closure" in resultOfAppFunction.term) {
                        bindings = Object.assign(bindings, resultOfAppFunction.term.closure);
                    }
                    bindings = Object.assign(bindings, matchResult);
                    const resultOfFunctionTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: resultOfAppFunction.term.term, bindings: bindings, steps: steps }));
                    steps = resultOfFunctionTerm.steps;
                    if (!resultOfFunctionTerm.blocked) {
                        steps = (0, term_1.stepsMinusOne)(steps);
                    }
                    return m.copyWith({ term: resultOfFunctionTerm.term, blocked: resultOfFunctionTerm.blocked, steps: steps });
                }
                else {
                    throw "binding failed";
                }
            }
        }
    }
}
//# sourceMappingURL=termApplication.js.map