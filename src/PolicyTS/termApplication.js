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
    // first, evaluate the function term
    const resultOfAppFunction = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.function }));
    if (resultOfAppFunction.blocked) {
        // to do: return blocked application
        return m;
    }
    else {
        if (!((0, termFunction_1.isFunction)(resultOfAppFunction.term))) {
            // to do: return an error
            return m;
        }
        else {
            // second, evaluate the arg term
            const resultOfAppArg = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.arg }));
            if (resultOfAppArg.blocked) {
                // to do: return blocked application
                return m;
            }
            else {
                // third, match the arg to the function pattern, returning an object 
                //        which maps string (names) to Bindings, or false if it fails to match
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
                    const resultOfFunctionTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: resultOfAppFunction.term.term, bindings: bindings }));
                    return (m.copyWith({ term: resultOfFunctionTerm.term }));
                }
                else {
                    throw "binding failed";
                }
            }
        }
    }
}
//# sourceMappingURL=termApplication.js.map