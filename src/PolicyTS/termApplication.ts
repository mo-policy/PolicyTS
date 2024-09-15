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
import { rewriteTerm, matchTerm, MatchResult } from "./term"
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
    // first, evaluate the function term
    const resultOfAppFunction = rewriteTerm(m.copyWith({ term: m.term.function }));
    if (resultOfAppFunction.blocked) {
        // to do: return blocked application
        return m;
    } else {
        if (!(isFunction(resultOfAppFunction.term))) {
            // to do: return an error
            return m;
        } else {
            // second, evaluate the arg term
            const resultOfAppArg = rewriteTerm(m.copyWith({ term: m.term.arg }));
            if (resultOfAppArg.blocked) {
                // to do: return blocked application
                return m;
            } else {
                // third, match the arg to the function pattern, returning an object 
                //        which maps string (names) to Bindings, or false if it fails to match
                const matchResult = matchTerm(resultOfAppFunction.term.pattern, resultOfAppArg.term);
                if (matchResult) {
                    // fourth, assemble the bindings for use inside the term of the function
                    //         the bindings should be, the bindings of the function's closure
                    //         and the bindings which matched the function pattern to the arg
                    let bindings: { readonly [k: string]: any } = {};
                    if ("closure" in resultOfAppFunction.term) {
                        bindings = Object.assign(bindings, resultOfAppFunction.term.closure);
                    }
                    bindings = Object.assign(bindings, matchResult);
                    const resultOfFunctionTerm = rewriteTerm(m.copyWith({ term: resultOfAppFunction.term.term, bindings: bindings }));
                    return (m.copyWith({ term: resultOfFunctionTerm.term }));
                } else {
                    throw "binding failed"
                }
            }
        }
    }
}


/*
## Match Rules
*/
export function matchApplication(pattern: any, value: any): MatchResult {
    // to do
    return false;
}