// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Application Term

Calls a function with an argument.

## Syntax

    {
        "$policy": "Application",
        "function": _term_,
        "arg": _term_
    }

## Example
    
    {
        "$policy": "Application",
        "function": { "$policy": "Lookup", "name": "f" },
        "arg": 1
    }

    f 1

## Schema

    "ApplicationTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Application"
            },
            "function": { "$ref": "#/$defs/Term" },
            "arg": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "function", "arg" ]
    }

*/

import { Machine } from "./machine"
import { rewriteTerm, matchTerm, stepsMinusOne } from "./term"
import { isFunction } from "./termFunction"

export type ApplicationTerm = {
    $policy: "Application",
    function: any,
    arg: any
}

export function isApplication(term: any): term is ApplicationTerm {
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
export function rewriteApplication(m: Machine): Machine {
    if (!(isApplication(m.term))) { throw "expected ApplicationTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    // first, evaluate the function term
    const resultOfAppFunction = rewriteTerm(m.copyWith({ term: m.term.function }));
    Object.assign(blockedTerm, { function: resultOfAppFunction.term });
    steps = resultOfAppFunction.steps;
    if (resultOfAppFunction.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        if (!(isFunction(resultOfAppFunction.term))) {
            throw "value is not a function"
        } else {
            // second, evaluate the arg term
            const resultOfAppArg = rewriteTerm(m.copyWith({ term: m.term.arg, steps: steps }));
            Object.assign(blockedTerm, { arg: resultOfAppArg.term });
            steps = resultOfAppArg.steps;
            if (resultOfAppArg.blocked) {
                return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
            } else {
                // third, match the arg to the function pattern, returning an object
                //        which maps string (names) to Bindings, or false if it fails to match
                // to do: consider matching using up steps
                const matchResult = matchTerm(m, resultOfAppFunction.term.pattern, resultOfAppArg.term);
                if (!(matchResult === false)) {
                    // fourth, assemble the bindings for use inside the term of the function
                    //         the bindings should be, the bindings of the function's closure
                    //         and the bindings which matched the function pattern to the arg
                    let applyTerm = resultOfAppFunction.term.term;
                    if ("closure" in resultOfAppFunction.term) {
                        // let [ lookup x] = [ closure[x] ] in resultOfAppFunction.term.term
                        const letPatterns: any[] = [];
                        const letTerms: any[] = [];
                        for (const p in resultOfAppFunction.term.closure) {
                            letPatterns.push({ $policy: "Lookup", name: p });
                            letTerms.push(resultOfAppFunction.term.closure[p]);
                        }
                        if (letPatterns.length > 0) {
                            applyTerm = {
                                $policy: "Let",
                                pattern: letPatterns,
                                term: letTerms,
                                in: applyTerm
                            }
                        }
                    }
                    const resultOfFunctionTerm = rewriteTerm(m.copyWith({ term: applyTerm, bindings: matchResult, steps: steps }));
                    steps = resultOfFunctionTerm.steps;
                    if (!resultOfFunctionTerm.blocked) {
                        steps = stepsMinusOne(steps);
                    }
                    return m.copyWith({ term: resultOfFunctionTerm.term, blocked: resultOfFunctionTerm.blocked, steps: steps });
                } else {
                    throw "binding failed"
                }
            }
        }
    }
}
