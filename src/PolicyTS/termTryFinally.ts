// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Try...Finally Term

Reduce term and catch exceptions

## Syntax
    
    {
        "$policy": "TryFinally",
        "term": _term_,
        "finally": _term_
    }

## Example
    
    {
        $policy": "TryFinally",
        "term": 1,
        "finally": "result if exception"
    }

    try 
        1
    finally
        "result if exception"

## Schema

    "TryFinallyTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "TryFinally"
            },
            "term": { "$ref": "#/$defs/Term" },
            "finally": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "term", "finally" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm, stepsMinusOne } from "./term";
import { isRule, RuleTerm } from "./termMatch";
import { isException } from "./termTryWith";

export type TryFinallyTerm = {
    $policy: "TryFinally",
    term: any,
    finally: any
}

export function isTryFinally(term: any): term is TryFinallyTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "TryFinally") &&
        ("term" in term) &&
        ("finally" in term) &&
        (Object.keys(term).length === 3);
}


/*
## Rewrite Rules
Evaluate term.
if blocked, return blocked TryFinally
Evaluate finally
if blocked, return blocked TryFinally
if result of finally is exception, return that exception
else return result of term
*/
export function rewriteTryFinally(m: Machine): Machine {
    if (!(isTryFinally(m.term))) { throw "expected TryFinallyTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        const resultOfFinally = rewriteTerm(m.copyWith({ term: m.term.finally, steps: steps }));
        Object.assign(blockedTerm, { term: resultOfTerm.term });
        steps = resultOfTerm.steps;
        if (resultOfFinally.blocked) {
            return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
        } else {
            steps = stepsMinusOne(steps);
            if (isException(resultOfFinally.term)) {
                return m.copyWith({ term: resultOfFinally.term, steps: steps });
            }
        }
        return m.copyWith({ term: resultOfTerm.term, steps: steps });
    }
}
