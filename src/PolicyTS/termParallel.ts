// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Parallel Term

The parallel term executes if previous code has blocked.

## Syntax
    
    {
        "$policy": "Parallel",
        "term": _term_
    }

## Example
    
    [
        { "$policy": "Lookup", name: "x" },
        {
            "$policy": "Parallel",
            "term": { $policy: "Lookup", name: "y" }
        }
    ]

    [ x |, y ] // x is blocked   
   

## Schema

    "ParallelTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Parallel"
            },
            "term": { "$ref": "#/$defs/Term" }
        }
    },
    "required": [ "$policy", "term" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, stepsMinusOne } from "./term";

export type ParallelTerm = {
    $policy: "Parallel",
    term: any
}

export function isParallel(term: any): term is ParallelTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Parallel") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules

Rewrite Parallel.term
Return result of term, blocked with m.blocked || result.blocked

*/
export function rewriteParallel(m: Machine): Machine {
    if (!(isParallel(m.term))) { throw "expected ParallelTerm"; };
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    const steps = stepsMinusOne(resultOfTerm.steps);
    return m.copyWith({ term: resultOfTerm.term, blocked: resultOfTerm.blocked, steps: steps });
}
